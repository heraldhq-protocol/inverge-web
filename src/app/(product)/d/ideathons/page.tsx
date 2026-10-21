import type { Metadata } from "next";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Shield01Icon,
  TrophyIcon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";
import Link from "next/link";

import { Pill } from "@/components/ui/pill";
import { getDashboardViewer } from "@/features/app-shell/server/viewer";
import {
  formatMilestoneDate,
  nextProgrammeMilestone,
  programmeStatusLabel,
} from "@/features/home/lib/ideathon";
import { getPreviewActiveIdeathon } from "@/features/programmes/content/preview-programmes";

export const metadata: Metadata = {
  title: "Ideathons",
  description:
    "Inverge ideathons: current programme, how participation works, and where to see the standings.",
};

/**
 * The participant-facing ideathon hub.
 *
 * Registration, entries, and judging results are not implemented in this web
 * client, so the page does not claim any of them. It presents the programme the
 * platform is currently running, links to the real standings and rules pages,
 * and states plainly which participation features are not connected yet.
 */
export default async function IdeathonsPage() {
  const programme = getPreviewActiveIdeathon();
  const viewer = await getDashboardViewer();
  const milestone = nextProgrammeMilestone(
    programme.status,
    programme.schedule,
  );
  const milestoneDate = milestone
    ? formatMilestoneDate(milestone.at, programme.schedule.timezone)
    : null;
  const banner = programme.assets.find((asset) => asset.kind === "banner");

  const keyDates = [
    {
      label: "Registration closes",
      value: formatMilestoneDate(
        programme.schedule.registrationClosesAt,
        programme.schedule.timezone,
      ),
    },
    {
      label: "Submissions close",
      value: formatMilestoneDate(
        programme.schedule.submissionClosesAt,
        programme.schedule.timezone,
      ),
    },
    {
      label: "Results",
      value: formatMilestoneDate(
        programme.schedule.resultsAt,
        programme.schedule.timezone,
      ),
    },
  ].filter((entry): entry is { label: string; value: string } =>
    Boolean(entry.value),
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
            Programmes
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
            Ideathons
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
            Compete on validation, not on spending. Rank is driven by weighted
            support, feedback, and recorded intent.
          </p>
        </div>
        <Link
          href="/ideathon/past"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/40 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Past programmes
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            size={15}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </Link>
      </div>

      <section
        aria-labelledby="current-programme"
        className="mt-6 overflow-hidden rounded-3xl border border-border bg-surface"
      >
        {banner ? (
          <div className="relative aspect-[21/9] bg-surface-muted">
            <Image
              src={banner.url}
              alt={banner.alt}
              fill
              priority
              sizes="(min-width: 1280px) 1180px, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="accent" size="sm">
                {programmeStatusLabel(programme.status)}
              </Pill>
              <span className="text-xs text-muted">{programme.category}</span>
            </div>
            <h2
              id="current-programme"
              className="mt-2 text-balance text-xl font-bold tracking-[-0.03em] text-ink sm:text-2xl"
            >
              {programme.title}
            </h2>
            <p className="mt-1 text-sm font-medium text-brand-strong">
              {programme.tagline}
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {programme.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/ideathon"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-contrast px-4 text-sm font-semibold text-white transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <HugeiconsIcon
                  icon={TrophyIcon}
                  size={16}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                View standings
              </Link>
              <Link
                href="/ideathon/rules"
                className="inline-flex min-h-11 items-center rounded-xl border border-border bg-canvas px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Read the rules
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-canvas p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">
              <HugeiconsIcon
                icon={Calendar03Icon}
                size={15}
                strokeWidth={1.8}
                aria-hidden="true"
              />
              Key dates
            </p>
            {milestone && milestoneDate ? (
              <p className="mt-2 text-sm font-semibold text-ink">
                {milestone.label} {milestoneDate}
              </p>
            ) : null}
            <dl className="mt-3 space-y-2 border-t border-border pt-3">
              {keyDates.map((entry) => (
                <div
                  key={entry.label}
                  className="flex items-baseline justify-between gap-3"
                >
                  <dt className="text-xs text-muted">{entry.label}</dt>
                  <dd className="text-xs font-medium tabular-nums text-ink">
                    {entry.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[0.6875rem] leading-4 text-muted">
              Times shown in {programme.schedule.timezone}.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-ink">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              size={17}
              strokeWidth={1.8}
              aria-hidden="true"
              className="text-brand-strong"
            />
            Your participation
          </p>
          {viewer.capabilities.ideathonParticipant ? (
            <p className="mt-2 text-sm leading-6 text-muted">
              Your confirmed entries will appear here once the participation
              service is connected.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm leading-6 text-muted">
                Registration and submissions are not connected yet. Nothing is
                recorded when you browse this programme, and no entry is
                implied.
              </p>
              <p className="mt-2 text-xs leading-5 text-muted">
                You can still read the standings and rules today. Entry,
                deadline, and result updates will appear here once the programme
                service is connected.
              </p>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-ink">
            <HugeiconsIcon
              icon={Shield01Icon}
              size={17}
              strokeWidth={1.8}
              aria-hidden="true"
              className="text-brand-strong"
            />
            How ranking works
          </p>
          <ul className="mt-2 space-y-2">
            {programme.rules.slice(0, 3).map((rule) => (
              <li
                key={rule}
                className="flex items-start gap-2 text-xs leading-5 text-muted"
              >
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={14}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-brand-strong"
                />
                {rule}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {viewer.capabilities.programmeOrganizer ? (
        <section className="mt-4 rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm font-bold text-ink">Programme administration</p>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
            Your account can manage programmes. Event creation, judging, and
            sponsor tools stay in the administration workspace, out of the
            participant view.
          </p>
          <Link
            href="/admin/programmes"
            className="mt-2 inline-flex min-h-10 items-center text-sm font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Open programme workspace
          </Link>
        </section>
      ) : null}
    </div>
  );
}
