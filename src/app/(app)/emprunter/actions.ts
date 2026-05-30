"use server";

import { processBorrow } from "@/services/emprunt.service";
import { getCurrentUser, getUserProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function borrowBookAction(formData: FormData) {
  const [user, profile] = await Promise.all([getCurrentUser(), getUserProfile()]);
  if (!user) {
    redirect("/login");
  }

  const livreId = Number(formData.get("livre_id"));
  const emprunteur = profile?.nom || user.email || "Membre";
  const emprunteurEmail = user.email || "";
  const telephone = (formData.get("telephone") as string)?.trim();
  const commentaire = (formData.get("commentaire") as string)?.trim();

  if (!livreId || !telephone) {
    redirect("/emprunter?error=missing_fields");
  }

  try {
    await processBorrow(livreId, emprunteur, emprunteurEmail, telephone, commentaire);
  } catch (err) {
    redirect(`/emprunter?error=${encodeURIComponent((err as Error).message)}`);
  }

  redirect("/catalogue");
}
