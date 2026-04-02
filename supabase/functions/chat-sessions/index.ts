import { createAdminClient, isAuthorizedEdgeRequest, logSecurityEvent } from "../_shared.ts";

type ChatSessionPayload = {
  id?: string;
  message?: string;
  timestamp?: string | Date;
  selectedModels?: string[];
  responses?: unknown[];
  bestResponse?: string;
  responseTime?: number;
};

function responseJson(body: unknown, status = 200) {
  return Response.json(body, { status });
}

function getUserId(req: Request) {
  return req.headers.get("x-user-id");
}

async function handleGet(req: Request) {
  const admin = createAdminClient();
  const userId = getUserId(req);

  if (!userId) {
    return responseJson({ error: "Unauthorized" }, 401);
  }

  const url = new URL(req.url);
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get("limit") || "50", 10)));
  const offset = (page - 1) * limit;

  const { data, count, error } = await admin
    .from("chat_sessions")
    .select("id, message, timestamp, selected_models, responses, best_response, response_time", {
      count: "exact",
    })
    .eq("user_id", userId)
    .order("timestamp", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return responseJson({ error: error.message }, 500);
  }

  const sessions = (data ?? []).map((session) => ({
    id: session.id,
    message: session.message,
    responses: session.responses,
    timestamp: session.timestamp,
    selectedModels: session.selected_models,
    bestResponse: session.best_response,
    responseTime: session.response_time,
  }));

  return responseJson({
    sessions,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      hasMore: offset + limit < (count ?? 0),
    },
  });
}

async function handlePost(req: Request) {
  const admin = createAdminClient();
  const userId = getUserId(req);

  if (!userId) {
    return responseJson({ error: "Unauthorized" }, 401);
  }

  let session: ChatSessionPayload;
  try {
    session = await req.json();
  } catch {
    await logSecurityEvent(admin, "invalid_request", {
      route: "/api/chat-sessions",
      method: "POST",
      reason: "invalid_json",
    }, userId);
    return responseJson({ error: "Invalid JSON in request body" }, 400);
  }

  if (!session.id || !session.message || !session.timestamp) {
    await logSecurityEvent(admin, "invalid_request", {
      route: "/api/chat-sessions",
      method: "POST",
      reason: "missing_required_fields",
    }, userId);
    return responseJson({ error: "Missing required session fields." }, 400);
  }

  const timestamp = new Date(session.timestamp);
  if (Number.isNaN(timestamp.getTime())) {
    await logSecurityEvent(admin, "invalid_request", {
      route: "/api/chat-sessions",
      method: "POST",
      reason: "invalid_timestamp",
    }, userId);
    return responseJson({ error: "Invalid timestamp format" }, 400);
  }

  const responses = Array.isArray(session.responses) ? session.responses : [];
  const selectedModels = Array.isArray(session.selectedModels) ? session.selectedModels : [];

  const { error: insertError } = await admin.from("chat_sessions").insert({
    id: session.id,
    user_id: userId,
    message: session.message,
    responses,
    timestamp: timestamp.toISOString(),
    selected_models: selectedModels,
    best_response: session.bestResponse,
    response_time: session.responseTime,
    created_at: new Date().toISOString(),
  });

  if (insertError) {
    if (insertError.code === "23505") {
      const { error: updateError } = await admin
        .from("chat_sessions")
        .update({
          message: session.message,
          responses,
          timestamp: timestamp.toISOString(),
          selected_models: selectedModels,
          best_response: session.bestResponse,
          response_time: session.responseTime,
        })
        .eq("id", session.id)
        .eq("user_id", userId);

      if (updateError) {
        return responseJson({ error: updateError.message }, 500);
      }
    } else {
      return responseJson({ error: insertError.message }, 500);
    }
  }

  await logSecurityEvent(admin, "chat_session_saved", {
    sessionId: session.id,
    messageLength: session.message.length,
    responseCount: responses.length,
    selectedModelCount: selectedModels.length,
  }, userId);

  return responseJson({ success: true });
}

async function handleDelete(req: Request) {
  const admin = createAdminClient();
  const userId = getUserId(req);

  if (!userId) {
    return responseJson({ error: "Unauthorized" }, 401);
  }

  let sessionId = "";
  try {
    const body = (await req.json()) as { sessionId?: string };
    sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  } catch {
    await logSecurityEvent(admin, "invalid_request", {
      route: "/api/chat-sessions",
      method: "DELETE",
      reason: "invalid_json",
    }, userId);
    return responseJson({ error: "Invalid JSON in request body" }, 400);
  }

  if (!sessionId) {
    await logSecurityEvent(admin, "invalid_request", {
      route: "/api/chat-sessions",
      method: "DELETE",
      reason: "missing_session_id",
    }, userId);
    return responseJson({ error: "Missing sessionId" }, 400);
  }

  const { error } = await admin
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) {
    return responseJson({ error: error.message }, 500);
  }

  await logSecurityEvent(admin, "chat_session_deleted", {
    sessionId,
  }, userId);

  return responseJson({ success: true });
}

Deno.serve(async (req) => {
  if (!isAuthorizedEdgeRequest(req)) {
    return responseJson({ error: "Unauthorized" }, 401);
  }

  if (req.method === "GET") {
    return handleGet(req);
  }

  if (req.method === "POST") {
    return handlePost(req);
  }

  if (req.method === "DELETE") {
    return handleDelete(req);
  }

  return responseJson({ error: "Method Not Allowed" }, 405);
});
