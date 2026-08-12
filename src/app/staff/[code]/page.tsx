import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Wedding } from "@/types/wedding";
import { Guest } from "@/types/guest";
import { isFullTier } from "@/lib/plan";
import StaffScanner from "@/components/StaffScanner";

export default async function StaffCheckinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const weddings = (await db().sql`SELECT * FROM weddings WHERE staff_code = ${code}`) as Wedding[];
  const wedding = weddings[0];
  if (!wedding || !isFullTier(wedding)) notFound();

  const guests = (await db().sql`
    SELECT * FROM guests WHERE wedding_id = ${wedding.id} ORDER BY name ASC
  `) as Guest[];

  return <StaffScanner staffCode={code} weddingTitle={wedding.title} initialGuests={guests} />;
}
