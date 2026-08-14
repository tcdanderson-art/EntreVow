import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { CrewBroadcast, CrewRole } from "@/types/crew-broadcast";

const VALID_ROLES: CrewRole[] = ["staff", "driver", "vendor"];

export const GET = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const weddingId = Number((await params).id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const broadcasts = (await db().sql`
    SELECT * FROM crew_broadcasts WHERE wedding_id = ${weddingId} ORDER BY created_at DESC
  `) as CrewBroadcast[];

  return NextResponse.json({ broadcasts });
});

export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const coupleId = await requireCoupleId();
  if (!coupleId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const weddingId = Number((await params).id);
  if (!(await coupleOwnsWedding(coupleId, weddingId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { message, roles } = await req.json();
  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const selectedRoles: CrewRole[] = Array.isArray(roles)
    ? roles.filter((r): r is CrewRole => VALID_ROLES.includes(r))
    : [];
  if (selectedRoles.length === 0) {
    return NextResponse.json({ error: "Pick at least one role to notify" }, { status: 400 });
  }

  const [broadcast] = (await db().sql`
    INSERT INTO crew_broadcasts (wedding_id, message, roles)
    VALUES (${weddingId}, ${message.trim()}, ${selectedRoles})
    RETURNING *
  `) as CrewBroadcast[];

  return NextResponse.json({ broadcast });
});
