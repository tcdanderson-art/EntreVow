import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Wedding } from "@/types/wedding";
import { StaffGuest } from "@/types/guest";
import { isFullTier } from "@/lib/plan";
import StaffScanner from "@/components/StaffScanner";

export default async function StaffCheckinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const weddings = (await db().sql`
    SELECT id, title, plan_tier FROM weddings WHERE staff_code = ${code}
  `) as Wedding[];
  const wedding = weddings[0];
  if (!wedding || !isFullTier(wedding)) notFound();

  // access_code is deliberately excluded — it's a guest's personal credential for
  // their own /g/[code] page and must never reach an usher's browser. Search-mode
  // check-in identifies guests by id instead (see StaffScanner + the checkin route).
  const guests = (await db().sql`
    SELECT id, wedding_id, name, guest_group, table_label, checked_in_at
    FROM guests WHERE wedding_id = ${wedding.id} ORDER BY name ASC
  `) as StaffGuest[];

  return <StaffScanner staffCode={code} weddingTitle={wedding.title} initialGuests={guests} />;
}
