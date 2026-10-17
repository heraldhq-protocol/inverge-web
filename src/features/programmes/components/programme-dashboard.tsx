"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowRight02Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Coins01Icon,
  Idea01Icon,
  StarAward01Icon,
  TrophyIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useMemo, useSyncExternalStore, type ReactNode } from "react";

import { Amount } from "@/components/ui/amount";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Pill } from "@/components/ui/pill";
import type { Programme, ProgrammeType } from "@/features/programmes/types";
import {
  PROGRAMME_STATUS_LABELS,
  PROGRAMME_TYPE_LABELS,
  daysUntil,
  formatProgrammeDate,
  nextDeadline,
  prizePoolTotal,
  programmeCounts,
  programmeStatusTone,
  securedSponsorFunding,
  validateProgramme,
} from "@/features/programmes/lib/programme";
import {
  getLocalProgrammesSnapshot,
  getServerProgrammesSnapshot,
  mergeProgrammes,
  subscribeLocalProgrammes,
} from "@/features/programmes/lib/local-store";

const typeIcons: Readonly<Record<ProgrammeType, IconSvgElement>> = {
  monthly_ideathon: TrophyIcon,
  sponsored_challenge: StarAward01Icon,
  showcase: Calendar03Icon,
  workshop: UserGroupIcon,
  expert_session: Idea01Icon,
  other: Idea01Icon,
};

function Kpi({
  icon,
  label,
  value,
  detail,
}: {
  icon: IconSvgElement;
  label: string;
  value: ReactNode;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted">{label}</p>
        <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand-strong">
          <HugeiconsIcon icon={icon} size={16} strokeWidth={1.8} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-[-0.035em] text-ink">
        {value}
      </p>
      <p className="mt-1 text-[0.6875rem] leading-4 text-muted">{detail}</p>
    </div>
  );
}

