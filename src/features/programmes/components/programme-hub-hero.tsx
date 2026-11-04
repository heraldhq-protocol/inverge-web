import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Calendar03Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { Container } from "@/components/ui/container";
import { PhaseBadge } from "@/features/programmes/components/phase-badge";
import type { PublicProgramme } from "@/features/programmes/api/types";
import {
  formatDateRange,
  isSubmittable,
  primaryCta,
  PROGRAMME_TYPE_LABELS,
} from "@/features/programmes/lib/public-programme";

/**
 * The ideathon front door.
 *
 * The hero carries one real, current programme when there is one. When there is
 * not, it says so and points at the archive; it never fills the space with a
 * sample deadline, a fake prize pool or a made-up participant count.
 */
export function ProgrammeHubHero({
  programme,
}: {
  programme: PublicProgramme | null;
}) {
  const cta = programme ? primaryCta(programme) : null;

  return (
    <section className="border-b border-white/10 bg-contrast text-white">
      <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16 lg:py-20">
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.22em] text-[#8fe0b1]">
            The Inverge ideathon
          </p>
          <h1 className="mt-5 max-w-[15ch] text-balance text-[2.6rem] font-bold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[4.15rem]">
            Ideas judged on evidence, not noise.
          </h1>
          <p className="mt-5 max-w-[54ch] text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
            Builders publish a real idea, the community responds, and a
            disclosed rubric decides what wins. Sponsorship buys visibility; it
            never buys a position.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            {programme ? (
              <Link
                href={`/ideathon/${programme.slug}`}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#1fa85c] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#18874a] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
              >
                {cta?.label}
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </Link>
            ) : (
              <Link
                href="/ideathon/past"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/25 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
              >
                Browse past editions
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </Link>
            )}
            <Link
              href="/ideathon/rules"
              className="text-sm font-semibold text-white/75 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
            >
              Read the ranking rules
            </Link>
          </div>
        </div>

        <aside className="min-w-0 lg:pt-2">
          {programme ? (
            <div className="border border-white/15 bg-white/[0.04] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-white/50">
                  {isSubmittable(programme)
                    ? "Open for entries"
                    : "Current edition"}
                </p>
                <PhaseBadge
                  phase={programme.phase}
                  className="border-white/20"
                />
              </div>
              <h2 className="mt-4 text-balance text-2xl font-bold leading-[1.1] tracking-[-0.04em]">
                {programme.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/65">
                {programme.tagline}
              </p>

              <dl className="mt-5 space-y-2.5 border-t border-white/10 pt-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <dt className="sr-only">Dates</dt>
                  <dd className="flex items-start gap-2 text-white/65">
                    <HugeiconsIcon
                      icon={Calendar03Icon}
                      size={15}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0"
                    />
                    {formatDateRange(
                      programme.timeline.registrationOpensAt,
                      programme.timeline.judgingEndsAt,
                    )}
                  </dd>
                </div>
                <div className="flex items-start gap-2.5">
                  <dt className="sr-only">Format</dt>
                  <dd className="flex items-start gap-2 text-white/65">
                    <HugeiconsIcon
                      icon={UserGroupIcon}
                      size={15}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0"
                    />
                    {PROGRAMME_TYPE_LABELS[programme.type]} ·{" "}
                    {programme.entryPolicy.allowTeams
                      ? `Teams of ${programme.entryPolicy.teamMinSize ?? 1}-${programme.entryPolicy.teamMaxSize ?? "?"}`
                      : "Individual entries"}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="border border-white/15 bg-white/[0.04] p-5 sm:p-6">
              <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-white/50">
                Between editions
              </p>
              <h2 className="mt-4 text-balance text-2xl font-bold leading-[1.1] tracking-[-0.04em]">
                No programme is open right now.
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/65">
                The next brief will appear here when it is published. Past
                editions and their frozen results stay available.
              </p>
            </div>
          )}
          <p className="mt-3 text-[0.6875rem] leading-5 text-white/45">
            Times shown in UTC. Entry is free. Paid promotion is labelled and
            never affects judging.
          </p>
        </aside>
      </Container>
    </section>
  );
}
