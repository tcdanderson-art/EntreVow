import webpush from "web-push";
import { db } from "@/lib/db";

let configured = false;

function ensureConfigured(publicKey: string, privateKey: string, subject: string) {
  if (configured) return;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? null;
}

interface PushRecipient {
  subscription_id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  access_code: string;
}

interface NotifyGuestsOptions {
  weddingId: number;
  visibleToGroups: string[];
  title: string;
  body: string;
  tag: string;
}

// Awaited by every caller, never fire-and-forget — this deployment has no
// waitUntil-style background-task API, and a serverless function that
// returns before the send completes would silently drop it. Correctness
// over latency, matching the same call made for billing receipt emails.
export async function notifyGuests({
  weddingId,
  visibleToGroups,
  title,
  body,
  tag,
}: NotifyGuestsOptions): Promise<void> {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return;
  ensureConfigured(publicKey, privateKey, subject);

  // Full-tier + paid guard is the send-side source of truth — belt-and-braces
  // alongside the subscribe route's own gate, in case a subscription outlives
  // a downgrade.
  const recipients = (await db().sql`
    SELECT ps.id AS subscription_id, ps.endpoint, ps.p256dh, ps.auth, g.access_code
    FROM push_subscriptions ps
    JOIN guests g ON g.id = ps.guest_id
    JOIN weddings w ON w.id = g.wedding_id
    WHERE g.wedding_id = ${weddingId}
      AND g.guest_group = ANY(${visibleToGroups})
      AND w.plan_tier = 'full'
      AND w.paid_at IS NOT NULL
  `) as PushRecipient[];

  if (recipients.length === 0) return;

  const results = await Promise.allSettled(
    recipients.map((r) =>
      webpush
        .sendNotification(
          { endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } },
          JSON.stringify({ title, body, url: `/g/${r.access_code}`, tag: `${tag}-${weddingId}` })
        )
        .then(
          () => ({ subscriptionId: r.subscription_id, dead: false }),
          (err: { statusCode?: number }) => ({
            subscriptionId: r.subscription_id,
            dead: err?.statusCode === 404 || err?.statusCode === 410,
          })
        )
    )
  );

  const deadIds = results
    .filter((r): r is PromiseFulfilledResult<{ subscriptionId: number; dead: boolean }> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((v) => v.dead)
    .map((v) => v.subscriptionId);

  if (deadIds.length > 0) {
    await db().sql`DELETE FROM push_subscriptions WHERE id = ANY(${deadIds})`;
  }
}
