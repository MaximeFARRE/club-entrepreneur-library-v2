import type { EmpruntAvecLivre } from "@/types";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

export interface ReminderResult {
  sent: number;
  failed: number;
  skipped: number;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function daysOverdue(datePrevue: string): number {
  const ms = Date.now() - new Date(datePrevue).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function buildOverdueEmail(loan: EmpruntAvecLivre): { subject: string; htmlContent: string } {
  const titre = loan.livres.titre;
  const retard = daysOverdue(loan.date_retour_prevue);
  const echeance = formatDate(loan.date_retour_prevue);

  const subject = `Rappel : « ${titre} » à rendre à la bibliothèque du Club`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #1a1a1a;">Bonjour ${loan.emprunteur},</h2>
      <p>Le livre que tu as emprunté à la bibliothèque du Club Entrepreneur est en retard de
      <strong>${retard} jour${retard > 1 ? "s" : ""}</strong>.</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Livre</td><td style="padding: 4px 0;"><strong>${titre}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Auteur</td><td style="padding: 4px 0;">${loan.livres.auteur}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">À rendre avant le</td><td style="padding: 4px 0;">${echeance}</td></tr>
      </table>
      <p>Merci de le rapporter dès que possible afin qu'un autre membre puisse en profiter.</p>
      <p style="color: #666; font-size: 13px; margin-top: 24px;">
        Ceci est un message automatique de la bibliothèque du Club Entrepreneur (Pôle Léonard de Vinci).
      </p>
    </div>`;

  return { subject, htmlContent };
}

async function sendEmail(
  to: { email: string; name: string },
  subject: string,
  htmlContent: string,
  apiKey: string,
  sender: { email: string; name: string }
): Promise<boolean> {
  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({ sender, to: [to], subject, htmlContent }),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error(`Brevo error (${res.status}) pour ${to.email}: ${detail}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Brevo request failed pour ${to.email}:`, err);
    return false;
  }
}

export async function sendOverdueReminders(
  loans: EmpruntAvecLivre[]
): Promise<ReminderResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME ?? "Club Entrepreneur";

  if (!apiKey || !senderEmail) {
    console.warn("[NOTIF] BREVO_API_KEY ou BREVO_SENDER_EMAIL manquant — envoi désactivé.");
    return { sent: 0, failed: 0, skipped: loans.length };
  }

  const sender = { email: senderEmail, name: senderName };
  const result: ReminderResult = { sent: 0, failed: 0, skipped: 0 };

  for (const loan of loans) {
    if (!loan.emprunteur_email) {
      result.skipped += 1;
      continue;
    }
    const { subject, htmlContent } = buildOverdueEmail(loan);
    const ok = await sendEmail(
      { email: loan.emprunteur_email, name: loan.emprunteur },
      subject,
      htmlContent,
      apiKey,
      sender
    );
    if (ok) result.sent += 1;
    else result.failed += 1;
  }

  return result;
}
