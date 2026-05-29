import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getUserProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    const defaultNom = user.user_metadata?.nom || user.email?.split("@")[0] || "Membre";
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        role: "member",
        nom: defaultNom,
      })
      .select()
      .single();

    if (!insertError && newProfile) {
      data = newProfile;
      error = null;
    }
  }

  if (error || !data) return null;
  // CHECK constraint in DB guarantees role is "admin" | "member"
  return data as Profile;
}

export async function getUserRole(): Promise<"admin" | "member" | null> {
  const profile = await getUserProfile();
  return profile?.role ?? null;
}

export async function requireAdmin(): Promise<void> {
  const role = await getUserRole();
  if (role !== "admin") {
    throw new Error("Accès refusé — réservé aux administrateurs.");
  }
}
