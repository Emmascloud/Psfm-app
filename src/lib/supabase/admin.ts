import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVER-ONLY client using the service role key — bypasses RLS entirely.
// Never import this in a Client Component or anything that ships to the
// browser. Only call it after verifying the current user is an admin
// (see requireAdmin() in this file).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
