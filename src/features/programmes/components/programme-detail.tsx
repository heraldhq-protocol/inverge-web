import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  ArrowUpRight01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  InformationCircleIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ProgrammeDetailNav } from "@/features/programmes/components/programme-detail-nav";
import { ProgrammeEntryList } from "@/features/programmes/components/programme-entry-list";
import { ProgrammeLeaderboard } from "@/features/programmes/components/programme-leaderboard";
import { ProgrammeSponsorWall } from "@/features/programmes/components/programme-sponsor-wall";
import { PhaseBadge } from "@/features/programmes/components/phase-badge";
import type {
  ProgrammeStanding,
  PublicProgramme,
  PublicProgrammeEntry,
  RubricCriterion,
} from "@/features/programmes/api/types";
import { readFaqs } from "@/features/programmes/api/types";
import {
  entryModeLabel,
  formatDate,
  formatDateRange,
  formatDateTime,
  judgingMethodLabel,
  methodologySummary,
  prizeAmount,
  PROGRAMME_TYPE_LABELS,
  statusLabel,
  winningRange,
} from "@/features/programmes/lib/public-programme";

function Section({
  children,
  description,
  eyebrow,
  id,
  title,
}: {
  children: React.ReactNode;
  description?: string;
  eyebrow: string;
  id: string;
  title: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        id={`${id}-title`}
        className="mt-2 text-balance text-2xl font-bold tracking-[-0.04em] text-ink sm:text-[1.75rem]"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-[65ch] text-sm leading-6 text-ink-soft">
          {description}
        </p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-t border-border py-3 first:border-t-0 first:pt-0">
      <dt className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-5 text-ink">{value}</dd>
    </div>
  );
}

function deadlineLine(programme: PublicProgramme): string {
  if (programme.phase === "SUBMISSION_OPEN") {
    return `Submissions close ${formatDate(programme.timeline.submissionClosesAt)}`;
  }
  if (programme.phase === "REGISTRATION_OPEN") {
    return `Registration closes ${formatDate(programme.timeline.registrationClosesAt)}`;
  }
  if (programme.phase === "SCHEDULED") {
    return `Opens ${formatDate(programme.timeline.registrationOpensAt)}`;
  }
  if (programme.phase === "JUDGING") {
    return `Judging ends ${formatDate(programme.timeline.judgingEndsAt)}`;
  }
  if (programme.phase === "RESULTS_REVIEW") {
    return `Results due ${formatDate(programme.timeline.resultsAt)}`;
  }
  return `Closed ${formatDate(programme.timeline.judgingEndsAt)}`;
}

const tieBreakLabels: Record<
  PublicProgramme["judging"]["tieBreak"][number]["type"],
  (rule: PublicProgramme["judging"]["tieBreak"][number]) => string
> = {
  CRITERION: (rule) =>
    `Higher score on ${(rule.criteria ?? []).join(", ") || "the named criterion"}`,
  CRITERIA_AVERAGE: () => "Higher average across the rubric criteria",
  SUBMITTED_AT: () => "Earlier qualifying submission",
  JUDGE_DECISION: () => "Authorised judge decision (curated programmes only)",
};

function timelineState(
  date: string,
  now: number,
): "past" | "current" | "upcoming" {
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return "upcoming";
  const day = 24 * 60 * 60 * 1000;
  if (time + day < now) return "past";
  if (time <= now) return "current";
  return "upcoming";
}

