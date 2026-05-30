"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { getOverdueLoans } from "@/services/emprunt.service";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function remindOverdueAction() {
  await requireAdmin();
  const retardataires = await getOverdueLoans();
  console.log(`[RELANCE MANUELLE] ${retardataires.length} emprunt(s) en retard`);
  redirect(`/?reminded=${retardataires.length}`);
}
