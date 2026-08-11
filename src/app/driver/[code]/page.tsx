import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Shuttle } from "@/types/shuttle";
import { Wedding } from "@/types/wedding";
import DriverTracker from "@/components/DriverTracker";

export default async function DriverPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const shuttles = (await db().sql`SELECT * FROM shuttles WHERE driver_code = ${code}`) as Shuttle[];
  const shuttle = shuttles[0];
  if (!shuttle) notFound();

  const weddings = (await db().sql`SELECT * FROM weddings WHERE id = ${shuttle.wedding_id}`) as Wedding[];
  const wedding = weddings[0];

  return <DriverTracker driverCode={code} shuttleLabel={shuttle.label} weddingTitle={wedding?.title ?? ""} />;
}
