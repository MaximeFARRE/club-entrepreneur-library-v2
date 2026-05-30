"use server";

import { processReturn } from "@/services/emprunt.service";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function returnBookAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const livreId = Number(formData.get("livre_id"));
  const commentaire = (formData.get("commentaire") as string)?.trim();

  if (!livreId) {
    redirect("/rendre?error=missing_fields");
  }

  try {
    await processReturn(livreId, commentaire);
  } catch (err) {
    redirect(`/rendre?error=${encodeURIComponent((err as Error).message)}`);
  }

  redirect("/catalogue");
}
