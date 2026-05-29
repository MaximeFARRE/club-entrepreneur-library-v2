import { createClient } from "@/lib/supabase/server";
import type { Emprunt, EmpruntAvecLivre, InsertEmprunt } from "@/types";

export async function getHistorique(): Promise<EmpruntAvecLivre[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("emprunts")
    .select("*, livres(id, titre, auteur, couverture)")
    .order("date_emprunt", { ascending: false });

  if (error) throw new Error(`getHistorique: ${error.message}`);
  return data as EmpruntAvecLivre[];
}

export async function getActiveLoans(): Promise<EmpruntAvecLivre[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("emprunts")
    .select("*, livres(id, titre, auteur, couverture)")
    .is("date_retour", null)
    .order("date_emprunt", { ascending: false });

  if (error) throw new Error(`getActiveLoans: ${error.message}`);
  return data as EmpruntAvecLivre[];
}

export async function getActiveLoanForBook(livreId: number): Promise<Emprunt | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("emprunts")
    .select("*")
    .eq("id_livre", livreId)
    .is("date_retour", null)
    .single();

  if (error) return null;
  return data;
}

export async function getLastLoan(livreId: number): Promise<Emprunt | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("emprunts")
    .select("*")
    .eq("id_livre", livreId)
    .order("date_emprunt", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

export async function addEmprunt(data: InsertEmprunt): Promise<Emprunt> {
  const supabase = await createClient();
  const { data: emprunt, error } = await supabase
    .from("emprunts")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`addEmprunt: ${error.message}`);
  return emprunt;
}

export async function closeLoan(
  livreId: number,
  dateRetour: string,
  commentaire?: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("emprunts")
    .update({ date_retour: dateRetour, commentaire: commentaire ?? "" })
    .eq("id_livre", livreId)
    .is("date_retour", null);

  if (error) throw new Error(`closeLoan: ${error.message}`);
}

export async function deleteLoansForBook(livreId: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("emprunts")
    .delete()
    .eq("id_livre", livreId);

  if (error) throw new Error(`deleteLoansForBook: ${error.message}`);
}

export async function getEmpruntsByBorrower(email: string): Promise<EmpruntAvecLivre[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("emprunts")
    .select("*, livres(id, titre, auteur, couverture)")
    .eq("emprunteur_email", email)
    .order("date_emprunt", { ascending: false });

  if (error) throw new Error(`getEmpruntsByBorrower: ${error.message}`);
  return data as EmpruntAvecLivre[];
}

export async function getLoansByOwnerBooks(email: string): Promise<EmpruntAvecLivre[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("emprunts")
    .select("*, livres!inner(id, titre, auteur, couverture, proprietaire_email)")
    .eq("livres.proprietaire_email", email)
    .order("date_emprunt", { ascending: false });

  if (error) throw new Error(`getLoansByOwnerBooks: ${error.message}`);
  return data as EmpruntAvecLivre[];
}

export async function getLoansForBook(livreId: number): Promise<Emprunt[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("emprunts")
    .select("*")
    .eq("id_livre", livreId)
    .order("date_emprunt", { ascending: false });

  if (error) throw new Error(`getLoansForBook: ${error.message}`);
  return data as Emprunt[];
}
