import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVER-ONLY client using the service role key — bypasses RLS entirely.
// Never import this in a Client Component or anything that ships to the
// browser. Only call it after verifying the current user is an admin
// (see the is_admin check in /admin's page.tsx).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
