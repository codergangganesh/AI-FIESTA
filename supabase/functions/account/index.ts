import { createAdminClient, isAuthorizedEdgeRequest, logSecurityEvent } from "../_shared.ts";

function responseJson(body: unknown, status = 200) {
  return Response.json(body, { status });
}

async function handleDelete(req: Request) {
  const admin = createAdminClient();
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return responseJson({ error: "Unauthorized" }, 401);
  }

  await logSecurityEvent(admin, "account_delete_requested", {
    route: "/api/account",
  }, userId);

  const { error: sessionDeleteError } = await admin
    .from("chat_sessions")
    .delete()
    .eq("user_id", userId);

  if (sessionDeleteError) {
    return responseJson({ error: "Failed to delete account data." }, 500);
  }

  const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
  if (deleteUserError) {
    return responseJson({ error: "Failed to delete account." }, 500);
  }

  await logSecurityEvent(admin, "account_deleted", {
    route: "/api/account",
  }, userId);

  return responseJson({ success: true });
}

Deno.serve(async (req) => {
  if (!isAuthorizedEdgeRequest(req)) {
    return responseJson({ error: "Unauthorized" }, 401);
  }

  if (req.method === "POST") {
    return handleDelete(req);
  }

  if (req.method === "DELETE") {
    return handleDelete(req);
  }

  return responseJson({ error: "Method Not Allowed" }, 405);
});
