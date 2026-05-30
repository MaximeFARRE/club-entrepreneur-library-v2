"use server";

import { getCurrentUser } from "@/lib/auth";
import { updateProfileName } from "@/services/profile.service";
import { getLivre, deleteLivre } from "@/services/livre.service";
import { redirect } from "next/navigation";

export async function updateProfileNameAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const nom = (formData.get("nom") as string)?.trim();
  if (!nom) {
    redirect("/profil?error=missing_name");
  }

  try {
    await updateProfileName(user.id, nom);
  } catch (err) {
    redirect(`/profil?error=${encodeURIComponent((err as Error).message)}`);
  }

  redirect("/profil?success=profile_updated");
}

export async function deleteOwnerBookAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const id = Number(formData.get("id"));
  if (isNaN(id)) {
    redirect("/profil?error=invalid_id");
  }

  try {
    const book = await getLivre(id);
    if (!book) {
      throw new Error("Livre introuvable.");
    }

    if (book.proprietaire_email !== user.email) {
      throw new Error("Vous n'êtes pas autorisé à supprimer ce livre.");
    }

    if (book.disponibilite === "Indisponible") {
      throw new Error("Impossible de supprimer un livre en cours d'emprunt.");
    }

    await deleteLivre(id);
  } catch (err) {
    redirect(`/profil?error=${encodeURIComponent((err as Error).message)}`);
  }

  redirect("/profil?success=book_deleted");
}
