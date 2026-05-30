import { NextResponse } from "next/server";
import { getOverdueLoansForCron } from "@/services/emprunt.service";
import { sendOverdueReminders } from "@/services/notification.service";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const retardataires = await getOverdueLoansForCron();
  const result = await sendOverdueReminders(retardataires);

  console.log(
    `[CRON] ${retardataires.length} retard(s) — envoyés: ${result.sent}, échecs: ${result.failed}, ignorés: ${result.skipped}`
  );

  return NextResponse.json({
    ok: true,
    overdueCount: retardataires.length,
    ...result,
  });
}