export function ProgrammeDetail({
  entries,
  entriesUnavailable = false,
  programme,
}: {
  entries: PublicProgrammeEntry[];
  entriesUnavailable?: boolean;
  programme: PublicProgramme;
}) {
  const now = Date.now();
  const faqs = readFaqs(programme.faqs);
  const standings: ProgrammeStanding[] = programme.results?.standings ?? [];
  const prizesLabel = winningRange(programme.prizes);
  const submitHref = `/d/ideathons/${programme.slug}`;
  const primaryHref =
    programme.phase === "SUBMISSION_OPEN" ||
    programme.phase === "REGISTRATION_OPEN"
      ? submitHref
      : programme.results
        ? "#leaderboard"
        : "#timeline";
  const primaryLabel =
    programme.phase === "SUBMISSION_OPEN"
      ? "Enter this programme"
      : programme.phase === "REGISTRATION_OPEN"
        ? "Register for this programme"
        : programme.results
          ? "See the results"
          : programme.phase === "JUDGING" ||
              programme.phase === "RESULTS_REVIEW"
            ? "How judging works"
            : "See the timeline";

  const milestones = [
    {
      label: "Registration opens",
      date: programme.timeline.registrationOpensAt,
    },
    {
      label: "Registration closes",
      date: programme.timeline.registrationClosesAt,
    },
    {
      label: "Submissions open",
      date: programme.timeline.submissionOpensAt,
    },
    {
      label: "Submissions close",
      date: programme.timeline.submissionClosesAt,
    },
    {
      label: "Judging",
      date: programme.timeline.judgingStartsAt,
    },
    {
      label: "Judging ends",
      date: programme.timeline.judgingEndsAt,
    },
    {
      label: "Results",
      date: programme.timeline.resultsAt,
    },
  ] as const;

  return (
    <>
      <section className="border-b border-border bg-surface">
        <Container className="py-8 sm:py-10 lg:py-12">
          <nav aria-label="Breadcrumb" className="mb-5">
            <Link
              href="/ideathon"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={13}
                strokeWidth={2}
                aria-hidden="true"
                className="rotate-180"
              />
              All ideathons
            </Link>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <PhaseBadge phase={programme.phase} />
                <span className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-muted">
                  {PROGRAMME_TYPE_LABELS[programme.type]}
                </span>
                {programme.category ? (
                  <span className="text-[0.625rem] uppercase tracking-[0.12em] text-muted">
                    · {programme.category}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-4 max-w-[20ch] text-balance text-[2.35rem] font-bold leading-[1.02] tracking-[-0.055em] text-ink sm:text-5xl">
                {programme.title}
              </h1>
              <p className="mt-4 max-w-[62ch] text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
                {programme.tagline}
              </p>
              {programme.heroCopy &&
              programme.heroCopy !== programme.tagline ? (
                <p className="mt-3 max-w-[62ch] text-sm leading-6 text-muted">
                  {programme.heroCopy}
                </p>
              ) : null}

              <dl className="mt-6 grid max-w-2xl gap-x-8 gap-y-3 border-t border-border pt-4 sm:grid-cols-3">
                <div>
                  <dt className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-muted">
                    Runs
                  </dt>
                  <dd className="mt-1 text-xs leading-5 text-ink">
                    {formatDateRange(
                      programme.timeline.registrationOpensAt,
                      programme.timeline.judgingEndsAt,
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-muted">
                    Organiser
                  </dt>
                  <dd className="mt-1 text-xs leading-5 text-ink">
                    {programme.organiser || "Not stated"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-muted">
                    Entries
                  </dt>
                  <dd className="mt-1 text-xs leading-5 text-ink">
                    {programme.entryCount}{" "}
                    {programme.entryCount === 1
                      ? "entry recorded"
                      : "entries recorded"}
                  </dd>
                </div>
              </dl>
            </div>

            <aside className="lg:pt-1">
              <div className="border border-border bg-canvas p-5">
                <p className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
                  {programme.phase === "COMPLETED" ||
                  programme.phase === "ARCHIVED"
                    ? "Results"
                    : "Take part"}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-ink">
                  <HugeiconsIcon
                    icon={Clock01Icon}
                    size={15}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className="shrink-0 text-muted"
                  />
                  {deadlineLine(programme)}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted">
                  {programme.entryPolicy.registrationRequired
                    ? "Registration is required before an entry can be submitted."
                    : "Registration is not required; you can submit directly."}
                </p>

                <Link
                  href={primaryHref}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {primaryLabel}
                  <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    size={15}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </Link>

                <dl className="mt-4 border-t border-border pt-3 text-xs">
                  <div className="flex items-center justify-between gap-3 py-1">
                    <dt className="text-muted">Entry</dt>
                    <dd className="font-semibold text-ink">Free</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-1">
                    <dt className="text-muted">Format</dt>
                    <dd className="text-right font-semibold text-ink">
                      {entryModeLabel(programme.entryPolicy.entryMode)}
                    </dd>
                  </div>
                  {prizesLabel ? (
                    <div className="flex items-center justify-between gap-3 py-1">
                      <dt className="text-muted">Prizes</dt>
                      <dd className="text-right font-semibold text-ink">
                        {prizesLabel}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-3 py-1">
                    <dt className="text-muted">Teams</dt>
                    <dd className="text-right font-semibold text-ink">
                      {programme.entryPolicy.allowTeams
                        ? `Allowed, ${programme.entryPolicy.teamMinSize ?? 1}-${programme.entryPolicy.teamMaxSize ?? "?"}`
                        : "Individual"}
                    </dd>
                  </div>
                </dl>
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-[0.6875rem] leading-5 text-muted">
                <HugeiconsIcon
                  icon={Shield01Icon}
                  size={13}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-brand-strong"
                />
                Paid promotion is labelled and never counted in judging.
              </p>
            </aside>
          </div>
        </Container>
      </section>

      <Container>
        <ProgrammeDetailNav />

        <div className="py-10 sm:py-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-14">
            <div className="min-w-0 space-y-12">
              <Section
                id="overview"
                eyebrow="The brief"
                title="What this programme asks for"
              >
                <div className="max-w-[68ch] space-y-4 text-sm leading-7 text-ink-soft">
                  {programme.description
                    .split(/\n{2,}/)
                    .filter(Boolean)
                    .map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>
                {programme.rules.length > 0 ? (
                  <div className="mt-6 border-l-2 border-brand/35 pl-4">
                    <h3 className="text-sm font-bold text-ink">
                      Programme rules
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {programme.rules.map((rule) => (
                        <li
                          key={rule}
                          className="flex gap-2.5 text-sm leading-6 text-ink-soft"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 size-1.5 shrink-0 rounded-full bg-brand"
                          />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </Section>

              <Section
                id="eligibility"
                eyebrow="Who can enter"
                title="Eligibility and submission requirements"
              >
                <dl className="grid gap-x-8 sm:grid-cols-2">
                  <Fact
                    label="Entry mode"
                    value={entryModeLabel(programme.entryPolicy.entryMode)}
                  />
                  <Fact
                    label="Registration"
                    value={
                      programme.entryPolicy.registrationRequired
                        ? "Required before submitting"
                        : "Not required"
                    }
                  />
                  <Fact
                    label="Entries per participant"
                    value={
                      programme.entryPolicy.maxEntriesPerParticipant > 1
                        ? `Up to ${programme.entryPolicy.maxEntriesPerParticipant}`
                        : "One"
                    }
                  />
                  <Fact
                    label="Teams"
                    value={
                      programme.entryPolicy.allowTeams
                        ? `Allowed, ${programme.entryPolicy.teamMinSize ?? 1}-${programme.entryPolicy.teamMaxSize ?? "?"} people`
                        : "Individual entries only"
                    }
                  />
                  {programme.entryPolicy.allowedCategories.length > 0 ? (
                    <Fact
                      label="Allowed categories"
                      value={programme.entryPolicy.allowedCategories.join(", ")}
                    />
                  ) : null}
                  {programme.entryPolicy.minQualityScore !== null ? (
                    <Fact
                      label="Minimum idea quality"
                      value={`${programme.entryPolicy.minQualityScore.toFixed(2)} out of 1.00`}
                    />
                  ) : null}
                  <Fact
                    label="Attachments"
                    value={
                      programme.entryPolicy.maxAttachments > 0
                        ? `Up to ${programme.entryPolicy.maxAttachments}`
                        : "None"
                    }
                  />
                  <Fact
                    label="Withdrawal"
                    value={
                      programme.entryPolicy.allowWithdrawal
                        ? "Allowed before judging starts"
                        : "Not available after submission"
                    }
                  />
                </dl>

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      size={14}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className="text-brand-strong"
                    />
                    {programme.entryPolicy.lateEntriesAllowed
                      ? "Late entries are allowed"
                      : "Late entries are not accepted"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <HugeiconsIcon
                      icon={InformationCircleIcon}
                      size={14}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className="text-muted"
                    />
                    The submission form is the final word on required fields.
                  </span>
                </div>

                <div id="enter" className="mt-6 scroll-mt-24">
                  <Link
                    href={submitHref}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    Open your participant workspace
                    <HugeiconsIcon
                      icon={ArrowUpRight01Icon}
                      size={15}
                      strokeWidth={1.9}
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </Section>

              <Section
                id="timeline"
                eyebrow="Schedule"
                title="What happens, and when"
                description="All dates are shown in UTC. A milestone is only marked complete when its published time has passed."
              >
                <ol className="border-t border-border">
                  {milestones.map((milestone) => {
                    const state = timelineState(milestone.date, now);
                    return (
                      <li
                        key={`${milestone.label}-${milestone.date}`}
                        className="flex items-start gap-3 border-b border-border py-3.5"
                      >
                        <span
                          aria-hidden="true"
                          className={`mt-1.5 size-2 shrink-0 rounded-full ${
                            state === "past"
                              ? "bg-brand"
                              : state === "current"
                                ? "bg-warning"
                                : "border border-border-strong bg-canvas"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-ink">
                            {milestone.label}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">
                            {formatDateTime(milestone.date)}
                          </p>
                        </div>
                        <span className="shrink-0 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-muted">
                          {state === "past"
                            ? "Done"
                            : state === "current"
                              ? "Now"
                              : "Upcoming"}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </Section>

              <Section
                id="prizes"
                eyebrow="Prizes"
                title="What is actually on offer"
                description="Only verified, advertisable prizes appear here. A prize is not shown just because the programme hopes to offer one."
              >
                {programme.prizes.length === 0 ? (
                  <p className="border-t border-border pt-4 text-sm leading-6 text-muted">
                    No prizes have been published for this programme.
                  </p>
                ) : (
                  <ul className="border-t border-border">
                    {programme.prizes.map((prize) => {
                      const amount = prizeAmount(prize);
                      return (
                        <li
                          key={prize.id}
                          className="border-b border-border py-4"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <div className="flex items-baseline gap-3">
                              <span className="font-mono text-xs tabular-nums text-brand-strong">
                                {String(prize.placement).padStart(2, "0")}
                              </span>
                              <h3 className="text-sm font-bold text-ink">
                                {prize.title}
                              </h3>
                            </div>
                            <span className="text-sm font-bold tabular-nums text-ink">
                              {amount ?? "Non-cash"}
                            </span>
                          </div>
                          {prize.description ? (
                            <p className="mt-1 pl-7 text-xs leading-5 text-muted">
                              {prize.description}
                            </p>
                          ) : null}
                          {prize.awardCriteria ? (
                            <p className="mt-1 pl-7 text-xs leading-5 text-muted">
                              Awarded for: {prize.awardCriteria}
                            </p>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Section>

              <Section
                id="judging"
                eyebrow="Judging"
                title="The published method"
                description={methodologySummary(programme)}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="border border-border bg-surface p-4">
                    <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-muted">
                      Method
                    </p>
                    <p className="mt-1 text-sm font-semibold text-ink">
                      {judgingMethodLabel(programme.judging.method)}
                    </p>
                    {programme.judging.method === "HYBRID" ? (
                      <p className="mt-1 text-xs leading-5 text-muted">
                        Judge {programme.judging.judgeWeight}% · Community{" "}
                        {programme.judging.communityWeight}%
                      </p>
                    ) : null}
                  </div>
                  {programme.judging.method === "JUDGES" ||
                  programme.judging.method === "HYBRID" ? (
                    <div className="border border-border bg-surface p-4">
                      <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-muted">
                        Missing evaluations
                      </p>
                      <p className="mt-1 text-sm font-semibold text-ink">
                        {programme.judging.missingEvaluationPolicy === "EXCLUDE"
                          ? "Excluded, with a published reason"
                          : "Counted as zero"}
                      </p>
                      {programme.judging.minimumEvaluations > 0 ? (
                        <p className="mt-1 text-xs leading-5 text-muted">
                          At least {programme.judging.minimumEvaluations}{" "}
                          complete{" "}
                          {programme.judging.minimumEvaluations === 1
                            ? "evaluation"
                            : "evaluations"}{" "}
                          required.
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <div className="border border-border bg-surface p-4">
                      <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-muted">
                        {programme.judging.method === "COMMUNITY"
                          ? "Community score"
                          : "Official order"}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-ink">
                        {programme.judging.method === "COMMUNITY"
                          ? "Support from verified accounts, normalised to the highest entry"
                          : "Set by the organiser's authorised curation"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted">
                        {programme.judging.method === "COMMUNITY"
                          ? "No judge evaluation is used in this method."
                          : "No numeric judge score is used in this method."}
                      </p>
                    </div>
                  )}
                </div>

                {programme.judging.rubric.length > 0 ? (
                  <div className="mt-5">
                    <h3 className="text-sm font-bold text-ink">
                      Rubric criteria
                    </h3>
                    <ul className="mt-2 border-t border-border">
                      {programme.judging.rubric.map(
                        (criterion: RubricCriterion) => (
                          <li
                            key={criterion.id}
                            className="flex flex-wrap items-start justify-between gap-2 border-b border-border py-3"
                          >
                            <div className="min-w-0 max-w-[52ch]">
                              <p className="text-sm font-semibold text-ink">
                                {criterion.label}
                              </p>
                              {criterion.description ? (
                                <p className="mt-0.5 text-xs leading-5 text-muted">
                                  {criterion.description}
                                </p>
                              ) : null}
                            </div>
                            <div className="text-right text-xs text-muted">
                              <p className="font-semibold text-ink">
                                {criterion.weight}% weight
                              </p>
                              <p>
                                Score {criterion.minScore}-{criterion.maxScore}
                              </p>
                            </div>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                ) : null}

                {programme.judging.tieBreak.length > 0 ? (
                  <div className="mt-5">
                    <h3 className="text-sm font-bold text-ink">
                      Tie-break order
                    </h3>
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-ink-soft">
                      {programme.judging.tieBreak.map((rule, index) => (
                        <li key={`${rule.type}-${index}`}>
                          {tieBreakLabels[rule.type](rule)}
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                <p className="mt-5 text-xs leading-5 text-muted">
                  {programme.results?.methodology.formula ??
                    methodologySummary(programme)}
                  {programme.results
                    ? ` Published as revision ${programme.results.revision} with a reproducibility checksum.`
                    : ""}
                </p>
              </Section>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <div className="border border-border bg-surface p-4">
                <h2 className="text-sm font-bold text-ink">At a glance</h2>
                <dl className="mt-2">
                  <Fact label="Status" value={statusLabel(programme.status)} />
                  <Fact
                    label="Entries"
                    value={`${programme.entryCount} recorded`}
                  />
                  <Fact
                    label="Registration"
                    value={
                      programme.entryPolicy.registrationRequired
                        ? "Required"
                        : "Not required"
                    }
                  />
                  <Fact
                    label="Judging"
                    value={judgingMethodLabel(programme.judging.method)}
                  />
                </dl>
              </div>

              <ProgrammeSponsorWall sponsors={programme.sponsors} />

              <div className="border border-border bg-brand-tint p-4">
                <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-brand-strong">
                  Integrity
                </p>
                <p className="mt-2 text-xs leading-5 text-ink-soft">
                  Support is counted from verified community activity. A sponsor
                  payment, boost or advertisement is never an input to the
                  official score.
                </p>
                <Link
                  href="/ideathon/rules"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-strong underline decoration-brand/25 underline-offset-4 hover:decoration-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Read the rules
                  <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    size={13}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </aside>
          </div>

          <div className="mt-12 space-y-12">
            <Section
              id="entries"
              eyebrow="Entries"
              title="The ideas in this programme"
              description="Public entries, without drafts or withdrawn work."
            >
              <ProgrammeEntryList
                entries={entries}
                unavailable={entriesUnavailable}
              />
            </Section>

            <Section
              id="leaderboard"
              eyebrow="Leaderboard"
              title="Official standings"
              description={
                programme.results
                  ? "Published from stored submissions and evaluations. The order below is the order the scoring service produced; the UI does not re-rank it."
                  : "Standings are published only when the organiser releases results. Before then, there is no public score to imply."
              }
            >
              {programme.results ? (
                <ProgrammeLeaderboard
                  entries={entries}
                  programme={programme}
                  standings={standings}
                />
              ) : (
                <LeaderboardPending programme={programme} />
              )}
            </Section>

            <Section id="faqs" eyebrow="Questions" title="What entrants ask">
              {faqs.length === 0 ? (
                <p className="border-t border-border pt-4 text-sm leading-6 text-muted">
                  The organiser has not published FAQs for this programme.
                </p>
              ) : (
                <div className="border-t border-border">
                  {faqs.map((faq) => (
                    <details
                      key={faq.question}
                      className="group border-b border-border py-3"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
                        {faq.question}
                        <span
                          aria-hidden="true"
                          className="text-lg leading-none text-muted transition-transform group-open:rotate-45 motion-reduce:transition-none"
                        >
                          +
                        </span>
                      </summary>
                      <p className="mt-2 max-w-[68ch] text-sm leading-6 text-ink-soft">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              )}
            </Section>

            {programme.announcements.length > 0 ? (
              <section aria-labelledby="announcements">
                <Eyebrow>Announcements</Eyebrow>
                <h2
                  id="announcements"
                  className="mt-2 text-2xl font-bold tracking-[-0.04em] text-ink"
                >
                  From the organiser
                </h2>
                <ul className="mt-4 space-y-4">
                  {programme.announcements.map((announcement) => (
                    <li
                      key={announcement.id}
                      className="border-l-2 border-brand/35 pl-4"
                    >
                      <h3 className="text-sm font-bold text-ink">
                        {announcement.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted">
                        {formatDateTime(announcement.publishedAt)}
                      </p>
                      <p className="mt-1 max-w-[68ch] whitespace-pre-line text-sm leading-6 text-ink-soft">
                        {announcement.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>
      </Container>
    </>
  );
}

/**
 * Public leaderboard states. Nothing here invents a score: a reader is told
 * which phase the programme is in and where the result will appear.
 */
function LeaderboardPending({ programme }: { programme: PublicProgramme }) {
  const state = (() => {
    if (programme.phase === "RESULTS_REVIEW") {
      return {
        icon: Clock01Icon,
        title: "Results are under review",
        body: "Participants can see provisional results in their workspace. Public standings are published after the review closes.",
      };
    }
    if (programme.phase === "JUDGING") {
      return {
        icon: Clock01Icon,
        title: "Judging is in progress",
        body: "Scores stay private until every required evaluation is in and the organiser publishes a result. There is no live public score to refresh.",
      };
    }
    if (programme.phase === "SUBMISSION_OPEN") {
      return {
        icon: Calendar03Icon,
        title: "Entries are still open",
        body: `Standings publish after submissions close on ${formatDate(programme.timeline.submissionClosesAt)} and judging finishes. The leaderboard is not a live popularity chart.`,
      };
    }
    if (programme.phase === "REGISTRATION_OPEN") {
      return {
        icon: Calendar03Icon,
        title: "Registration is open",
        body: "Standings publish after submissions close and judging finishes. No score is public before then.",
      };
    }
    if (programme.phase === "SCHEDULED") {
      return {
        icon: Calendar03Icon,
        title: "This programme has not opened",
        body: `Registration opens ${formatDate(programme.timeline.registrationOpensAt)}. The leaderboard will appear after results are published.`,
      };
    }
    return {
      icon: InformationCircleIcon,
      title: "No results were published",
      body: "This edition closed without a public result publication. The organiser may have withheld results or published them only to participants.",
    };
  })();

  return (
    <div className="border-t border-border pt-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-strong">
          <HugeiconsIcon
            icon={state.icon}
            size={17}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <div>
          <p className="text-sm font-bold text-ink">{state.title}</p>
          <p className="mt-1 max-w-[62ch] text-sm leading-6 text-muted">
            {state.body}
          </p>
        </div>
      </div>
    </div>
  );
}
