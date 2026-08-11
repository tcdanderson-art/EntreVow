import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoupleId } from "@/lib/require-auth";
import { coupleOwnsWedding } from "@/lib/wedding-ownership";
import { withErrorHandling } from "@/lib/route-handler";
import { getForecastForDate, contingencySuggestion, FORECAST_HORIZON_DAYS } from "@/lib/weather";
import { Wedding } from "@/types/wedding";

function toDateOnly(value: string | Date): string {
  if (value instanceof Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
  }
  return value.slice(0, 10);
}

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

  const weddings = (await db().sql`SELECT * FROM weddings WHERE id = ${weddingId}`) as Wedding[];
  const wedding = weddings[0];

  if (wedding.venue_lat == null || wedding.venue_lng == null) {
    return NextResponse.json({ available: false, reason: "no_location" });
  }
  if (!wedding.wedding_date) {
    return NextResponse.json({ available: false, reason: "no_date" });
  }

  const dateStr = toDateOnly(wedding.wedding_date);
  const todayStr = toDateOnly(new Date());
  const daysUntil = Math.round(
    (new Date(`${dateStr}T00:00:00Z`).getTime() - new Date(`${todayStr}T00:00:00Z`).getTime()) / 86400000
  );

  if (daysUntil < 0) {
    return NextResponse.json({ available: false, reason: "past" });
  }
  if (daysUntil > FORECAST_HORIZON_DAYS) {
    return NextResponse.json({ available: false, reason: "too_far", daysUntil });
  }

  const forecast = await getForecastForDate(wedding.venue_lat, wedding.venue_lng, dateStr);
  if (!forecast) {
    return NextResponse.json({ available: false, reason: "fetch_failed" });
  }

  return NextResponse.json({
    available: true,
    forecast,
    suggestion: contingencySuggestion(forecast),
  });
});
