import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getEdgeFunctionBaseUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return null;
  }

  return `${supabaseUrl.replace(/\/$/, "")}/functions/v1`;
}

async function proxyToEdge(
  path: string,
  method: "GET" | "POST" | "DELETE",
  userId: string,
  req: NextRequest,
  body?: unknown,
) {
  const edgeBaseUrl = getEdgeFunctionBaseUrl();
  const edgeSecret = process.env.EDGE_FUNCTION_SHARED_SECRET;

  if (!edgeBaseUrl || !edgeSecret) {
    return Response.json(
      { error: "Edge function is not configured." },
      { status: 500 },
    );
  }

  const response = await fetch(`${edgeBaseUrl}${path}${req.nextUrl.search}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-edge-secret": edgeSecret,
      "x-user-id": userId,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseText = await response.text();

  return new Response(responseText, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return proxyToEdge("/chat-sessions", "GET", user.id, req);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  return proxyToEdge("/chat-sessions", "POST", user.id, req, body);
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  return proxyToEdge("/chat-sessions", "DELETE", user.id, req, body);
}
