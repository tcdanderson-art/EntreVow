"use client";

import { useState } from "react";
import { ItineraryItem } from "@/types/itinerary";
import { addMinutesToWallClock, formatWallClockTime } from "@/lib/wall-clock";
import { generateRunsheet, DraftItem, RunsheetAnswers } from "@/lib/runsheet";

type Phase = "closed" | "questions" | "preview";

const DEFAULT_ANSWERS: RunsheetAnswers = {
  ceremonyVenue: "",
  sameVenue: true,
  receptionVenue: "",
  cocktailMinutes: 60,
  receptionHours: 5,
  includeSpeeches: true,
  includeCakeCutting: true,
  includeFirstDance: true,
};

export default function RunsheetGenerator({
  weddingId,
  knownGroups,
  defaultVenue,
  onItemsAdded,
}: {
  weddingId: number;
  knownGroups: string[];
  defaultVenue: string | null;
  onItemsAdded: (items: ItineraryItem[]) => void;
}) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [ceremonyStart, setCeremonyStart] = useState("");
  const [answers, setAnswers] = useState<RunsheetAnswers>({
    ...DEFAULT_ANSWERS,
    ceremonyVenue: defaultVenue ?? "",
  });
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    setDraftItems(generateRunsheet(answers));
    setPhase("preview");
  }

  function removeDraft(index: number) {
    setDraftItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    const groups = knownGroups.length > 0 ? knownGroups : ["general"];
    const created: ItineraryItem[] = [];
    const failed: DraftItem[] = [];

    for (const draft of draftItems) {
      try {
        const res = await fetch(`/api/weddings/${weddingId}/itinerary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: draft.title,
            location: draft.location,
            startTime: addMinutesToWallClock(ceremonyStart, draft.offsetMinutes),
            transportInfo: draft.transportInfo,
            visibleToGroups: groups,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          created.push(data.item);
        } else {
          failed.push(draft);
        }
      } catch {
        failed.push(draft);
      }
    }

    setSubmitting(false);
    onItemsAdded(created);

    // Keep failed drafts in the preview instead of silently dropping them, so
    // the couple can see what didn't make it in and retry rather than ending
    // up with a shorter itinerary than they confirmed with no explanation.
    if (failed.length > 0) {
      setDraftItems(failed);
      setError(
        `${failed.length} item${failed.length === 1 ? "" : "s"} couldn't be added — check your connection and try again.`
      );
    } else {
      setPhase("closed");
      setDraftItems([]);
    }
  }

  if (phase === "closed") {
    return (
      <button
        onClick={() => {
          setError(null);
          setPhase("questions");
        }}
        className="self-start text-sm font-medium text-brand"
      >
        + Generate a draft runsheet
      </button>
    );
  }

  if (phase === "questions") {
    return (
      <form
        onSubmit={handlePreview}
        className="flex flex-col gap-3 border border-border-warm rounded-md p-4 bg-cream"
      >
        <p className="text-sm text-foreground/80">
          Answer a few questions and we&apos;ll draft a running order you can edit before adding it —
          nothing is saved until you confirm.
        </p>

        <label htmlFor="runsheet-ceremony-start" className="text-sm font-medium">
          Ceremony start time
        </label>
        <input
          id="runsheet-ceremony-start"
          type="datetime-local"
          value={ceremonyStart}
          onChange={(e) => setCeremonyStart(e.target.value)}
          required
          className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />

        <label htmlFor="runsheet-ceremony-venue" className="text-sm font-medium">
          Ceremony venue
        </label>
        <input
          id="runsheet-ceremony-venue"
          type="text"
          placeholder="e.g. St. Jude's Chapel"
          value={answers.ceremonyVenue}
          onChange={(e) => setAnswers((a) => ({ ...a, ceremonyVenue: e.target.value }))}
          className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={answers.sameVenue}
            onChange={(e) => setAnswers((a) => ({ ...a, sameVenue: e.target.checked }))}
          />
          Reception is at the same venue
        </label>

        {!answers.sameVenue && (
          <>
            <label htmlFor="runsheet-reception-venue" className="text-sm font-medium">
              Reception venue
            </label>
            <input
              id="runsheet-reception-venue"
              type="text"
              placeholder="e.g. The Garden Room"
              value={answers.receptionVenue}
              onChange={(e) => setAnswers((a) => ({ ...a, receptionVenue: e.target.value }))}
              className="border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </>
        )}

        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <label htmlFor="runsheet-cocktail-minutes" className="text-sm font-medium block mb-1">
              Cocktail hour (minutes)
            </label>
            <input
              id="runsheet-cocktail-minutes"
              type="number"
              min={0}
              value={answers.cocktailMinutes}
              onChange={(e) => setAnswers((a) => ({ ...a, cocktailMinutes: Number(e.target.value) }))}
              className="w-full border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label htmlFor="runsheet-reception-hours" className="text-sm font-medium block mb-1">
              Reception length (hours)
            </label>
            <input
              id="runsheet-reception-hours"
              type="number"
              min={1}
              value={answers.receptionHours}
              onChange={(e) => setAnswers((a) => ({ ...a, receptionHours: Number(e.target.value) }))}
              className="w-full border border-border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={answers.includeSpeeches}
              onChange={(e) => setAnswers((a) => ({ ...a, includeSpeeches: e.target.checked }))}
            />
            Speeches
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={answers.includeCakeCutting}
              onChange={(e) => setAnswers((a) => ({ ...a, includeCakeCutting: e.target.checked }))}
            />
            Cake cutting
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={answers.includeFirstDance}
              onChange={(e) => setAnswers((a) => ({ ...a, includeFirstDance: e.target.checked }))}
            />
            First dance
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-brand text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors"
          >
            Preview runsheet
          </button>
          <button type="button" onClick={() => setPhase("closed")} className="text-foreground/80 text-sm font-medium">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3 border border-border-warm rounded-md p-4 bg-cream">
      <p className="text-sm text-foreground/80">
        Remove anything you don&apos;t want, then add the rest to your itinerary. You can edit times,
        locations, and titles afterward like any other item.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <ul className="flex flex-col gap-2">
        {draftItems.map((item, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-3 border border-border-warm rounded-md px-3 py-2 text-sm bg-white"
          >
            <div>
              <div className="font-medium">{item.title}</div>
              <div className="text-foreground/75 text-xs">
                {formatWallClockTime(addMinutesToWallClock(ceremonyStart, item.offsetMinutes), {
                  hour: "numeric",
                  minute: "2-digit",
                })}
                {item.location && ` · ${item.location}`}
              </div>
            </div>
            <button onClick={() => removeDraft(i)} className="text-red-600 font-medium text-xs shrink-0">
              Remove
            </button>
          </li>
        ))}
      </ul>
      {draftItems.length === 0 && (
        <p className="text-sm text-foreground/70">Nothing left to add — go back to start over.</p>
      )}
      <div className="flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={submitting || draftItems.length === 0}
          className="bg-brand text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
        >
          {submitting ? "Adding…" : `Add ${draftItems.length} item${draftItems.length === 1 ? "" : "s"} to itinerary`}
        </button>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setPhase("questions");
          }}
          disabled={submitting}
          className="text-foreground/80 text-sm font-medium disabled:opacity-60"
        >
          Back
        </button>
      </div>
    </div>
  );
}
