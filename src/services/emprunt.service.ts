import * as livreRepo from "@/repositories/livre.repository";
import * as historiqueRepo from "@/repositories/historique.repository";
import type { Emprunt, EmpruntAvecLivre, LoanStatus } from "@/types";

const LOAN_DURATION_DAYS = 30;
const ORANGE_THRESHOLD_DAYS = 7;

export async function processBorrow(
  livreId: number,
  emprunteur: string,
  emprunteurEmail: string,
  commentaire?: string
): Promise<void> {
  const livre = await livreRepo.getLivre(livreId);
  if (!livre) throw new Error("Livre introuvable.");
  if (livre.disponibilite !== "Disponible") {
    throw new Error(`Ce livre n'est pas disponible (statut : ${livre.disponibilite}).`);
  }

  const dateEmprunt = new Date();
  const dateRetourPrevue = new Date(dateEmprunt);
  dateRetourPrevue.setDate(dateRetourPrevue.getDate() + LOAN_DURATION_DAYS);

  await livreRepo.updateAvailability(livreId, "Indisponible", emprunteur);
  await historiqueRepo.addEmprunt({
    id_livre: livreId,
    emprunteur,
    emprunteur_email: emprunteurEmail,
    date_emprunt: dateEmprunt.toISOString(),
    date_retour_prevue: dateRetourPrevue.toISOString(),
    commentaire: commentaire ?? "",
  });
}

export async function processReturn(
  livreId: number,
  commentaire?: string
): Promise<void> {
  const livre = await livreRepo.getLivre(livreId);
  if (!livre) throw new Error("Livre introuvable.");
  if (livre.disponibilite !== "Indisponible") {
    throw new Error("Ce livre n'a pas d'emprunt actif.");
  }

  const now = new Date().toISOString();
  await livreRepo.updateAvailability(livreId, "Disponible", null);
  await historiqueRepo.closeLoan(livreId, now, commentaire);
}

export async function getOverdueLoans(): Promise<EmpruntAvecLivre[]> {
  const activeLoans = await historiqueRepo.getActiveLoans();
  const now = new Date();
  return activeLoans
    .filter((e) => new Date(e.date_retour_prevue) < now)
    .sort(
      (a, b) =>
        new Date(a.date_retour_prevue).getTime() -
        new Date(b.date_retour_prevue).getTime()
    );
}

export async function getActiveLoans(): Promise<EmpruntAvecLivre[]> {
  return historiqueRepo.getActiveLoans();
}

export async function getActiveLoanForBook(livreId: number): Promise<Emprunt | null> {
  return historiqueRepo.getActiveLoanForBook(livreId);
}

export async function getAllHistory(): Promise<EmpruntAvecLivre[]> {
  return historiqueRepo.getHistorique();
}

export async function getEmpruntsByBorrower(email: string): Promise<EmpruntAvecLivre[]> {
  return historiqueRepo.getEmpruntsByBorrower(email);
}

export async function getLoansByOwnerBooks(email: string): Promise<EmpruntAvecLivre[]> {
  return historiqueRepo.getLoansByOwnerBooks(email);
}

export function determineLoanStatus(
  dateRetour: string | null,
  dateRetourPrevue: string
): LoanStatus {
  const prevue = new Date(dateRetourPrevue);
  const retour = dateRetour ? new Date(dateRetour) : new Date();

  if (dateRetour) {
    return retour <= prevue ? "green" : "red";
  }

  const msLeft = prevue.getTime() - retour.getTime();
  const daysLeft = msLeft / (1000 * 60 * 60 * 24);
  if (daysLeft < 0) return "red";
  if (daysLeft <= ORANGE_THRESHOLD_DAYS) return "orange";
  return "green";
}

export async function getLoansForBook(livreId: number): Promise<Emprunt[]> {
  return historiqueRepo.getLoansForBook(livreId);
}
