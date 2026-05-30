import { NextResponse } from "next/server";
import { sendMonthlyRecaps } from "@/services/notification.service";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendMonthlyRecaps();

  console.log(
    `[CRON] Récap mensuel — envoyés: ${result.sent}, échecs: ${result.failed}`
  );

  return NextResponse.json({ ok: true, ...result });
}
