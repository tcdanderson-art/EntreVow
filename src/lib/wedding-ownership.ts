import { db } from "@/lib/db";

export async function coupleOwnsWedding(coupleId: number, weddingId: number) {
  const rows = await db().sql`
    SELECT id FROM weddings WHERE id = ${weddingId} AND couple_id = ${coupleId}
  `;
  return rows.length > 0;
}
