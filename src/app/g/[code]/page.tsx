import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Guest } from "@/types/guest";
import { Wedding } from "@/types/wedding";
import { ItineraryItem } from "@/types/itinerary";
import GuestItineraryList from "@/components/GuestItineraryList";

export default async function GuestItineraryPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const guests = (await db().sql`SELECT * FROM guests WHERE access_code = ${code}`) as Guest[];
  const guest = guests[0];
  if (!guest) notFound();

  const weddings = (await db().sql`
    SELECT * FROM weddings WHERE id = ${guest.wedding_id}
  `) as Wedding[];
  const wedding = weddings[0];

  const items = (await db().sql`
    SELECT * FROM itinerary_items
    WHERE wedding_id = ${guest.wedding_id}
      AND ${guest.guest_group} = ANY(visible_to_groups)
    ORDER BY start_time ASC
  `) as ItineraryItem[];

  return (
    <div className="flex-1 flex items-center justify-center bg-cream px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-border-warm overflow-hidden flex flex-col">
        <div className="text-center px-6 py-5 border-b border-border-warm">
          <h1 className="font-display text-lg">{wedding?.title}</h1>
        </div>

        <div className="flex items-center gap-3 mx-5 mt-4 mb-2 p-3 bg-cream border border-border-warm rounded-lg">
          <div className="w-9 h-9 rounded-full bg-border-warm flex items-center justify-center font-semibold text-sm">
            {guest.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-sm">{guest.name}</div>
            <div className="text-xs text-foreground/60 capitalize">{guest.guest_group} guest</div>
          </div>
        </div>

        <div className="px-5 py-3 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-foreground/50 mb-3">
            Itinerary
          </div>

          <GuestItineraryList code={code} initialItems={items} />
        </div>

        {wedding?.emergency_phone && (
          <div className="text-center text-xs text-foreground/50 py-3 border-t border-border-warm bg-cream-card">
            Wedding Day Emergency: {wedding.emergency_phone}
          </div>
        )}
      </div>
    </div>
  );
}
