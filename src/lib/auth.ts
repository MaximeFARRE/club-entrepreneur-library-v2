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

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return null;
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
