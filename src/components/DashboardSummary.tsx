import type { ReactNode } from "react";
import { Guest } from "@/types/guest";
import { Shuttle } from "@/types/shuttle";

const LIVE_WINDOW_MS = 3 * 60 * 1000;

function isShuttleLive(shuttle: Shuttle) {
  return (
    !!shuttle.location_updated_at &&
    Date.now() - new Date(shuttle.location_updated_at).getTime() < LIVE_WINDOW_MS
  );
}

export default function DashboardSummary({
  guests,
  shuttles,
}: {
  guests: Guest[];
  shuttles: Shuttle[];
}) {
  const total = guests.length;
  const attending = guests.filter((g) => g.rsvp_status === "attending").length;
  const declined = guests.filter((g) => g.rsvp_status === "declined").length;
  const pending = total - attending - declined;
  const checkedIn = guests.filter((g) => g.checked_in_at).length;
  const plusOnes = guests.filter((g) => g.plus_one_name).length;

  const liveShuttles = shuttles.filter(isShuttleLive).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <SummaryTile label="RSVPs">
        {total === 0 ? (
          <p className="text-sm text-foreground/50">No guests added yet</p>
        ) : (
          <>
            <p className="text-2xl font-semibold text-brand">{attending}</p>
            <p className="text-xs text-foreground/50 mt-1">
              attending · <span className="text-red-600">{declined} declined</span> · {pending} pending
            </p>
            {plusOnes > 0 && (
              <p className="text-xs text-foreground/50 mt-1">
                +{plusOnes} plus-one{plusOnes === 1 ? "" : "s"} ·{" "}
                <span className="font-medium text-brand">{attending + plusOnes} total heads</span>
              </p>
            )}
          </>
        )}
      </SummaryTile>

      <SummaryTile label="Checked in">
        {total === 0 ? (
          <p className="text-sm text-foreground/50">No guests added yet</p>
        ) : (
          <>
            <p className="text-2xl font-semibold text-brand">
              {checkedIn}
              <span className="text-base text-foreground/40 font-normal"> / {total}</span>
            </p>
            <div className="h-1.5 bg-cream rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-brand rounded-full"
                style={{ width: `${Math.round((checkedIn / total) * 100)}%` }}
              />
            </div>
          </>
        )}
      </SummaryTile>

      <SummaryTile label="Shuttles">
        {shuttles.length === 0 ? (
          <p className="text-sm text-foreground/50">No shuttles yet</p>
        ) : (
          <>
            <p className="text-2xl font-semibold text-brand">
              {liveShuttles}
              <span className="text-base text-foreground/40 font-normal"> live</span>
            </p>
            <p className="text-xs text-foreground/50 mt-1">{shuttles.length} total</p>
          </>
        )}
      </SummaryTile>
    </div>
  );
}

function SummaryTile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-white border border-border-warm rounded-xl p-5">
      <p className="text-xs font-medium text-foreground/50 uppercase tracking-wide mb-2">{label}</p>
      {children}
    </div>
  );
}
