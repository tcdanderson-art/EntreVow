import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Wedding } from "@/types/wedding";
import { Photo } from "@/types/photo";
import { isPaid } from "@/lib/plan";
import GalleryKiosk from "@/components/GalleryKiosk";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const weddings = (await db().sql`SELECT * FROM weddings WHERE gallery_code = ${code}`) as Wedding[];
  const wedding = weddings[0];
  if (!wedding || !isPaid(wedding)) notFound();

  const photos = (await db().sql`
    SELECT photos.*, guests.name AS guest_name
    FROM photos JOIN guests ON guests.id = photos.guest_id
    WHERE photos.wedding_id = ${wedding.id} AND photos.hidden = false
    ORDER BY photos.created_at DESC
  `) as Photo[];

  return <GalleryKiosk code={code} weddingTitle={wedding.title} initialPhotos={photos} />;
}
