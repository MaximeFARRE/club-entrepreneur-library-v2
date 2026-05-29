"use server";

import { getCurrentUser } from "@/lib/auth";
import { updateProfileName } from "@/services/profile.service";
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
