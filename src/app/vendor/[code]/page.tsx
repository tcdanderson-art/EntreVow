import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Wedding } from "@/types/wedding";
import { Vendor } from "@/types/vendor";
import { isFullTier } from "@/lib/plan";
import VendorCheckin from "@/components/VendorCheckin";

export default async function VendorCheckinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const vendors = (await db().sql`SELECT * FROM vendors WHERE vendor_code = ${code}`) as Vendor[];
  const vendor = vendors[0];
  if (!vendor) notFound();

  const weddings = (await db().sql`SELECT * FROM weddings WHERE id = ${vendor.wedding_id}`) as Wedding[];
  const wedding = weddings[0];
  if (!wedding || !isFullTier(wedding)) notFound();

  return (
    <VendorCheckin
      vendorCode={code}
      vendorName={vendor.name}
      vendorCategory={vendor.category}
      weddingTitle={wedding.title}
      initialCheckedInAt={vendor.checked_in_at}
    />
  );
}
