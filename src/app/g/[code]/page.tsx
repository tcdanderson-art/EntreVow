import { notFound } from "next/navigation";
import type { Metadata, Viewport } from "next";
import { db } from "@/lib/db";
import { Guest } from "@/types/guest";
import { Wedding } from "@/types/wedding";
import { ItineraryItem } from "@/types/itinerary";
import { Announcement } from "@/types/announcement";
import { Photo } from "@/types/photo";
import { Shuttle } from "@/types/shuttle";
import { Video } from "@/types/video";
import GuestItineraryList from "@/components/GuestItineraryList";
import GuestRsvp from "@/components/GuestRsvp";
import GuestAnnouncements from "@/components/GuestAnnouncements";
import GuestPass from "@/components/GuestPass";
import WelcomeVideo from "@/components/WelcomeVideo";
import GuestPhotos from "@/components/GuestPhotos";
import GuestVideoGuestbook from "@/components/GuestVideoGuestbook";
import GuestShuttleTracker from "@/components/GuestShuttleTracker";
import GuestCommandCard from "@/components/GuestCommandCard";
import GuestPushOptIn from "@/components/GuestPushOptIn";
import OfflineSupport from "@/components/OfflineSupport";
import GuestRefreshLink from "@/components/GuestRefreshLink";
import GuestBetaFeedback from "@/components/GuestBetaFeedback";
import Link from "next/link";
import { isPaid, isFullTier } from "@/lib/plan";
import { mealOptionsFor } from "@/lib/meal-options";
import { getVapidPublicKey } from "@/lib/push";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;

  const guests = (await db().sql`SELECT wedding_id FROM guests WHERE access_code = ${code}`) as Guest[];
  const weddingId = guests[0]?.wedding_id;
  const weddings = weddingId
    ? ((await db().sql`SELECT title FROM weddings WHERE id = ${weddingId}`) as Wedding[])
    : [];
  const weddingTitle = weddings[0]?.title;
  const title = weddingTitle ? `${weddingTitle} — Entrevow` : "Your Wedding Guest Page — Entrevow";

  return {
    title,
    openGraph: { title },
    twitter: { title },
    manifest: `/api/guest/${code}/manifest`,
  };
}

// Matches the manifest's theme_color — iOS Safari reads this meta tag for the
// status bar / address bar color rather than the manifest. Page-level viewport
// exports replace the root's rather than merging with it, so viewportFit is
// repeated here to keep safe-area-inset working on this route too.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#b07d5c",
};

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
    SELECT id, title, plan_tier, paid_at, meal_options, welcome_video_key, emergency_phone
    FROM weddings WHERE id = ${guest.wedding_id}
  `) as Wedding[];
  const wedding = weddings[0];

  if (!wedding || !isPaid(wedding)) {
    return (
      <div className="flex-1 flex items-center justify-center bg-cream px-4 py-8">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-border-warm p-8 text-center">
          <h1 className="font-display text-lg mb-2">{wedding?.title ?? "Wedding"}</h1>
          <p className="text-sm text-foreground/80">
            This guest link isn&apos;t active yet — check back closer to the wedding day.
          </p>
        </div>
      </div>
    );
  }

  const items = (await db().sql`
    SELECT * FROM itinerary_items
    WHERE wedding_id = ${guest.wedding_id}
      AND ${guest.guest_group} = ANY(visible_to_groups)
    ORDER BY start_time ASC
  `) as ItineraryItem[];

  const announcements = (await db().sql`
    SELECT * FROM announcements
    WHERE wedding_id = ${guest.wedding_id}
      AND ${guest.guest_group} = ANY(visible_to_groups)
    ORDER BY created_at DESC
  `) as Announcement[];

  const photos = (await db().sql`
    SELECT photos.*, guests.name AS guest_name
    FROM photos JOIN guests ON guests.id = photos.guest_id
    WHERE photos.wedding_id = ${guest.wedding_id} AND photos.hidden = false
    ORDER BY photos.created_at DESC
  `) as Photo[];

  const shuttles = isFullTier(wedding)
    ? ((await db().sql`
        SELECT id, wedding_id, label, lat, lng, location_updated_at, pickup_time, created_at
        FROM shuttles WHERE wedding_id = ${guest.wedding_id} ORDER BY created_at ASC
      `) as Shuttle[])
    : [];

  const videos = (await db().sql`
    SELECT videos.*, guests.name AS guest_name
    FROM videos JOIN guests ON guests.id = videos.guest_id
    WHERE videos.wedding_id = ${guest.wedding_id} AND videos.status = 'approved'
    ORDER BY videos.created_at DESC
  `) as Video[];

  const vapidPublicKey = getVapidPublicKey();

  return (
    <div className="flex-1 flex items-center justify-center bg-cream px-4 py-8">
      <OfflineSupport />
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
          <div className="flex-1">
            <div className="font-semibold text-sm">{guest.name}</div>
            <div className="text-xs text-foreground/80 capitalize">{guest.guest_group} guest</div>
          </div>
          {guest.table_label && (
            <div className="text-right shrink-0">
              <div className="text-[10px] uppercase tracking-wide text-foreground/70">Seated at</div>
              <div className="text-sm font-semibold text-brand">{guest.table_label}</div>
            </div>
          )}
        </div>

        <GuestCommandCard
          code={code}
          initialItems={items}
          initialShuttles={shuttles}
          initialArrivalTime={guest.arrival_time}
          showShuttleAndWeather={isFullTier(wedding)}
        />

        {wedding.welcome_video_key && <WelcomeVideo storageKey={wedding.welcome_video_key} />}

        <GuestPass guestName={guest.name} />

        <GuestAnnouncements code={code} initialAnnouncements={announcements} />

        <GuestRsvp code={code} initialGuest={guest} mealOptions={mealOptionsFor(wedding)} />

        {isFullTier(wedding) && vapidPublicKey && (
          <GuestPushOptIn code={code} vapidPublicKey={vapidPublicKey} />
        )}

        <div className="px-5 py-3 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-foreground/75 mb-3">
            Itinerary
          </div>

          <GuestItineraryList code={code} weddingTitle={wedding?.title ?? "Wedding"} initialItems={items} />
        </div>

        <GuestPhotos code={code} initialPhotos={photos} />

        <GuestVideoGuestbook code={code} initialVideos={videos} />

        {isFullTier(wedding) && (
          <GuestShuttleTracker code={code} initialShuttles={shuttles} initialArrivalTime={guest.arrival_time} />
        )}

        {wedding?.emergency_phone && (
          <div className="text-center text-xs text-foreground/75 py-3 border-t border-border-warm bg-cream-card">
            Wedding Day Emergency: {wedding.emergency_phone}
          </div>
        )}

        <GuestRefreshLink />

        <GuestBetaFeedback code={code} />

        <div className="text-center pb-4">
          <Link href="/faq" className="text-xs text-foreground/70 hover:text-foreground/80 transition-colors">
            Have a question? See the FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
