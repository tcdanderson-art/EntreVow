import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Wedding } from "@/types/wedding";
import { Video } from "@/types/video";
import { isPaid } from "@/lib/plan";
import ModeratorVideoReview from "@/components/ModeratorVideoReview";

export default async function ModeratorPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const weddings = (await db().sql`
    SELECT * FROM weddings WHERE moderator_code = ${code}
  `) as Wedding[];
  const wedding = weddings[0];
  if (!wedding || !isPaid(wedding)) notFound();

  const videos = (await db().sql`
    SELECT videos.*, guests.name AS guest_name
    FROM videos JOIN guests ON guests.id = videos.guest_id
    WHERE videos.wedding_id = ${wedding.id}
    ORDER BY (videos.status = 'pending') DESC, videos.created_at DESC
  `) as Video[];

  return (
    <ModeratorVideoReview
      moderatorCode={code}
      weddingTitle={wedding.title}
      initialVideos={videos}
    />
  );
}
