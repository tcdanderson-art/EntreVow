import { db } from "@/lib/db";
import { CrewBroadcast, CrewRole } from "@/types/crew-broadcast";

export async function broadcastsForRole(weddingId: number, role: CrewRole): Promise<CrewBroadcast[]> {
  return (await db().sql`
    SELECT * FROM crew_broadcasts
    WHERE wedding_id = ${weddingId} AND ${role} = ANY(roles)
    ORDER BY created_at DESC
    LIMIT 20
  `) as CrewBroadcast[];
}
