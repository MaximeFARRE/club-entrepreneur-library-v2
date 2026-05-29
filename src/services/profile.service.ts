import * as profileRepo from "@/repositories/profile.repository";

export async function updateProfileName(userId: string, nom: string): Promise<void> {
  const cleanNom = nom?.trim();
  if (!cleanNom) {
    throw new Error("Le nom ne peut pas être vide.");
  }
  if (cleanNom.length < 2) {
    throw new Error("Le nom doit contenir au moins 2 caractères.");
  }
  await profileRepo.updateProfileName(userId, cleanNom);
}
