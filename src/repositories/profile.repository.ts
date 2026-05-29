import { createClient } from "@/lib/supabase/server";

export async function updateProfileName(userId: string, nom: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ nom })
    .eq("id", userId);

  if (error) throw new Error(`updateProfileName: ${error.message}`);
}
