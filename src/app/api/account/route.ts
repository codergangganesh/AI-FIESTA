import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth/user";

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

  try {
    const admin = createAdminClient();

    const { error: sessionDeleteError } = await admin
      .from("chat_sessions")
      .delete()
      .eq("user_id", user.id);

    if (sessionDeleteError) {
      return Response.json(
        { error: "Failed to delete account data." },
        { status: 500 },
      );
    }

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteUserError) {
      return Response.json(
        { error: "Failed to delete account." },
        { status: 500 },
      );
    }

    await supabase.auth.signOut();

    return Response.json({ success: true }, { status: 200 });
  } catch (routeError) {
    const message =
      routeError instanceof Error ? routeError.message : "Account deletion failed.";

    return Response.json({ error: message }, { status: 500 });
  }
}