function ProgrammeCard({ programme }: { programme: Programme }) {
  const counts = programmeCounts(programme);
  const deadline = nextDeadline(programme);
  const days = deadline ? daysUntil(deadline.at) : null;
  const typeIcon = typeIcons[programme.type];
  const isPublic = programme.status !== "draft" && programme.status !== "archived";
  const publicHref = programme.type === "monthly_ideathon" ? "/ideathon" : null;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-canvas text-muted">
            <HugeiconsIcon icon={typeIcon} size={16} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <p className="text-[0.625rem] font-medium uppercase tracking-[0.1em] text-muted">
            {PROGRAMME_TYPE_LABELS[programme.type]}
          </p>
        </div>
        <Pill tone={programmeStatusTone(programme.status)} size="xs">
          {PROGRAMME_STATUS_LABELS[programme.status]}
        </Pill>
      </div>

      <h3 className="mt-2.5 text-base font-bold leading-snug tracking-[-0.025em] text-ink">
        {programme.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
        {programme.tagline}
      </p>

      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
        <div>
          <dd className="text-sm font-semibold tabular-nums text-ink">
            {counts.registrations}
          </dd>
          <dt className="text-[0.625rem] text-muted">Registered</dt>
        </div>
        <div>
          <dd className="text-sm font-semibold tabular-nums text-ink">
            {counts.submissions}
          </dd>
          <dt className="text-[0.625rem] text-muted">Submissions</dt>
        </div>
        <div>
          <dd className="truncate text-sm font-semibold tabular-nums text-ink">
            <Amount value={prizePoolTotal(programme.rewards)} compact />
          </dd>
          <dt className="text-[0.625rem] text-muted">Prize pool</dt>
        </div>
      </dl>

      {deadline ? (
        <p className="mt-3 flex items-center gap-1.5 text-[0.6875rem] text-muted">
          <HugeiconsIcon
            icon={Clock01Icon}
            size={13}
            strokeWidth={1.8}
            aria-hidden="true"
          />
          {deadline.label} {formatProgrammeDate(deadline.at)}
          {days !== null && days >= 0 ? (
            <span className="font-semibold text-ink">· {days}d</span>
          ) : null}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
        <Link
          href={`/admin/programmes/${programme.id}`}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-contrast px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Manage
          <HugeiconsIcon icon={ArrowRight02Icon} size={13} strokeWidth={2} aria-hidden="true" />
        </Link>
        {isPublic && publicHref ? (
          <Link
            href={publicHref}
            className="inline-flex min-h-9 items-center rounded-lg border border-border px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/35 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Public page
          </Link>
        ) : (
          <span className="text-[0.625rem] text-muted">
            {programme.status === "archived"
              ? "Archived"
              : "No public page yet"}
          </span>
        )}
        <Link
          href={`/admin/programmes/new?from=${programme.id}`}
          className="inline-flex min-h-9 items-center rounded-lg px-2 text-xs font-medium text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Duplicate
        </Link>
      </div>
    </article>
  );
}

type Task = {
  label: string;
  detail: string;
  href: string;
  tone: "warning" | "danger" | "neutral";
};

function outstandingTasks(programmes: readonly Programme[]): Task[] {
  const tasks: Task[] = [];

  for (const programme of programmes) {
    const issues = validateProgramme(programme);
    if (programme.status === "draft") {
      tasks.push({
        detail: `${programme.title} has not been published.`,
        href: `/admin/programmes/${programme.id}`,
        label: issues.length > 0 ? "Draft needs work" : "Draft ready to schedule",
        tone: issues.length > 0 ? "warning" : "neutral",
      });
    }
    const overdue = programme.sponsors.filter(
      (sponsor) => sponsor.invoiceStatus === "overdue",
    );
    for (const sponsor of overdue) {
      tasks.push({
        detail: `${sponsor.name} invoice is overdue.`,
        href: `/admin/programmes/${programme.id}?tab=sponsors`,
        label: "Sponsor payment overdue",
        tone: "danger",
      });
    }
    const unconfirmed = programme.sponsors.filter(
      (sponsor) =>
        sponsor.invoiceStatus === "paid" && !sponsor.confirmedByProvider,
    );
    for (const sponsor of unconfirmed) {
      tasks.push({
        detail: `${sponsor.name} is marked paid without provider confirmation.`,
        href: `/admin/programmes/${programme.id}?tab=sponsors`,
        label: "Unverified sponsor payment",
        tone: "danger",
      });
    }
    const underReview = programme.submissions.filter(
      (submission) => submission.status === "under_review",
    ).length;
    if (underReview > 0) {
      tasks.push({
        detail: `${underReview} submission${underReview === 1 ? "" : "s"} waiting for review.`,
        href: `/admin/programmes/${programme.id}?tab=submissions`,
        label: "Submission review",
        tone: "warning",
      });
    }
    if (
      programme.status === "results_review" &&
      !programme.snapshot?.published
    ) {
      tasks.push({
        detail: `${programme.title} is ready for result publication.`,
        href: `/admin/programmes/${programme.id}?tab=leaderboard`,
        label: "Publish results",
        tone: "warning",
      });
    }
  }

  return tasks.slice(0, 6);
}

export function ProgrammeDashboard({
  initialProgrammes,
}: {
  initialProgrammes: readonly Programme[];
}) {
  const localProgrammes = useSyncExternalStore(
    subscribeLocalProgrammes,
    getLocalProgrammesSnapshot,
    getServerProgrammesSnapshot,
  );
  const programmes = useMemo(
    () => mergeProgrammes(initialProgrammes, localProgrammes),
    [initialProgrammes, localProgrammes],
  );

  const live = programmes.filter(
    (programme) =>
      programme.status === "registration_open" ||
      programme.status === "submission_open" ||
      programme.status === "judging",
  );
  const drafts = programmes.filter((programme) => programme.status === "draft");
  const scheduled = programmes.filter(
    (programme) => programme.status === "scheduled",
  );
  const completed = programmes.filter(
    (programme) =>
      programme.status === "completed" ||
      programme.status === "results_review" ||
      programme.status === "archived",
  );

  const registrations = programmes.reduce(
    (sum, programme) => sum + programme.registrations.length,
    0,
  );
  const submissions = programmes.reduce(
    (sum, programme) => sum + programme.submissions.length,
    0,
  );
  const secured = programmes.reduce(
    (sum, programme) => sum + BigInt(securedSponsorFunding(programme).atomic),
    0n,
  );

  const deadlines = programmes
    .map((programme) => ({ programme, deadline: nextDeadline(programme) }))
    .filter(
      (entry): entry is { programme: Programme; deadline: { at: string; label: string } } =>
        Boolean(entry.deadline),
    )
    .toSorted(
      (left, right) =>
        new Date(left.deadline.at).getTime() - new Date(right.deadline.at).getTime(),
    )
    .slice(0, 5);

  const tasks = outstandingTasks(programmes);
  const groups = [
    { label: "Draft", programmes: drafts },
    { label: "Scheduled", programmes: scheduled },
    { label: "Live and judging", programmes: live },
    { label: "Completed and archived", programmes: completed },
  ].filter((group) => group.programmes.length > 0);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Programmes</Eyebrow>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
            Run the next edition
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
            Ideathons, sponsor challenges, showcases, workshops, and expert
            sessions share one lifecycle, one judging model, and one audit trail.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/ideathon"
            className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/35 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Preview public ideathon
          </Link>
          <Link
            href="/admin/programmes/new"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2} aria-hidden="true" />
            Create programme
          </Link>
        </div>
      </header>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={TrophyIcon}
          label="Live programmes"
          value={String(live.length)}
          detail={`${drafts.length} draft · ${scheduled.length} scheduled`}
        />
        <Kpi
          icon={UserGroupIcon}
          label="Registrations"
          value={registrations.toLocaleString("en-US")}
          detail="Across every programme record"
        />
        <Kpi
          icon={Idea01Icon}
          label="Submissions"
          value={submissions.toLocaleString("en-US")}
          detail="Drafts excluded from judging"
        />
        <Kpi
          icon={Coins01Icon}
          label="Sponsor funding secured"
          value={
            <Amount
              value={{ atomic: secured.toString(), currency: "USD", decimals: 2 }}
              compact
            />
          }
          detail="Provider-confirmed invoices only. Committed funding is not secured."
        />
      </dl>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          {groups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-strong bg-surface p-8 text-center">
              <p className="text-sm font-semibold text-ink">No programmes yet</p>
              <p className="mt-1 text-xs text-muted">
                Create a draft to schedule the next ideathon or challenge.
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <section key={group.label} aria-labelledby={`group-${group.label}`}>
                <div className="flex items-center justify-between gap-3">
                  <h2
                    id={`group-${group.label}`}
                    className="text-sm font-bold text-ink"
                  >
                    {group.label}
                  </h2>
                  <span className="text-xs tabular-nums text-muted">
                    {group.programmes.length}
                  </span>
                </div>
                <ul className="mt-2 grid gap-3 lg:grid-cols-2">
                  {group.programmes.map((programme) => (
                    <li key={programme.id} className="grid">
                      <ProgrammeCard programme={programme} />
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        <aside className="space-y-3">
          <section className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={Calendar03Icon}
                size={15}
                strokeWidth={1.8}
                aria-hidden="true"
                className="text-brand-strong"
              />
              <h2 className="text-sm font-bold text-ink">Upcoming deadlines</h2>
            </div>
            {deadlines.length > 0 ? (
              <ul className="mt-3 space-y-2.5">
                {deadlines.map(({ programme, deadline }) => (
                  <li key={`${programme.id}-${deadline.label}`}>
                    <p className="text-xs font-semibold text-ink">
                      {deadline.label}
                    </p>
                    <p className="text-[0.6875rem] text-muted">
                      {formatProgrammeDate(deadline.at, true)} ·{" "}
                      {programme.title}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-muted">No scheduled deadlines.</p>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4">
            <h2 className="text-sm font-bold text-ink">Needs attention</h2>
            {tasks.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {tasks.map((task, index) => (
                  <li key={`${task.href}-${task.label}-${index}`}>
                    <Link
                      href={task.href}
                      className="block rounded-lg border border-border p-2.5 transition-colors hover:border-brand/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      <span
                        className={`text-[0.6875rem] font-semibold ${
                          task.tone === "danger"
                            ? "text-danger"
                            : task.tone === "warning"
                              ? "text-warning-strong"
                              : "text-ink"
                        }`}
                      >
                        {task.label}
                      </span>
                      <span className="mt-0.5 block text-[0.625rem] leading-4 text-muted">
                        {task.detail}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={14}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="text-brand-strong"
                />
                Nothing urgent.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-brand-tint p-4">
            <h2 className="text-sm font-bold text-ink">Preview boundary</h2>
            <p className="mt-1 text-[0.6875rem] leading-4 text-muted">
              Programme records, registrations, scores, and sponsor invoices in
              this workspace are sample data. Local edits disappear on reload and
              nothing is sent to the API.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
