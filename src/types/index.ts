import type { Database } from "./supabase";

export type Livre = Database["public"]["Tables"]["livres"]["Row"];
export type InsertLivre = Database["public"]["Tables"]["livres"]["Insert"];
export type UpdateLivre = Database["public"]["Tables"]["livres"]["Update"];

export type Emprunt = Database["public"]["Tables"]["emprunts"]["Row"];
export type InsertEmprunt = Database["public"]["Tables"]["emprunts"]["Insert"];
export type UpdateEmprunt = Database["public"]["Tables"]["emprunts"]["Update"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type LoanStatus = "green" | "orange" | "red";

export type DisponibiliteFilter = "Disponible" | "Indisponible" | "Archivé";

export type EmpruntAvecLivre = Emprunt & {
  livres: Pick<Livre, "id" | "titre" | "auteur" | "couverture">;
};
