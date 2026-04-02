import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export type SecurityEventType =
  | "chat_request"
  | "chat_session_saved"
  | "chat_session_deleted"
  | "account_delete_requested"
  | "account_deleted"
  | "rate_limited"
  | "invalid_request";

export type SecurityEventDetails = Record<
  string,
  string | number | boolean | null | undefined
>;

export function createAdminClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase admin configuration.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function isAuthorizedEdgeRequest(req: Request) {
  const sharedSecret = Deno.env.get("EDGE_FUNCTION_SHARED_SECRET");
  const providedSecret = req.headers.get("x-edge-secret");

  return Boolean(sharedSecret && providedSecret === sharedSecret);
}

export async function logSecurityEvent(
  admin: SupabaseClient,
  eventType: SecurityEventType,
  details: SecurityEventDetails = {},
  userId?: string | null,
) {
  const { error } = await admin.from("security_events").insert({
    user_id: userId ?? null,
    event_type: eventType,
    details,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Failed to log security event:", error);
  }
}

