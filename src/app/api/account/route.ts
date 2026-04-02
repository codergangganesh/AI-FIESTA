import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/user";

function getEdgeFunctionBaseUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return null;
  }

  return `${supabaseUrl.replace(/\/$/, "")}/functions/v1`;
}

export async function DELETE(req: NextRequest) {
  const { supabase, user, error } = await getAuthenticatedUser();

  if (error || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: string };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!password) {
    return Response.json({ error: "Password is required." }, { status: 400 });
  }

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email ?? "",
    password,
  });

  if (reauthError) {
    return Response.json({ error: "Incorrect password." }, { status: 401 });
  }

  const edgeBaseUrl = getEdgeFunctionBaseUrl();
  const edgeSecret = process.env.EDGE_FUNCTION_SHARED_SECRET;

  if (!edgeBaseUrl || !edgeSecret) {
    return Response.json(
      {
        error: "Edge function is not configured.",
      },
      { status: 500 },
    );
  }

  const response = await fetch(`${edgeBaseUrl}/account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-edge-secret": edgeSecret,
      "x-user-id": user.id,
    },
    body: JSON.stringify({
      route: "/api/account",
    }),
  });

  const responseText = await response.text();

  return new Response(responseText, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
