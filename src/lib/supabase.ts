import { createClient } from "@supabase/supabase-js";

let client: ReturnType<typeof createClient> | undefined;

// Service-role client — server-only, never import this from a "use client" file.
// Used to mint signed upload URLs and delete storage objects after our own
// app-level auth checks (there's no Supabase Auth session for RLS to key off).
export function supabaseAdmin() {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }
  return client;
}
