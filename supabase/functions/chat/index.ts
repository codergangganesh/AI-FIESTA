// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

const MAX_RESPONSE_CHARS = 12_000;

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatPayload = {
  models: string[];
  messages: ChatMessage[];
  maxTokens: number;
  temperature: number;
};

type SecurityEventType =
  | "chat_request"
  | "rate_limited"
  | "invalid_request";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function insertSecurityEvent(
  eventType: SecurityEventType,
  details: Record<string, string | number | boolean | null | undefined>,
  userId: string | null,
) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase config for audit logging");
    return;
  }

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/security_events`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      user_id: userId,
      event_type: eventType,
      details,
      created_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    console.error("Failed to insert security event:", await response.text());
  }
}

async function readJsonBody(req: Request): Promise<ChatPayload> {
  const body = await req.json();

  if (
    !body ||
    typeof body !== "object" ||
    !Array.isArray((body as ChatPayload).models) ||
    !Array.isArray((body as ChatPayload).messages)
  ) {
    throw new Error("Invalid payload shape.");
  }

  return body as ChatPayload;
}

async function fetchCompletion(
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  maxTokens: number,
  temperature: number,
) {
  let response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",
      "X-Title": Deno.env.get("NEXT_PUBLIC_SITE_NAME") ?? "AI Fiesta",
      Connection: "keep-alive",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: true,
    }),
  });

  if (response.ok || response.status !== 429) {
    return response;
  }

  let retryDelay = 2000;
  const maxRetries = 3;

  for (let retry = 0; retry < maxRetries; retry++) {
    await delay(retryDelay);

    const retryResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",
        "X-Title": Deno.env.get("NEXT_PUBLIC_SITE_NAME") ?? "AI Fiesta",
        Connection: "keep-alive",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        max_tokens: maxTokens,
        temperature,
        stream: true,
      }),
    });

    if (retryResponse.ok) {
      return retryResponse;
    }

    response = retryResponse;
    retryDelay *= 2;
  }

  return response;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const edgeSecret = Deno.env.get("EDGE_FUNCTION_SHARED_SECRET");
  const providedSecret = req.headers.get("x-edge-secret");

  if (!edgeSecret || providedSecret !== edgeSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = req.headers.get("x-user-id");
  const ipAddress = req.headers.get("x-request-ip") ?? "unknown";
  const userAgent = req.headers.get("x-request-user-agent") ?? "unknown";

  let payload: ChatPayload;
  try {
    payload = await readJsonBody(req);
  } catch (error) {
    await insertSecurityEvent(
      "invalid_request",
      {
        route: "/api/chat",
        reason: error instanceof Error ? error.message : String(error),
        ipAddress,
        userAgent,
      },
      userId,
    );

    return Response.json(
      {
        error: "Invalid request body.",
      },
      { status: 400 },
    );
  }

  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) {
    return Response.json(
      {
        error: "Missing OPENROUTER_API_KEY",
      },
      { status: 500 },
    );
  }

  await insertSecurityEvent(
    "chat_request",
    {
      route: "/api/chat",
      modelCount: payload.models.length,
      messageCount: payload.messages.length,
      maxTokens: payload.maxTokens,
      temperature: payload.temperature,
      ipAddress,
      userAgent,
    },
    userId,
  );

  const startTime = Date.now();
  const results: Array<{ model: string; content?: string; error?: string; details?: string }> = [];

  for (let i = 0; i < payload.models.length; i++) {
    const modelId = payload.models[i];

    try {
      const response = await fetchCompletion(
        apiKey,
        modelId,
        payload.messages,
        payload.maxTokens,
        payload.temperature,
      );

      if (!response.ok) {
        const errorText = await response.text();
        results.push({
          model: modelId,
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: errorText || `Failed to get response from ${modelId}`,
        });
        continue;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let content = "";

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (!line.startsWith("data:")) {
                continue;
              }

              const data = line.slice(5).trim();
              if (data === "[DONE]") {
                continue;
              }

              try {
                const json = JSON.parse(data);
                const token = json.choices[0]?.delta?.content;
                if (token) {
                  content += token;
                  if (content.length >= MAX_RESPONSE_CHARS) {
                    content = content.slice(0, MAX_RESPONSE_CHARS);
                    break;
                  }
                }
              } catch (parseError) {
                console.error("Error parsing SSE:", parseError);
              }
            }

            if (content.length >= MAX_RESPONSE_CHARS) {
              break;
            }
          }
        } finally {
          reader.releaseLock();
        }
      }

      results.push({ model: modelId, content });
    } catch (error) {
      results.push({
        model: modelId,
        error: error instanceof Error ? error.message : String(error),
        details: "Failed to get response from this model",
      });
    }

    if (i < payload.models.length - 1) {
      await delay(payload.models.length > 2 ? 800 : 500);
    }
  }

  return Response.json({
    results,
    responseTime: (Date.now() - startTime) / 1000,
  });
});


