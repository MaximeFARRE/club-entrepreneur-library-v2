// Auto-generated — run `npm run gen:types` after linking Supabase project
// npx supabase gen types typescript --project-id <ref> > src/types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      livres: {
        Row: {
          id: number;
          titre: string;
          auteur: string;
          categorie: string | null;
          proprietaire: string;
          proprietaire_email: string;
          resume: string | null;
          couverture: string | null;
          disponibilite: "Disponible" | "Indisponible" | "Archivé";
          emprunte_par: string | null;
          date_ajout: string;
        };
        Insert: {
          id?: never;
          titre: string;
          auteur: string;
          categorie?: string | null;
          proprietaire: string;
          proprietaire_email: string;
          resume?: string | null;
          couverture?: string | null;
          disponibilite?: "Disponible" | "Indisponible" | "Archivé";
          emprunte_par?: string | null;
          date_ajout?: string;
        };
        Update: {
          id?: never;
          titre?: string;
          auteur?: string;
          categorie?: string | null;
          proprietaire?: string;
          proprietaire_email?: string;
          resume?: string | null;
          couverture?: string | null;
          disponibilite?: "Disponible" | "Indisponible" | "Archivé";
          emprunte_par?: string | null;
          date_ajout?: string;
        };
      };
      emprunts: {
        Row: {
          id: number;
          id_livre: number;
          emprunteur: string;
          emprunteur_email: string;
          date_emprunt: string;
          date_retour_prevue: string;
          date_retour: string | null;
          commentaire: string | null;
        };
        Insert: {
          id?: never;
          id_livre: number;
          emprunteur: string;
          emprunteur_email: string;
          date_emprunt?: string;
          date_retour_prevue: string;
          date_retour?: string | null;
          commentaire?: string | null;
        };
        Update: {
          id?: never;
          id_livre?: number;
          emprunteur?: string;
          emprunteur_email?: string;
          date_emprunt?: string;
          date_retour_prevue?: string;
          date_retour?: string | null;
          commentaire?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          role: "admin" | "member";
          nom: string | null;
        };
        Insert: {
          id: string;
          role?: "admin" | "member";
          nom?: string | null;
        };
        Update: {
          id?: string;
          role?: "admin" | "member";
          nom?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
