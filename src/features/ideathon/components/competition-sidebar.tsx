import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Calendar03Icon,
  Coins01Icon,
  Comment01Icon,
  StarAward01Icon,
  TrophyIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Amount } from "@/components/ui/amount";
import { NgnEstimate } from "@/components/ui/ngn-estimate";
import { Eyebrow } from "@/components/ui/eyebrow";
import type {
  CompetitionCategoryBreakdown,
  CompetitionTotals,
  Ideathon,
} from "@/features/ideathon/types";
import type { Programme } from "@/features/programmes/types";
import {
  formatProgrammeDate,
  prizePoolTotal,
} from "@/features/programmes/lib/programme";

function Stat({
  icon,
  label,
  value,
}: {
  icon: IconSvgElement;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-strong">
        <HugeiconsIcon
          icon={icon}
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold tabular-nums leading-tight text-ink">
          {value}
        </p>
        <p className="mt-0.5 text-[0.6875rem] leading-4 text-muted">{label}</p>
      </div>
    </div>
  );
}

export function CompetitionSidebar({
  categories,
  competition,
  programme,
  totals,
}: {
  categories: readonly CompetitionCategoryBreakdown[];
  competition: Ideathon;
  programme: Programme;
  totals: CompetitionTotals;
}) {
  const pool = prizePoolTotal(programme.rewards);
  const cashRewards = programme.rewards.filter((reward) => reward.amount);
  const deadline =
    programme.status === "submission_open"
      ? programme.schedule.submissionClosesAt
      : programme.schedule.registrationClosesAt;

  return (
    <aside aria-label="Competition details" className="space-y-3">
      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-base font-bold tracking-[-0.02em] text-ink">
          Your support fuels innovation
        </h2>
        <p className="mt-1 text-xs leading-5 text-muted">
          Every support and pre-pledge helps creators get noticed and move
          closer to building real solutions.
        </p>
        <div className="mt-4 space-y-3.5">
          <Stat
            icon={UserGroupIcon}
            label="Total supporters"
            value={totals.supporters.toLocaleString("en-US")}
          />
          <Stat
            icon={Coins01Icon}
            label="Estimated interest"
            value={<Amount value={totals.estimatedInterest} compact />}
          />
          <Stat
            icon={Comment01Icon}
            label="Structured feedback"
            value={totals.feedback.toLocaleString("en-US")}
          />
        </div>
        <Link
          href="/ideathon/rules"
          className="mt-4 inline-flex min-h-9 items-center gap-1.5 rounded text-xs font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          How it works
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            size={14}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </Link>
      </section>

      <section
        id="prizes"
        className="rounded-2xl border border-border bg-surface p-4"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-strong">
            <HugeiconsIcon
              icon={TrophyIcon}
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
          <div className="min-w-0">
            <Eyebrow className="text-muted">Prize pool</Eyebrow>
            <p className="mt-1 text-xl font-bold tabular-nums tracking-[-0.03em] text-ink">
              {pool.atomic === "0" ? (
                "Recognition"
              ) : (
                <Amount value={pool} compact />
              )}
            </p>
            {pool.atomic === "0" ? null : (
              <NgnEstimate
                amount={pool}
                block
                className="mt-0.5 text-xs font-medium text-muted"
                showRate
              />
            )}
            <p className="mt-1 text-[0.6875rem] leading-4 text-muted">
              {cashRewards.length > 0
                ? `${cashRewards.length} cash reward${cashRewards.length === 1 ? "" : "s"} plus non-cash recognition. Fulfilled outside the platform.`
                : competition.prizeDescription}
            </p>
          </div>
        </div>
        <Link
          href="#prizes"
          className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded text-xs font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          View rewards
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            size={14}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </Link>
      </section>

      {programme.sponsors.length > 0 ? (
        <section className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={StarAward01Icon}
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
              className="text-brand-strong"
            />
            <h2 className="text-sm font-bold text-ink">Sponsors</h2>
          </div>
          <ul className="mt-2 space-y-2">
            {programme.sponsors.map((sponsor) => (
              <li key={sponsor.id} className="rounded-lg bg-canvas px-2.5 py-2">
                <p className="text-xs font-semibold text-ink">{sponsor.name}</p>
                <p className="text-[0.625rem] text-muted">
                  {sponsor.tier} · {sponsor.deliverables.join(", ")}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[0.625rem] leading-4 text-muted">
            A sponsor funds the programme and never affects ranking, validation,
            or judging.
          </p>
        </section>
      ) : null}

      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={Calendar03Icon}
            size={15}
            strokeWidth={1.8}
            aria-hidden="true"
            className="text-brand-strong"
          />
          <h2 className="text-sm font-bold text-ink">Key dates</h2>
        </div>
        <ul className="mt-2 space-y-1.5 text-[0.6875rem]">
          <li className="flex justify-between gap-2">
            <span className="text-muted">Registration closes</span>
            <span className="text-ink">
              {formatProgrammeDate(programme.schedule.registrationClosesAt)}
            </span>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-muted">Submissions close</span>
            <span className="text-ink">
              {formatProgrammeDate(programme.schedule.submissionClosesAt)}
            </span>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-muted">Results</span>
            <span className="text-ink">
              {formatProgrammeDate(programme.schedule.resultsAt)}
            </span>
          </li>
        </ul>
        {deadline ? (
          <p className="mt-2 text-[0.625rem] text-muted">
            Next: {formatProgrammeDate(deadline, true)}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-sm font-bold text-ink">Top topics</h2>
        <ul className="mt-3 space-y-2">
          {categories.slice(0, 5).map((item) => (
            <li key={item.categoryValue}>
              <Link
                href={`/ideas?category=${item.categoryValue}`}
                className="flex min-h-9 items-center justify-between gap-3 rounded-lg px-1.5 text-xs transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <span className="font-medium text-ink-soft">
                  {item.category}
                </span>
                <span className="tabular-nums text-muted">
                  {item.count} {item.count === 1 ? "idea" : "ideas"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-brand-soft p-4">
        <span className="grid size-9 place-items-center rounded-xl bg-brand/12 text-brand-strong">
          <HugeiconsIcon
            icon={UserGroupIcon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <h2 className="mt-3 text-base font-bold tracking-[-0.02em] text-ink">
          Got an idea?
        </h2>
        <p className="mt-1 text-xs leading-5 text-muted">
          Join the next ideathon and turn your idea into something real.
        </p>
        <Link
          href="/d/creator/ideas/new"
          className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Start an idea
        </Link>
      </section>
    </aside>
  );
}
