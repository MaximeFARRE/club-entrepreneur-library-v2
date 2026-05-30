import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Client service-role — contourne le RLS. À n'utiliser que côté serveur
// (jamais exposé au client), typiquement dans les routes cron sans session.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
