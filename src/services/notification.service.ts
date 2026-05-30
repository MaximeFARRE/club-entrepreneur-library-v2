import type { EmpruntAvecLivre } from "@/types";
import { getActiveContributions } from "@/repositories/livre.repository";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

export interface ReminderResult {
  sent: number;
  failed: number;
  skipped: number;
}

interface BrevoConfig {
  apiKey: string;
  sender: { email: string; name: string };
}

function getBrevoConfig(): BrevoConfig | null {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME ?? "Club Entrepreneur";
  if (!apiKey || !senderEmail) return null;
  return { apiKey, sender: { email: senderEmail, name: senderName } };
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
  const config = getBrevoConfig();
  if (!config) {
    console.warn("[NOTIF] BREVO_API_KEY ou BREVO_SENDER_EMAIL manquant — envoi désactivé.");
    return { sent: 0, failed: 0, skipped: loans.length };
  }

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
      config.apiKey,
      config.sender
    );
    if (ok) result.sent += 1;
    else result.failed += 1;
  }

  return result;
}

function buildMonthlyRecapEmail(name: string, count: number): { subject: string; htmlContent: string } {
  const subject = "Merci pour ta contribution à la bibliothèque du Club 📚";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #1a1a1a;">Merci ${name} !</h2>
      <p>Grâce à toi, la bibliothèque du Club Entrepreneur s'enrichit. Tu as partagé
      <strong>${count} livre${count > 1 ? "s" : ""}</strong> avec les autres membres — bravo et merci pour ta générosité !</p>
      <p>Et toi, tu as déjà trouvé ta prochaine lecture ? Des dizaines d'ouvrages t'attendent :
      passe sur l'app pour <strong>emprunter un livre</strong> et continuer à faire vivre le partage.</p>
      <p style="color: #666; font-size: 13px; margin-top: 24px;">
        Ceci est un message automatique de la bibliothèque du Club Entrepreneur (Pôle Léonard de Vinci).
      </p>
    </div>`;

  return { subject, htmlContent };
}

export interface BorrowContext {
  livreTitre: string;
  livreAuteur: string;
  dateRetourPrevue: string;
  owner: { name: string; email: string };
  borrower: { name: string; email: string; telephone: string };
}

function buildBorrowerEmail(ctx: BorrowContext): { subject: string; htmlContent: string } {
  const subject = `Emprunt confirmé : « ${ctx.livreTitre} »`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #1a1a1a;">Bonjour ${ctx.borrower.name},</h2>
      <p>Ton emprunt de <strong>${ctx.livreTitre}</strong> (${ctx.livreAuteur}) est bien enregistré.
      À rendre avant le <strong>${formatDate(ctx.dateRetourPrevue)}</strong>.</p>
      <p>Pour organiser la remise du livre, voici le contact du propriétaire :</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Propriétaire</td><td style="padding: 4px 0;"><strong>${ctx.owner.name}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Email</td><td style="padding: 4px 0;"><a href="mailto:${ctx.owner.email}">${ctx.owner.email}</a></td></tr>
      </table>
      <p>Contacte-le pour convenir d'un point de rendez-vous. Bonne lecture !</p>
      <p style="color: #666; font-size: 13px; margin-top: 24px;">
        Message automatique de la bibliothèque du Club Entrepreneur (Pôle Léonard de Vinci).
      </p>
    </div>`;
  return { subject, htmlContent };
}

function buildOwnerEmail(ctx: BorrowContext): { subject: string; htmlContent: string } {
  const subject = `« ${ctx.livreTitre} » vient d'être emprunté`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #1a1a1a;">Bonjour ${ctx.owner.name},</h2>
      <p>Ton livre <strong>${ctx.livreTitre}</strong> (${ctx.livreAuteur}) vient d'être emprunté
      par un membre. Retour prévu le <strong>${formatDate(ctx.dateRetourPrevue)}</strong>.</p>
      <p>Pour organiser la remise du livre, voici le contact de l'emprunteur :</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Emprunteur</td><td style="padding: 4px 0;"><strong>${ctx.borrower.name}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Email</td><td style="padding: 4px 0;"><a href="mailto:${ctx.borrower.email}">${ctx.borrower.email}</a></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Téléphone</td><td style="padding: 4px 0;">${ctx.borrower.telephone}</td></tr>
      </table>
      <p>Contacte-le pour convenir d'un point de rendez-vous. Merci de faire vivre le partage !</p>
      <p style="color: #666; font-size: 13px; margin-top: 24px;">
        Message automatique de la bibliothèque du Club Entrepreneur (Pôle Léonard de Vinci).
      </p>
    </div>`;
  return { subject, htmlContent };
}

export async function sendBorrowNotifications(ctx: BorrowContext): Promise<ReminderResult> {
  const config = getBrevoConfig();
  if (!config) {
    console.warn("[NOTIF] BREVO_API_KEY ou BREVO_SENDER_EMAIL manquant — envoi désactivé.");
    return { sent: 0, failed: 0, skipped: 2 };
  }

  const result: ReminderResult = { sent: 0, failed: 0, skipped: 0 };

  const recipients: { to: { email: string; name: string }; subject: string; htmlContent: string }[] = [];
  if (ctx.borrower.email) {
    const { subject, htmlContent } = buildBorrowerEmail(ctx);
    recipients.push({ to: { email: ctx.borrower.email, name: ctx.borrower.name }, subject, htmlContent });
  } else {
    result.skipped += 1;
  }
  if (ctx.owner.email) {
    const { subject, htmlContent } = buildOwnerEmail(ctx);
    recipients.push({ to: { email: ctx.owner.email, name: ctx.owner.name }, subject, htmlContent });
  } else {
    result.skipped += 1;
  }

  for (const r of recipients) {
    const ok = await sendEmail(r.to, r.subject, r.htmlContent, config.apiKey, config.sender);
    if (ok) result.sent += 1;
    else result.failed += 1;
  }

  return result;
}

export async function sendMonthlyRecaps(): Promise<ReminderResult> {
  const config = getBrevoConfig();
  if (!config) {
    console.warn("[NOTIF] BREVO_API_KEY ou BREVO_SENDER_EMAIL manquant — envoi désactivé.");
    return { sent: 0, failed: 0, skipped: 0 };
  }

  const contributions = await getActiveContributions();

  // Agrégation par membre (clé = email), en gardant un nom d'affichage.
  const byMember = new Map<string, { name: string; count: number }>();
  for (const { proprietaire, proprietaire_email } of contributions) {
    if (!proprietaire_email) continue;
    const entry = byMember.get(proprietaire_email);
    if (entry) entry.count += 1;
    else byMember.set(proprietaire_email, { name: proprietaire || "membre", count: 1 });
  }

  const result: ReminderResult = { sent: 0, failed: 0, skipped: 0 };

  for (const [email, { name, count }] of byMember) {
    const { subject, htmlContent } = buildMonthlyRecapEmail(name, count);
    const ok = await sendEmail({ email, name }, subject, htmlContent, config.apiKey, config.sender);
    if (ok) result.sent += 1;
    else result.failed += 1;
  }

  return result;
}
