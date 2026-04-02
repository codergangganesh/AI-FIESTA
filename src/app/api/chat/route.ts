import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/user";
import { getRequestContext } from "@/lib/security/request-context";
import { rateLimit } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/audit-log";
import { validateChatPayload } from "@/lib/security/chat-validation";

function getEdgeFunctionBaseUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return null;
  }

  return `${supabaseUrl.replace(/\/$/, "")}/functions/v1`;
}

export async function POST(req: NextRequest) {
  const { supabase, user, error: authError } = await getAuthenticatedUser();
  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ipAddress, userAgent } = getRequestContext(req);
  const limiter = rateLimit(`chat:${user.id}:${ipAddress}`, 20, 60_000);
  if (!limiter.allowed) {
    await logSecurityEvent(supabase, "rate_limited", {
      route: "/api/chat",
      ipAddress,
      userAgent,
      limit: 20,
      windowMs: 60_000,
    });

    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded. Please retry later.",
      }),
      {
        status: 429,
        headers: {
          "Retry-After": String(limiter.retryAfterSeconds),
          "X-RateLimit-Limit": "20",
          "X-RateLimit-Remaining": String(limiter.remaining),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch (parseError) {
    await logSecurityEvent(supabase, "invalid_request", {
      route: "/api/chat",
      reason: "invalid_json",
      ipAddress,
      userAgent,
    });

    return new Response(
      JSON.stringify({
        error: "Invalid JSON in request body",
        details: parseError instanceof Error ? parseError.message : String(parseError),
      }),
      { status: 400 },
    );
  }

  const validation = validateChatPayload(body);
  if (validation.error || !validation.data) {
    await logSecurityEvent(supabase, "invalid_request", {
      route: "/api/chat",
      reason: validation.error ?? "invalid_payload",
      ipAddress,
      userAgent,
    });

    return new Response(
      JSON.stringify({
        error: validation.error ?? "Invalid request.",
      }),
      { status: 400 },
    );
  }

  const edgeBaseUrl = getEdgeFunctionBaseUrl();
  const edgeSecret = process.env.EDGE_FUNCTION_SHARED_SECRET;

  if (!edgeBaseUrl || !edgeSecret) {
    return new Response(
      JSON.stringify({
        error: "Edge function is not configured.",
        details: "Missing Supabase edge function settings.",
      }),
      { status: 500 },
    );
  }

  const response = await fetch(`${edgeBaseUrl}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-edge-secret": edgeSecret,
      "x-user-id": user.id,
      "x-request-ip": ipAddress,
      "x-request-user-agent": userAgent,
    },
    body: JSON.stringify(validation.data),
  });

  const responseText = await response.text();

  return new Response(responseText, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
