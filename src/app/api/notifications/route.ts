import { NextResponse } from "next/server";
import { getOverdueLoans } from "@/services/emprunt.service";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const retardataires = await getOverdueLoans();

  // Placeholder — notifications désactivées (pas de Resend)
  // Chaque emprunt en retard est loggé pour audit
  const count = retardataires.length;
  console.log(`[CRON] ${count} emprunt(s) en retard détecté(s)`);

  return NextResponse.json({
    ok: true,
    overdueCount: count,
    loans: retardataires.map((e) => ({
      livre: e.livres.titre,
      emprunteur: e.emprunteur,
      email: e.emprunteur_email,
      prevue: e.date_retour_prevue,
    })),
  });
}

// Route POST pour le bouton "Relancer" du dashboard
export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const retardataires = await getOverdueLoans();
  console.log(`[RELANCE MANUELLE] ${retardataires.length} emprunt(s) en retard`);

  return NextResponse.json({ ok: true, sent: retardataires.length });
}
