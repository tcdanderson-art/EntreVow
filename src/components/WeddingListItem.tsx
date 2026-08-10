"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wedding } from "@/types/wedding";
import { formatWallClockDate } from "@/lib/wall-clock";

export default function WeddingListItem({ wedding }: { wedding: Wedding }) {
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm(`Delete "${wedding.title}"? This removes all its guests and itinerary too.`)) return;

    const res = await fetch(`/api/weddings/${wedding.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <li className="flex items-center gap-2">
      <Link
        href={`/dashboard/${wedding.id}`}
        className="flex-1 block bg-white border border-border-warm rounded-lg px-5 py-4 hover:border-brand transition-colors"
      >
        <span className="font-medium">{wedding.title}</span>
        {wedding.wedding_date && (
          <span className="text-sm text-foreground/60 ml-2">
            {formatWallClockDate(wedding.wedding_date)}
          </span>
        )}
      </Link>
      <button
        onClick={handleDelete}
        className="text-red-600 text-sm font-medium px-2 whitespace-nowrap"
      >
        Delete
      </button>
    </li>
  );
}
