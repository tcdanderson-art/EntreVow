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
