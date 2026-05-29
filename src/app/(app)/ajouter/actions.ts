"use server";

import { requireAdmin } from "@/lib/auth";
import { createLivre } from "@/services/livre.service";
import { lookupISBN } from "@/services/isbn.service";
import { redirect } from "next/navigation";

export async function addBookAction(formData: FormData) {
  await requireAdmin();

  const data = {
    titre: (formData.get("titre") as string)?.trim(),
    auteur: (formData.get("auteur") as string)?.trim(),
    categorie: (formData.get("categorie") as string)?.trim() || null,
    proprietaire: (formData.get("proprietaire") as string)?.trim(),
    proprietaire_email: (formData.get("proprietaire_email") as string)?.trim(),
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
): Promise<{ titre: string; auteur: string; resume: string | null; couverture: string | null } | null> {
  await requireAdmin();
  return lookupISBN(isbn);
}
