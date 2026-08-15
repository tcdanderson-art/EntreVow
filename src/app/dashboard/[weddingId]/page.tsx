import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { Wedding } from "@/types/wedding";
import { Guest } from "@/types/guest";
import { ItineraryItem } from "@/types/itinerary";
import { Announcement } from "@/types/announcement";
import { Photo } from "@/types/photo";
import { Shuttle } from "@/types/shuttle";
import { WeddingTable } from "@/types/table";
import { Video } from "@/types/video";
import { Vendor } from "@/types/vendor";
import { CrewBroadcast } from "@/types/crew-broadcast";
import { mealOptionsFor } from "@/lib/meal-options";
import GuestManager from "@/components/GuestManager";
import SeatingChart from "@/components/SeatingChart";
import ItineraryManager from "@/components/ItineraryManager";
import AnnouncementManager from "@/components/AnnouncementManager";
import DashboardHeader from "@/components/DashboardHeader";
import WeddingHeader from "@/components/WeddingHeader";
import StaffCodeManager from "@/components/StaffCodeManager";
import ModeratorCodeManager from "@/components/ModeratorCodeManager";
import PhotoManager from "@/components/PhotoManager";
import GalleryCodeManager from "@/components/GalleryCodeManager";
import VideoManager from "@/components/VideoManager";
import WeatherWidget from "@/components/WeatherWidget";
import ShuttleManager from "@/components/ShuttleManager";
import VendorManager from "@/components/VendorManager";
import CrewBroadcastManager from "@/components/CrewBroadcastManager";
import DashboardSummary from "@/components/DashboardSummary";
import ExportDataButton from "@/components/ExportDataButton";
import BillingCard from "@/components/BillingCard";
import BetaFeedback from "@/components/BetaFeedback";

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

  const announcements = (await db().sql`
    SELECT * FROM announcements WHERE wedding_id = ${weddingId} ORDER BY created_at DESC
  `) as Announcement[];

  const photos = (await db().sql`
    SELECT photos.*, guests.name AS guest_name
    FROM photos JOIN guests ON guests.id = photos.guest_id
    WHERE photos.wedding_id = ${weddingId}
    ORDER BY photos.created_at DESC
  `) as Photo[];

  const shuttles = (await db().sql`
    SELECT * FROM shuttles WHERE wedding_id = ${weddingId} ORDER BY created_at ASC
  `) as Shuttle[];

  const tables = (await db().sql`
    SELECT * FROM wedding_tables WHERE wedding_id = ${weddingId} ORDER BY sort_order ASC, id ASC
  `) as WeddingTable[];

  const videos = (await db().sql`
    SELECT videos.*, guests.name AS guest_name
    FROM videos JOIN guests ON guests.id = videos.guest_id
    WHERE videos.wedding_id = ${weddingId}
    ORDER BY (videos.status = 'pending') DESC, videos.created_at DESC
  `) as Video[];

  const vendors = (await db().sql`
    SELECT * FROM vendors WHERE wedding_id = ${weddingId} ORDER BY created_at ASC
  `) as Vendor[];

  const crewBroadcasts = (await db().sql`
    SELECT * FROM crew_broadcasts WHERE wedding_id = ${weddingId} ORDER BY created_at DESC
  `) as CrewBroadcast[];

  const guestGroups = Array.from(new Set(guests.map((g) => g.guest_group)));

  return (
    <div className="flex-1 bg-cream">
      <DashboardHeader />
      <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">
        <Link href="/dashboard" className="text-sm text-brand font-medium -mb-4">
          ← Your weddings
        </Link>
        <WeddingHeader wedding={wedding} />

        <DashboardSummary guests={guests} shuttles={shuttles} />

        <BillingCard weddingId={wedding.id} planTier={wedding.plan_tier} />

        <ExportDataButton weddingId={wedding.id} weddingTitle={wedding.title} />

        <BetaFeedback weddingId={wedding.id} />

        <section className="bg-white border border-border-warm rounded-xl p-6">
          <h2 className="font-semibold mb-4">Weather</h2>
          <WeatherWidget
            weddingId={wedding.id}
            knownGroups={guestGroups.length > 0 ? guestGroups : ["general"]}
          />
        </section>

        <section className="bg-white border border-border-warm rounded-xl p-6">
          <h2 className="font-semibold mb-4">Announcements</h2>
          <AnnouncementManager
            weddingId={wedding.id}
            initialAnnouncements={announcements}
            knownGroups={guestGroups.length > 0 ? guestGroups : ["general"]}
          />
        </section>

        <section className="bg-white border border-border-warm rounded-xl p-6">
          <h2 className="font-semibold mb-4">Guests</h2>
          <GuestManager
            weddingId={wedding.id}
            weddingSlug={wedding.slug}
            initialGuests={guests}
            mealOptions={mealOptionsFor(wedding)}
          />
        </section>

        <section className="bg-white border border-border-warm rounded-xl p-6">
          <h2 className="font-semibold mb-4">Seating chart</h2>
          <SeatingChart weddingId={wedding.id} initialTables={tables} initialGuests={guests} />
        </section>

        <section className="bg-white border border-border-warm rounded-xl p-6">
          <h2 className="font-semibold mb-4">Door check-in</h2>
          <StaffCodeManager wedding={wedding} guestCount={guests.length} />
        </section>

        <section className="bg-white border border-border-warm rounded-xl p-6">
          <h2 className="font-semibold mb-4">Shuttle tracking</h2>
          <ShuttleManager weddingId={wedding.id} initialShuttles={shuttles} />
        </section>

        <section className="bg-white border border-border-warm rounded-xl p-6">
          <h2 className="font-semibold mb-4">Vendor check-in</h2>
          <VendorManager weddingId={wedding.id} initialVendors={vendors} />
        </section>

        <section className="bg-white border border-border-warm rounded-xl p-6">
          <h2 className="font-semibold mb-4">Crew updates</h2>
          <CrewBroadcastManager weddingId={wedding.id} initialBroadcasts={crewBroadcasts} />
        </section>

        <section className="bg-white border border-border-warm rounded-xl p-6">
          <h2 className="font-semibold mb-4">Photos</h2>
          <GalleryCodeManager wedding={wedding} />
          <PhotoManager weddingId={wedding.id} initialPhotos={photos} />
        </section>

        <section className="bg-white border border-border-warm rounded-xl p-6">
          <h2 className="font-semibold mb-4">Videos</h2>
          <ModeratorCodeManager
            wedding={wedding}
            pendingCount={videos.filter((v) => v.status === "pending").length}
          />
          <VideoManager
            weddingId={wedding.id}
            initialWelcomeVideoKey={wedding.welcome_video_key}
            initialVideos={videos}
          />
        </section>

        <section className="bg-white border border-border-warm rounded-xl p-6">
          <h2 className="font-semibold mb-4">Itinerary</h2>
          <ItineraryManager
            weddingId={wedding.id}
            initialItems={items}
            knownGroups={guestGroups.length > 0 ? guestGroups : ["general"]}
            defaultVenue={wedding.venue_address}
          />
        </section>
      </div>
    </div>
  );
}
