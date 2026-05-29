import { createClient } from "@/lib/supabase/server";
import type { InsertLivre, Livre, UpdateLivre } from "@/types";

export async function getLivres(
  filter?: "Disponible" | "Indisponible" | "Archivé"
): Promise<Livre[]> {
  const supabase = await createClient();

  let query = supabase
    .from("livres")
    .select("*")
    .order("date_ajout", { ascending: false });

  if (filter) {
    query = query.eq("disponibilite", filter);
  } else {
    query = query.neq("disponibilite", "Archivé");
  }

  const { data, error } = await query;
  if (error) throw new Error(`getLivres: ${error.message}`);
  return data;
}

export async function getLivresAvecArchives(): Promise<Livre[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livres")
    .select("*")
    .order("date_ajout", { ascending: false });

  if (error) throw new Error(`getLivresAvecArchives: ${error.message}`);
  return data;
}

export async function getLivre(id: number): Promise<Livre | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livres")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function addLivre(data: InsertLivre): Promise<Livre> {
  const supabase = await createClient();
  const { data: livre, error } = await supabase
    .from("livres")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`addLivre: ${error.message}`);
  return livre;
}

export async function updateLivre(
  id: number,
  data: UpdateLivre
): Promise<Livre> {
  const supabase = await createClient();
  const { data: livre, error } = await supabase
    .from("livres")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`updateLivre: ${error.message}`);
  return livre;
}

export async function archiveLivre(id: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("livres")
    .update({ disponibilite: "Archivé", emprunte_par: null })
    .eq("id", id);

  if (error) throw new Error(`archiveLivre: ${error.message}`);
}

export async function deleteLivre(id: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("livres").delete().eq("id", id);
  if (error) throw new Error(`deleteLivre: ${error.message}`);
}

export async function updateAvailability(
  id: number,
  disponibilite: "Disponible" | "Indisponible",
  empruntePar: string | null
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("livres")
    .update({ disponibilite, emprunte_par: empruntePar })
    .eq("id", id);

  if (error) throw new Error(`updateAvailability: ${error.message}`);
}
