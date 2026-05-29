"use server";

import { createLivre } from "@/services/livre.service";
import { lookupISBN } from "@/services/isbn.service";
import { getCurrentUser, getUserProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function addBookAction(formData: FormData) {
  const [user, profile] = await Promise.all([getCurrentUser(), getUserProfile()]);

  if (!user) {
    redirect("/login");
  }

  const ownerName = profile?.nom || user.email || "Membre du Club";
  const ownerEmail = user.email || "";

  const data = {
    titre: (formData.get("titre") as string)?.trim(),
    auteur: (formData.get("auteur") as string)?.trim(),
    categorie: (formData.get("categorie") as string)?.trim() || null,
    proprietaire: ownerName,
    proprietaire_email: ownerEmail,
    resume: (formData.get("resume") as string)?.trim() || null,
    couverture: (formData.get("couverture") as string)?.trim() || null,
  };

  try {
    await createLivre(data);
  } catch (err) {
    redirect(`/ajouter?error=${encodeURIComponent((err as Error).message)}`);
  }

  redirect("/catalogue");
}

export async function isbnLookupAction(
  isbn: string
): Promise<{ titre: string; auteur: string; categorie: string | null; resume: string | null; couverture: string | null } | null> {
  return lookupISBN(isbn);
}
