import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/route-handler";
import { Guest } from "@/types/guest";
import { Wedding } from "@/types/wedding";

export const GET = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;
  const database = db();

  const guests = (await database.sql`SELECT * FROM guests WHERE access_code = ${code}`) as Guest[];
  const guest = guests[0];
  if (!guest) {
    return NextResponse.json({ error: "Guest link not found" }, { status: 404 });
  }

  const weddings = (await database.sql`SELECT * FROM weddings WHERE id = ${guest.wedding_id}`) as Wedding[];
  const wedding = weddings[0];

  const firstName = guest.name.split(" ")[0];

  return NextResponse.json(
    {
      id: `/g/${code}`,
      name: wedding ? `${wedding.title} — ${guest.name}'s Pass` : `${guest.name}'s Wedding Pass`,
      short_name: firstName,
      description: "Your personal wedding-day schedule, pass, and updates.",
      start_url: `/g/${code}`,
      scope: "/g/",
      display: "standalone",
      background_color: "#f7f5f0",
      theme_color: "#b07d5c",
      icons: [
        { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/apple-icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
        // Logo redrawn with generous padding so it isn't clipped when Android
        // applies its own mask shape (circle/squircle) over the icon.
        { src: "/maskable-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } }
  );
});
