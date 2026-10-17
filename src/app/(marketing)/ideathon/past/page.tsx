import type { Metadata } from "next";
import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Archive02Icon,
  TrophyIcon,
} from "@hugeicons/core-free-icons";

import { Pill } from "@/components/ui/pill";
import { previewProgrammes } from "@/features/programmes/content/preview-programmes";
import {
  formatProgrammeDate,
  programmeCounts,
} from "@/features/programmes/lib/programme";
import { StatePanel } from "@/components/ui/state-panel";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  description:
    "The archive of completed Inverge programmes, with frozen results and sponsor acknowledgements.",
  og: { eyebrow: "Ideathon", template: "ideathon" },
  path: "/ideathon/past",
  title: "Past ideathons",
});

export default function PastIdeathonsPage() {
  const archived = previewProgrammes.filter(
    (programme) =>
      programme.status === "archived" || programme.status === "completed",
  );

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
        Past ideathons
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Completed editions keep the standings they closed with. Later support on
        the same ideas never changes a frozen result.
      </p>

      {archived.length === 0 ? (
        <div className="mt-6">
          <StatePanel
            variant="empty"
            eyebrow="Archive"
            title="No completed rounds yet"
            description="The first round is still open. Its frozen standings will appear here after publication."
            action={
              <Link
                href="/ideathon"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                View current standings
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-5 space-y-4">
          {archived.map((programme) => {
            const counts = programmeCounts(programme);
            const winners = programme.snapshot?.entries
              .slice()
              .sort((left, right) => left.rank - right.rank)
              .slice(0, 3) ?? [];
            return (
              <li key={programme.id} className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone="neutral" size="xs">Archived</Pill>
                      <span className="text-[0.625rem] uppercase tracking-[0.1em] text-muted">
                        {programme.category}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-lg font-bold tracking-[-0.03em] text-ink">
                      {programme.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted">
                      {formatProgrammeDate(programme.schedule.registrationOpensAt)} to{" "}
                      {formatProgrammeDate(programme.schedule.eventEndsAt)} ·{" "}
                      {counts.submissions} entries · {counts.registrations} registered
                    </p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand-strong">
                    <HugeiconsIcon icon={Archive02Icon} size={19} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                </div>

                {winners.length > 0 ? (
                  <div className="mt-3 rounded-xl bg-canvas p-3">
                    <div className="flex items-center gap-1.5">
                      <HugeiconsIcon
                        icon={TrophyIcon}
                        size={14}
                        strokeWidth={1.8}
                        aria-hidden="true"
                        className="text-brand-strong"
                      />
                      <p className="text-[0.6875rem] font-semibold text-ink">
                        Published results
                      </p>
                    </div>
                    <ol className="mt-2 space-y-1">
                      {winners.map((entry) => {
                        const submission = programme.submissions.find(
                          (item) => item.id === entry.submissionId,
                        );
                        return (
                          <li key={entry.submissionId} className="flex items-center justify-between gap-3 text-xs">
                            <span className="text-ink">
                              {entry.rank}. {submission?.title ?? entry.submissionId}
                            </span>
                            <span className="tabular-nums text-muted">
                              {entry.judgeScore.toFixed(2)}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                    <p className="mt-2 text-[0.625rem] text-muted">
                      Frozen {formatProgrammeDate(programme.snapshot?.capturedAt ?? programme.schedule.resultsAt)} · checksum {programme.snapshot?.checksum}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl bg-canvas px-3 py-2 text-xs text-muted">
                    No published results snapshot for this edition.
                  </p>
                )}

                {programme.sponsors.length > 0 ? (
                  <p className="mt-2 text-[0.625rem] text-muted">
                    Supported by {programme.sponsors.map((sponsor) => sponsor.name).join(", ")}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <section className="mt-6 rounded-2xl border border-border bg-surface p-4">
        <h3 className="text-sm font-bold text-ink">How the archive works</h3>
        <p className="mt-1.5 text-xs leading-5 text-muted">
          A closed round keeps the standings it closed with. A correction is
          published as a note beside the frozen order, never a silent edit.
          Sponsor acknowledgements stay with the edition.
        </p>
      </section>
    </div>
  );
}
