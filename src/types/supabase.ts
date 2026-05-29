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
        Relationships: [
          {
            foreignKeyName: "emprunts_id_livre_fkey";
            columns: ["id"];
            isOneToOne: false;
            referencedRelation: "emprunts";
            referencedColumns: ["id_livre"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "emprunts_id_livre_fkey";
            columns: ["id_livre"];
            isOneToOne: false;
            referencedRelation: "livres";
            referencedColumns: ["id"];
          },
        ];
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
          id_livre: number;
          emprunteur: string;
          emprunteur_email: string;
          date_emprunt?: string;
          date_retour_prevue: string;
          date_retour?: string | null;
          commentaire?: string | null;
        };
        Update: {
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
        Relationships: [];
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
          role?: "admin" | "member";
          nom?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
