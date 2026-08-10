import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { Wedding } from "@/types/wedding";
import { Guest } from "@/types/guest";
import { ItineraryItem } from "@/types/itinerary";
import GuestManager from "@/components/GuestManager";
import ItineraryManager from "@/components/ItineraryManager";
import DashboardHeader from "@/components/DashboardHeader";
import WeddingHeader from "@/components/WeddingHeader";

export default async function WeddingDashboardPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const weddingId = Number((await params).weddingId);

  const weddings = (await db().sql`
    SELECT * FROM weddings WHERE id = ${weddingId} AND couple_id = ${session.coupleId}
  `) as Wedding[];
  const wedding = weddings[0];
  if (!wedding) notFound();

  const guests = (await db().sql`
    SELECT * FROM guests WHERE wedding_id = ${weddingId} ORDER BY created_at ASC
  `) as Guest[];

  const items = (await db().sql`
    SELECT * FROM itinerary_items WHERE wedding_id = ${weddingId} ORDER BY start_time ASC
  `) as ItineraryItem[];

  const guestGroups = Array.from(new Set(guests.map((g) => g.guest_group)));

  return (
    <div className="flex-1 bg-cream">
      <DashboardHeader />
      <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">
        <Link href="/dashboard" className="text-sm text-brand font-medium -mb-4">
          ← Your weddings
        </Link>
        <WeddingHeader wedding={wedding} />

        <section className="bg-white border border-border-warm rounded-xl p-6">
          <h2 className="font-semibold mb-4">Guests</h2>
          <GuestManager weddingId={wedding.id} initialGuests={guests} />
        </section>

        <section className="bg-white border border-border-warm rounded-xl p-6">
          <h2 className="font-semibold mb-4">Itinerary</h2>
          <ItineraryManager
            weddingId={wedding.id}
            initialItems={items}
            knownGroups={guestGroups.length > 0 ? guestGroups : ["general"]}
          />
        </section>
      </div>
    </div>
  );
}
