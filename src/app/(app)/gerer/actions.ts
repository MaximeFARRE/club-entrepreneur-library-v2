"use server";

import { requireAdmin } from "@/lib/auth";
import { updateLivre, archiveLivre, deleteLivre } from "@/services/livre.service";
import { deleteLoansForBook } from "@/repositories/historique.repository";
import { redirect } from "next/navigation";
import type { UpdateLivre } from "@/types";

export async function updateBookAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const data: UpdateLivre = {
    titre: (formData.get("titre") as string)?.trim() || undefined,
    auteur: (formData.get("auteur") as string)?.trim() || undefined,
    categorie: (formData.get("categorie") as string)?.trim() || null,
    proprietaire: (formData.get("proprietaire") as string)?.trim() || undefined,
    proprietaire_email: (formData.get("proprietaire_email") as string)?.trim() || undefined,
    resume: (formData.get("resume") as string)?.trim() || null,
    couverture: (formData.get("couverture") as string)?.trim() || null,
  };

  try {
    await updateLivre(id, data);
  } catch (err) {
    redirect(`/gerer?error=${encodeURIComponent((err as Error).message)}`);
  }

  redirect("/gerer");
}

export async function archiveBookAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  try {
    await archiveLivre(id);
  } catch (err) {
    redirect(`/gerer?error=${encodeURIComponent((err as Error).message)}`);
  }
  redirect("/gerer");
}

export async function deleteBookAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  try {
    await deleteLoansForBook(id);
    await deleteLivre(id);
  } catch (err) {
    redirect(`/gerer?error=${encodeURIComponent((err as Error).message)}`);
  }
  redirect("/gerer");
}
