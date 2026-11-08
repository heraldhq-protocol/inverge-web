import type { Metadata } from "next";
import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  CheckmarkCircle02Icon,
  Shield01Icon,
  TrophyIcon,
} from "@hugeicons/core-free-icons";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatePanel } from "@/components/ui/state-panel";
import { CompetitionNav } from "@/features/ideathon/components/competition-nav";
import { ProgrammeCard } from "@/features/programmes/components/programme-card";
import { ProgrammeHubHero } from "@/features/programmes/components/programme-hub-hero";
import { RetryButton } from "@/features/programmes/components/retry-button";
import { fetchPublicProgrammes } from "@/features/programmes/api/public";
import { splitProgrammes } from "@/features/programmes/lib/public-programme";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  description:
    "Inverge ideathons: the current brief, how judging works, and the frozen results of past editions.",
  og: { eyebrow: "Ideathon", template: "ideathon" },
  path: "/ideathon",
  title: "Ideathon",
});

const principles = [
  {
    title: "A published brief",
    body: "Eligibility, the submission requirements, dates and the scoring rubric are on the programme page before entries open.",
  },
  {
    title: "Evidence, then a decision",
    body: "Community support and judge scores are computed from stored inputs. A missing evaluation is excluded, never quietly scored as zero.",
  },
  {
    title: "Frozen results",
    body: "Published standings carry a revision and checksum. Later activity on the same idea cannot move a closed result.",
  },
] as const;

export default async function IdeathonPage() {
  const result = await fetchPublicProgrammes();
  const programmes = result.ok ? result.data : [];
  const { live, upcoming, past } = splitProgrammes(programmes);
  const featured = live[0] ?? upcoming[0] ?? past[0] ?? null;

  return (
    <>
      <ProgrammeHubHero programme={featured} />

      <Container>
        <CompetitionNav />

        <div className="py-10 sm:py-12">
          {!result.ok ? (
            <StatePanel
              variant="unavailable"
              eyebrow="Programme service"
              title="The ideathon listings are temporarily unavailable"
              description="We could not load the programme catalogue. This is a service problem, not an empty programme. Nothing has been hidden or removed in your browser."
              action={<RetryButton label="Reload programmes" />}
            />
          ) : programmes.length === 0 ? (
            <StatePanel
              variant="empty"
              eyebrow="Programme catalogue"
              title="No published programmes yet"
              description="The first edition has not opened. When a programme is published, its brief, dates and ranking rules will appear here."
              action={
                <Link
                  href="/ideathon/about"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  How the ideathon works
                </Link>
              }
            />
          ) : (
            <div className="space-y-12 sm:space-y-16">
              {live.length > 0 ? (
                <section aria-labelledby="open-now">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <Eyebrow>Open now</Eyebrow>
                      <h2
                        id="open-now"
                        className="mt-2 text-3xl font-bold tracking-[-0.045em] text-ink sm:text-4xl"
                      >
                        The current brief
                      </h2>
                    </div>
                    <p className="max-w-sm text-sm leading-6 text-muted">
                      One programme at a time, unless a sponsored challenge is
                      running alongside it. Every card links to its full rules.
                    </p>
                  </div>

                  <div className="mt-2 grid gap-x-10 lg:grid-cols-2">
                    {live.map((programme, index) => (
                      <ProgrammeCard
                        key={programme.id}
                        index={index + 1}
                        programme={programme}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {upcoming.length > 0 ? (
                <section aria-labelledby="upcoming">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <Eyebrow>Next</Eyebrow>
                      <h2
                        id="upcoming"
                        className="mt-2 text-3xl font-bold tracking-[-0.045em] text-ink sm:text-4xl"
                      >
                        Opening soon
                      </h2>
                    </div>
                  </div>
                  <div className="mt-2 grid gap-x-10 lg:grid-cols-2">
                    {upcoming.map((programme, index) => (
                      <ProgrammeCard
                        key={programme.id}
                        index={live.length + index + 1}
                        programme={programme}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              <section
                aria-labelledby="principles"
                className="grid gap-8 border-y border-border py-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-16"
              >
                <div>
                  <Eyebrow>Why the result holds</Eyebrow>
                  <h2
                    id="principles"
                    className="mt-2 text-balance text-3xl font-bold leading-[1.05] tracking-[-0.045em] text-ink"
                  >
                    A competition you can audit.
                  </h2>
                  <Link
                    href="/ideathon/rules"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-strong underline decoration-brand/25 underline-offset-4 hover:decoration-brand focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
                  >
                    Read the full ranking rules
                    <HugeiconsIcon
                      icon={ArrowRight02Icon}
                      size={15}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </Link>
                </div>

                <ol className="grid gap-0 sm:grid-cols-3">
                  {principles.map((principle, index) => (
                    <li
                      key={principle.title}
                      className="border-t border-border pt-5 sm:border-l sm:border-t-0 sm:px-5 sm:pt-0 sm:first:border-l-0 sm:first:pl-0"
                    >
                      <span
                        aria-hidden="true"
                        className="font-mono text-[0.6875rem] tabular-nums text-brand-strong"
                      >
                        0{index + 1}
                      </span>
                      <h3 className="mt-2 text-base font-bold tracking-[-0.02em] text-ink">
                        {principle.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-ink-soft">
                        {principle.body}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>

              {past.length > 0 ? (
                <section aria-labelledby="past">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <Eyebrow>Archive</Eyebrow>
                      <h2
                        id="past"
                        className="mt-2 text-3xl font-bold tracking-[-0.045em] text-ink sm:text-4xl"
                      >
                        Closed editions
                      </h2>
                    </div>
                    <Link
                      href="/ideathon/past"
                      className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-strong hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      All past editions
                      <HugeiconsIcon
                        icon={ArrowRight02Icon}
                        size={15}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                  <div className="mt-2 grid gap-x-10 lg:grid-cols-2">
                    {past.slice(0, 4).map((programme, index) => (
                      <ProgrammeCard
                        key={programme.id}
                        index={index + 1}
                        programme={programme}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="grid gap-5 border-t border-border pt-8 sm:grid-cols-3">
                <div className="flex gap-3">
                  <HugeiconsIcon
                    icon={Shield01Icon}
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-brand-strong"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-ink">
                      Sponsorship is labelled
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      Paid promotion is marked. It does not enter the judging
                      score or change an official rank.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <HugeiconsIcon
                    icon={TrophyIcon}
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-brand-strong"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-ink">
                      Prizes are only listed when real
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      A cash prize appears only after the organiser records the
                      amount and currency. No placeholder prize pool is shown.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-brand-strong"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-ink">
                      Your entry stays yours
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      Editing an idea after submission does not change the
                      frozen snapshot judges scored.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
