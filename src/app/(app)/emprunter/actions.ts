"use server";

import { processBorrow } from "@/services/emprunt.service";
import { redirect } from "next/navigation";

export async function borrowBookAction(formData: FormData) {
  const livreId = Number(formData.get("livre_id"));
  const emprunteur = (formData.get("emprunteur") as string)?.trim();
  const emprunteurEmail = (formData.get("emprunteur_email") as string)?.trim();
  const commentaire = (formData.get("commentaire") as string)?.trim();

  if (!livreId || !emprunteur || !emprunteurEmail) {
    redirect("/emprunter?error=missing_fields");
  }

  try {
    await processBorrow(livreId, emprunteur, emprunteurEmail, commentaire);
  } catch (err) {
    redirect(`/emprunter?error=${encodeURIComponent((err as Error).message)}`);
  }

  redirect("/catalogue");
}
