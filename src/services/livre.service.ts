import * as livreRepo from "@/repositories/livre.repository";
import type { InsertLivre, Livre, UpdateLivre } from "@/types";

export async function getAllLivres(
  filter?: "Disponible" | "Indisponible" | "Archivé"
): Promise<Livre[]> {
  return livreRepo.getLivres(filter);
}

export async function getAllLivresAvecArchives(): Promise<Livre[]> {
  return livreRepo.getLivresAvecArchives();
}

export async function getLivre(id: number): Promise<Livre | null> {
  return livreRepo.getLivre(id);
}

export async function createLivre(data: InsertLivre): Promise<Livre> {
  if (!data.titre?.trim()) throw new Error("Le titre est requis.");
  if (!data.auteur?.trim()) throw new Error("L'auteur est requis.");
  if (!data.proprietaire?.trim()) throw new Error("Le propriétaire est requis.");
  if (!data.proprietaire_email?.trim()) throw new Error("L'email du propriétaire est requis.");
  if (!isValidEmail(data.proprietaire_email)) throw new Error("L'email du propriétaire est invalide.");

  return livreRepo.addLivre({
    ...data,
    disponibilite: "Disponible",
    emprunte_par: null,
  });
}

export async function updateLivre(
  id: number,
  data: UpdateLivre
): Promise<Livre> {
  return livreRepo.updateLivre(id, data);
}

export async function archiveLivre(id: number): Promise<void> {
  return livreRepo.archiveLivre(id);
}

export async function deleteLivre(id: number): Promise<void> {
  return livreRepo.deleteLivre(id);
}

export async function getLivresByOwner(email: string): Promise<Livre[]> {
  return livreRepo.getLivresByOwner(email);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
