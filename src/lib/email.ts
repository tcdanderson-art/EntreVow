import { Resend } from "resend";

function client() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY env var is not set");
  return new Resend(apiKey);
}

function fromAddress() {
  return process.env.RESEND_FROM_EMAIL ?? "Entrevow <onboarding@resend.dev>";
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await client().emails.send({
    from: fromAddress(),
    to,
    subject: "Reset your Entrevow password",
    html: `
      <p>Someone requested a password reset for your Entrevow account.</p>
      <p><a href="${resetUrl}">Click here to set a new password</a>. This link expires in 1 hour.</p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  });
}

export async function sendPaymentReceiptEmail(
  to: string,
  weddingTitle: string,
  tierLabel: string,
  amount: string,
  dashboardUrl: string
) {
  await client().emails.send({
    from: fromAddress(),
    to,
    subject: `Payment received — ${weddingTitle}`,
    html: `
      <p>Thanks! Your payment of ${amount} for the ${tierLabel} plan on ${weddingTitle} has gone through.</p>
      <p>Guest access is now live — guests can view their itinerary, RSVP, and everything else at their personal links.</p>
      <p><a href="${dashboardUrl}">View your dashboard</a></p>
    `,
  });
}

export async function sendGuestInviteEmail(
  to: string,
  guestName: string,
  weddingTitle: string,
  guestUrl: string
) {
  await client().emails.send({
    from: fromAddress(),
    to,
    subject: `Your invite: ${weddingTitle}`,
    html: `
      <p>Hi ${guestName},</p>
      <p>Here's your personal link for ${weddingTitle} — schedule, RSVP, and everything else you need for the day:</p>
      <p><a href="${guestUrl}">${guestUrl}</a></p>
    `,
  });
}
