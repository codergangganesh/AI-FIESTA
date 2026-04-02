import type { SupabaseClient } from "@supabase/supabase-js";

export type SecurityEventType =
  | "chat_request"
  | "chat_session_saved"
  | "chat_session_deleted"
  | "account_delete_requested"
  | "account_deleted"
  | "rate_limited"
  | "invalid_request";

export interface SecurityEventDetails {
  [key: string]: string | number | boolean | null | undefined;
}

export async function logSecurityEvent(
  supabase: SupabaseClient,
  eventType: SecurityEventType,
  details: SecurityEventDetails = {},
  userId?: string | null,
) {
  try {
    const effectiveUserId = userId ?? (await supabase.auth.getUser()).data.user?.id ?? null;

    const { error } = await supabase.from("security_events").insert({
      user_id: effectiveUserId,
      event_type: eventType,
      details,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to log security event:", error);
    }
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}