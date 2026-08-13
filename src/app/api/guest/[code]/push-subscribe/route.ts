import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { isPaid, isFullTier } from "@/lib/plan";
import { Guest } from "@/types/guest";
import { Wedding } from "@/types/wedding";

interface SubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;

  const limited = rateLimit(req, "guest-push-subscribe", 10, 10 * 60_000, code);
  if (limited) return limited;

  const { subscription } = (await req.json()) as { subscription?: SubscriptionPayload };
  if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const database = db();
  const guests = (await database.sql`SELECT * FROM guests WHERE access_code = ${code}`) as Guest[];
  const guest = guests[0];
  if (!guest) return NextResponse.json({ error: "Guest link not found" }, { status: 404 });

  const weddings = (await database.sql`SELECT * FROM weddings WHERE id = ${guest.wedding_id}`) as Wedding[];
  const wedding = weddings[0];
  if (!wedding || !isPaid(wedding)) {
    return NextResponse.json({ error: "Guest access isn't active yet" }, { status: 402 });
  }
  if (!isFullTier(wedding)) {
    return NextResponse.json({ error: "Notifications require the Full Day-Of plan" }, { status: 403 });
  }

  await database.sql`
    INSERT INTO push_subscriptions (guest_id, endpoint, p256dh, auth, user_agent)
    VALUES (${guest.id}, ${subscription.endpoint}, ${subscription.keys.p256dh}, ${subscription.keys.auth}, ${req.headers.get("user-agent")})
    ON CONFLICT (endpoint) DO UPDATE
      SET guest_id = EXCLUDED.guest_id, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth,
          user_agent = EXCLUDED.user_agent, created_at = NOW()
  `;

  return NextResponse.json({ ok: true });
});

export const DELETE = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;

  const limited = rateLimit(req, "guest-push-unsubscribe", 10, 10 * 60_000, code);
  if (limited) return limited;

  const { endpoint } = (await req.json()) as { endpoint?: string };
  if (!endpoint) return NextResponse.json({ error: "Endpoint is required" }, { status: 400 });

  const database = db();
  const guests = (await database.sql`SELECT id FROM guests WHERE access_code = ${code}`) as Pick<Guest, "id">[];
  const guest = guests[0];
  if (!guest) return NextResponse.json({ error: "Guest link not found" }, { status: 404 });

  await database.sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint} AND guest_id = ${guest.id}`;

  return NextResponse.json({ ok: true });
});
