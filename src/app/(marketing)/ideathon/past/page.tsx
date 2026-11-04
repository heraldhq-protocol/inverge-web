import type { Metadata } from "next";
import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon, TrophyIcon } from "@hugeicons/core-free-icons";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatePanel } from "@/components/ui/state-panel";
import { CompetitionNav } from "@/features/ideathon/components/competition-nav";
import { PhaseBadge } from "@/features/programmes/components/phase-badge";
import { RetryButton } from "@/features/programmes/components/retry-button";
import { fetchPublicProgrammes } from "@/features/programmes/api/public";
import {
  formatDate,
  formatDateTime,
  isPast,
  PROGRAMME_TYPE_LABELS,
} from "@/features/programmes/lib/public-programme";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  description:
    "The archive of closed Inverge programmes, with their published results and sponsor acknowledgements.",
  og: { eyebrow: "Ideathon", template: "ideathon" },
  path: "/ideathon/past",
  title: "Past ideathons",
});

export default async function PastIdeathonsPage() {
  const result = await fetchPublicProgrammes();
  const archived = result.ok
    ? result.data
        .filter(isPast)
        .sort(
          (left, right) =>
            new Date(right.timeline.resultsAt).getTime() -
            new Date(left.timeline.resultsAt).getTime(),
        )
    : [];

  return (
    <>
      <Container>
        <CompetitionNav />
        <div className="mx-auto max-w-4xl py-10 sm:py-12">
          <Eyebrow>Archive</Eyebrow>
          <h1 className="mt-2 text-balance text-3xl font-bold tracking-[-0.05em] text-ink sm:text-4xl">
            Past ideathons
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            A closed edition keeps the standings it closed with. Later support
            on the same idea never moves a frozen result, and every correction
            is a new publication, not a silent edit.
          </p>

          <div className="mt-8">
            {!result.ok ? (
              <StatePanel
                variant="unavailable"
                eyebrow="Archive"
                title="The archive is temporarily unavailable"
                description="The programme service could not be reached. This is not an empty archive; no completed edition has been removed."
                action={<RetryButton label="Reload archive" />}
              />
            ) : archived.length === 0 ? (
              <StatePanel
                variant="empty"
                eyebrow="Archive"
                title="No completed editions yet"
                description="When the first programme closes and publishes its results, it will be kept here with its frozen order."
                action={
                  <Link
                    href="/ideathon"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    View current programmes
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-5">
                {archived.map((programme) => {
                  const ranked = (programme.results?.standings ?? [])
                    .filter((standing) => standing.rank !== null)
                    .sort(
                      (left, right) =>
                        (left.rank ?? Number.MAX_SAFE_INTEGER) -
                        (right.rank ?? Number.MAX_SAFE_INTEGER),
                    )
                    .slice(0, 3);

                  return (
                    <li
                      key={programme.id}
                      className="border border-border bg-surface p-5 sm:p-6"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <PhaseBadge phase={programme.phase} />
                            <span className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-muted">
                              {PROGRAMME_TYPE_LABELS[programme.type]}
                            </span>
                            {programme.category ? (
                              <span className="text-[0.625rem] uppercase tracking-[0.1em] text-muted">
                                · {programme.category}
                              </span>
                            ) : null}
                          </div>
                          <h2 className="mt-2 text-balance text-xl font-bold tracking-[-0.035em] text-ink sm:text-2xl">
                            <Link
                              href={`/ideathon/${programme.slug}`}
                              className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                            >
                              {programme.title}
                            </Link>
                          </h2>
                          <p className="mt-1 max-w-[58ch] text-sm leading-6 text-ink-soft">
                            {programme.tagline}
                          </p>
                          <p className="mt-2 text-xs text-muted">
                            {formatDate(programme.timeline.registrationOpensAt)}{" "}
                            to {formatDate(programme.timeline.judgingEndsAt)} ·{" "}
                            {programme.entryCount}{" "}
                            {programme.entryCount === 1 ? "entry" : "entries"}
                          </p>
                        </div>

                        <Link
                          href={`/ideathon/${programme.slug}`}
                          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                          Read the edition
                          <HugeiconsIcon
                            icon={ArrowRight02Icon}
                            size={14}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        </Link>
                      </div>

                      {ranked.length > 0 ? (
                        <div className="mt-4 border-t border-border pt-3">
                          <div className="flex items-center gap-1.5">
                            <HugeiconsIcon
                              icon={TrophyIcon}
                              size={14}
                              strokeWidth={1.8}
                              aria-hidden="true"
                              className="text-brand-strong"
                            />
                            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted">
                              Published result
                            </p>
                          </div>
                          <ol className="mt-2 space-y-1.5">
                            {ranked.map((standing) => (
                              <li
                                key={standing.entryId}
                                className="flex items-baseline justify-between gap-3 text-sm"
                              >
                                <span className="min-w-0 truncate text-ink">
                                  <span className="mr-2 font-mono text-xs tabular-nums text-brand-strong">
                                    {String(standing.rank).padStart(2, "0")}
                                  </span>
                                  {standing.title}
                                </span>
                                <span className="shrink-0 text-xs tabular-nums text-muted">
                                  {standing.officialScore === null
                                    ? "Curated"
                                    : standing.officialScore.toFixed(2)}
                                </span>
                              </li>
                            ))}
                          </ol>
                          <p className="mt-2 text-[0.625rem] text-muted">
                            Frozen{" "}
                            {formatDateTime(programme.results?.publishedAt)} ·
                            revision {programme.results?.revision} ·{" "}
                            {programme.results?.checksum.slice(0, 12)}...
                          </p>
                        </div>
                      ) : (
                        <p className="mt-4 border-t border-border pt-3 text-xs text-muted">
                          No public results were published for this edition.
                        </p>
                      )}

                      {programme.sponsors.length > 0 ? (
                        <p className="mt-2 text-[0.625rem] text-muted">
                          Supported by{" "}
                          {programme.sponsors
                            .map((sponsor) => sponsor.name)
                            .join(", ")}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <section className="mt-8 border-t border-border pt-6">
            <h2 className="text-sm font-bold text-ink">
              How the archive works
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              A publication records the ordered standings, the scoring method,
              the rubric and a checksum over the inputs. A later correction is
              published as a new revision beside the frozen order; it never
              rewrites the result participants saw.
            </p>
          </section>
        </div>
      </Container>
    </>
  );
}
