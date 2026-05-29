import type { Database } from "./supabase";

type LivreRow = Database["public"]["Tables"]["livres"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

// Supabase génère `string` pour les colonnes avec CHECK constraint — on surtype ici
export type Disponibilite = "Disponible" | "Indisponible" | "Archivé";
export type UserRole = "admin" | "member";

export type Livre = Omit<LivreRow, "disponibilite"> & {
  disponibilite: Disponibilite;
};

export type InsertLivre = Omit<
  Database["public"]["Tables"]["livres"]["Insert"],
  "disponibilite"
> & {
  disponibilite?: Disponibilite;
};

export type UpdateLivre = Omit<
  Database["public"]["Tables"]["livres"]["Update"],
  "disponibilite"
> & {
  disponibilite?: Disponibilite;
};

export type Emprunt = Database["public"]["Tables"]["emprunts"]["Row"];
export type InsertEmprunt = Database["public"]["Tables"]["emprunts"]["Insert"];
export type UpdateEmprunt = Database["public"]["Tables"]["emprunts"]["Update"];

export type Profile = Omit<ProfileRow, "role"> & { role: UserRole };

export type LoanStatus = "green" | "orange" | "red";

export type DisponibiliteFilter = Disponibilite;

export type EmpruntAvecLivre = Emprunt & {
  livres: Pick<Livre, "id" | "titre" | "auteur" | "couverture">;
};
