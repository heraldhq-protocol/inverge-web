"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon, Shield01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Amount } from "@/components/ui/amount";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NgnEstimate } from "@/components/ui/ngn-estimate";
import { Pill } from "@/components/ui/pill";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  AuditEntry,
  Programme,
  ProgrammeStatus,
  RegistrationStatus,
  RewardFulfilmentStatus,
  SubmissionStatus,
} from "@/features/programmes/types";
import { ROLE_PERMISSIONS } from "@/features/programmes/types";
import {
  PROGRAMME_STATUS_LABELS,
  PROGRAMME_TYPE_LABELS,
  canTransitionProgramme,
  computeLeaderboard,
  daysUntil,
  formatProgrammeDate,
  isSafeLogoUrl,
  moduleAvailabilityLabel,
  moduleLabel,
  nextDeadline,
  prizePoolTotal,
  programmeCounts,
  programmeStatusTone,
  publishChecklist,
  roleCan,
  securedSponsorFunding,
  submissionFor,
} from "@/features/programmes/lib/programme";
import {
  previewAiUsage,
  previewAuditEntries,
} from "@/features/programmes/content/preview-programmes";
import { saveLocalProgramme } from "@/features/programmes/lib/local-store";
import {
  SponsorLogo,
  SponsorLogoWall,
  sortSponsorsForDisplay,
} from "@/features/programmes/components/sponsor-logo";
import {
  advancePrize,
  markInvoicePaid,
} from "@/features/programmes/lib/monetisation";

type TabId =
  | "overview"
  | "participants"
  | "submissions"
  | "judging"
  | "leaderboard"
  | "rewards"
  | "sponsors"
  | "branding"
  | "schedule"
  | "ai"
  | "settings";

const TABS: readonly { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "participants", label: "Participants" },
  { id: "submissions", label: "Submissions" },
  { id: "judging", label: "Judging" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "rewards", label: "Rewards" },
  { id: "sponsors", label: "Sponsors" },
  { id: "branding", label: "Branding" },
  { id: "schedule", label: "Schedule" },
  { id: "ai", label: "AI & analytics" },
  { id: "settings", label: "Settings" },
];

function Section({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-ink">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs leading-5 text-muted">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Kpi({
  label,
  value,
  detail,
}: {
  label: string;
  value: React.ReactNode;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-[0.6875rem] text-muted">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-ink">{value}</p>
      <p className="mt-0.5 text-[0.625rem] leading-4 text-muted">{detail}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border-strong px-4 py-6 text-center text-xs text-muted">
      {text}
    </p>
  );
}

export function ProgrammeWorkspace({
  initialProgramme,
  initialTab = "overview",
}: {
  initialProgramme: Programme;
  initialTab?: TabId;
}) {
  const [record, setRecord] = useState(initialProgramme);
  const [tab, setTab] = useState<TabId>(initialTab);
  const [notice, setNotice] = useState<string | null>(null);
  const [participantQuery, setParticipantQuery] = useState("");
  const [participantStatus, setParticipantStatus] = useState<
    RegistrationStatus | "all"
  >("all");
  const [submissionQuery, setSubmissionQuery] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<
    SubmissionStatus | "all"
  >("all");
  const [brandingDraft, setBrandingDraft] = useState({
    description: record.description,
    heroCopy: record.heroCopy,
  });
  const [invoiceRefs, setInvoiceRefs] = useState<Record<string, string>>({});
  const [invoiceConfirmed, setInvoiceConfirmed] = useState<
    Record<string, boolean>
  >({});
  const [logoDrafts, setLogoDrafts] = useState<Record<string, string>>({});
  const [evidence, setEvidence] = useState<Record<string, string>>({});
  const [localAudit, setLocalAudit] = useState<AuditEntry[]>([]);

  const counts = programmeCounts(record);
  const pool = prizePoolTotal(record.rewards);
  const secured = securedSponsorFunding(record);
  const checks = publishChecklist(record);
  const deadline = nextDeadline(record);
  const leaderboard = useMemo(() => computeLeaderboard(record), [record]);

  function audit(
    action: string,
    target: string,
    before?: string,
    after?: string,
  ) {
    setLocalAudit((current) => [
      {
        action,
        actor: "Ada Admin",
        actorRole: "platform_admin",
        after,
        at: new Date().toISOString(),
        before,
        id: `local-${current.length}-${Date.now()}`,
        target,
      },
      ...current,
    ]);
  }

  function update(next: Programme, message: string) {
    setRecord(next);
    saveLocalProgramme(next);
    setNotice(message);
  }

  function changeStatus(status: ProgrammeStatus) {
    if (!canTransitionProgramme(record.status, status)) {
      setNotice(
        `Cannot move from ${PROGRAMME_STATUS_LABELS[record.status]} to ${PROGRAMME_STATUS_LABELS[status]}.`,
      );
      return;
    }
    update(
      { ...record, status, updatedAt: new Date().toISOString() },
      `Status changed to ${PROGRAMME_STATUS_LABELS[status]} in this preview.`,
    );
    audit("Programme status changed", record.title, record.status, status);
  }

  function publishResults() {
    if (record.rubric.resultsVisibility === "private") {
      setNotice(
        "Results visibility is private. Change it in Judging before publishing.",
      );
      return;
    }
    const snapshot = {
      capturedAt: new Date().toISOString(),
      checksum: `sha256-preview-${Date.now().toString(36)}`,
      entries: leaderboard.map((entry) => ({ ...entry, frozen: true })),
      published: true,
    };
    update(
      {
        ...record,
        snapshot,
        status: "completed",
        updatedAt: new Date().toISOString(),
      },
      "Leaderboard snapshot frozen and results published in this preview.",
    );
    audit("Results published", record.title, "unpublished", snapshot.checksum);
  }

  function updateSubmission(id: string, status: SubmissionStatus) {
    const before = record.submissions.find((item) => item.id === id)?.status;
    update(
      {
        ...record,
        submissions: record.submissions.map((item) =>
          item.id === id ? { ...item, status } : item,
        ),
        updatedAt: new Date().toISOString(),
      },
      "Submission status updated in this preview.",
    );
    audit("Submission status changed", id, before, status);
  }

  function updateReward(id: string, next: RewardFulfilmentStatus) {
    const reward = record.rewards.find((item) => item.id === id);
    if (!reward) return;
    const result = advancePrize(reward.fulfilmentStatus, next, evidence[id]);
    if (result === reward.fulfilmentStatus) {
      setNotice(
        next === "delivered"
          ? "Add a delivery reference before marking this reward delivered."
          : `Cannot move a reward from ${reward.fulfilmentStatus} to ${next}.`,
      );
      return;
    }
    update(
      {
        ...record,
        rewards: record.rewards.map((item) =>
          item.id === id ? { ...item, fulfilmentStatus: result } : item,
        ),
        updatedAt: new Date().toISOString(),
      },
      "Reward fulfilment updated in this preview.",
    );
    audit(
      "Reward fulfilment changed",
      reward.title,
      reward.fulfilmentStatus,
      result,
    );
  }

  function confirmInvoice(sponsorId: string) {
    const sponsor = record.sponsors.find((item) => item.id === sponsorId);
    if (!sponsor) return;
    const reference = invoiceRefs[sponsorId]?.trim() ?? "";
    const confirmed = invoiceConfirmed[sponsorId] ?? false;
    const status = markInvoicePaid(sponsor.invoiceStatus, {
      method: "offline_transfer",
      reference,
      verified: confirmed,
    });
    if (status === sponsor.invoiceStatus) {
      setNotice(
        "Add a payment reference and confirm the transfer was verified.",
      );
      return;
    }
    update(
      {
        ...record,
        sponsors: record.sponsors.map((item) =>
          item.id === sponsorId
            ? { ...item, confirmedByProvider: true, invoiceStatus: status }
            : item,
        ),
        updatedAt: new Date().toISOString(),
      },
      "Sponsor invoice marked paid from a verified offline transfer (preview).",
    );
    audit(
      "Sponsor invoice marked paid",
      sponsor.name,
      sponsor.invoiceStatus,
      status,
    );
  }

  function saveBranding() {
    update(
      {
        ...record,
        description: brandingDraft.description,
        heroCopy: brandingDraft.heroCopy,
        updatedAt: new Date().toISOString(),
      },
      "Public copy saved in this preview.",
    );
    audit("Public copy updated", record.title);
  }

  function saveSponsorLogo(sponsorId: string) {
    const sponsor = record.sponsors.find((entry) => entry.id === sponsorId);
    if (!sponsor) return;

    const value = (logoDrafts[sponsorId] ?? sponsor.logoUrl ?? "").trim();
    if (value && !isSafeLogoUrl(value)) {
      setNotice(
        "A logo must be a local /path asset or an https URL. Nothing was saved.",
      );
      return;
    }

    update(
      {
        ...record,
        sponsors: record.sponsors.map((entry) =>
          entry.id === sponsorId
            ? { ...entry, logoUrl: value || undefined }
            : entry,
        ),
        updatedAt: new Date().toISOString(),
      },
      value
        ? "Sponsor logo saved in this preview."
        : "Sponsor logo cleared; the initials tile is shown instead.",
    );
    audit(
      value ? "Sponsor logo updated" : "Sponsor logo cleared",
      sponsor.name,
    );
  }

  const filteredParticipants = record.registrations.filter((registration) => {
    const matchesQuery =
      !participantQuery.trim() ||
      [registration.participantName, registration.handle, registration.location]
        .join(" ")
        .toLowerCase()
        .includes(participantQuery.toLowerCase());
    const matchesStatus =
      participantStatus === "all" || registration.status === participantStatus;
    return matchesQuery && matchesStatus;
  });

  const filteredSubmissions = record.submissions.filter((submission) => {
    const matchesQuery =
      !submissionQuery.trim() ||
      [submission.title, submission.creator, submission.category]
        .join(" ")
        .toLowerCase()
        .includes(submissionQuery.toLowerCase());
    const matchesStatus =
      submissionStatus === "all" || submission.status === submissionStatus;
    return matchesQuery && matchesStatus;
  });

  const audits = [...localAudit, ...previewAuditEntries];

  return (
    <div className="mx-auto w-full max-w-7xl">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href="/admin/programmes"
              className="font-medium hover:text-ink"
            >
              Programmes
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="truncate text-ink">{record.title}</li>
        </ol>
      </nav>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={programmeStatusTone(record.status)} size="xs">
              {PROGRAMME_STATUS_LABELS[record.status]}
            </Pill>
            <span className="text-[0.625rem] uppercase tracking-[0.1em] text-muted">
              {PROGRAMME_TYPE_LABELS[record.type]}
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
            {record.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
            {record.tagline}
          </p>
          <p className="mt-1 text-[0.6875rem] text-muted">
            {formatProgrammeDate(record.schedule.registrationOpensAt)} to{" "}
            {formatProgrammeDate(record.schedule.eventEndsAt)} ·{" "}
            {record.organiser}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {record.type === "monthly_ideathon" ? (
            <Link
              href="/ideathon"
              className="inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink hover:border-brand/35 focus-visible:outline-2 focus-visible:outline-brand"
            >
              Preview public page
            </Link>
          ) : null}
          <Link
            href={`/admin/programmes/new?from=${record.id}`}
            className="inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink hover:border-brand/35 focus-visible:outline-2 focus-visible:outline-brand"
          >
            Duplicate
          </Link>
          {(record.status === "judging" ||
            record.status === "results_review") &&
          !record.snapshot?.published ? (
            <Button type="button" size="sm" onClick={publishResults}>
              Publish results
            </Button>
          ) : null}
        </div>
      </header>

      <p className="mt-3 rounded-xl border border-warning/25 bg-warning/5 px-3 py-2 text-[0.6875rem] leading-4 text-warning-strong">
        Preview workspace. Edits and status changes are local to this browser
        and are not sent to the API. Sponsor and prize money never moves here.
      </p>
      {notice ? (
        <p
          className="mt-2 rounded-xl border border-brand/25 bg-brand-tint px-3 py-2 text-xs text-brand-strong"
          role="status"
        >
          {notice}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto border-b border-border">
        <div
          role="tablist"
          aria-label="Programme sections"
          className="flex min-w-max gap-1"
        >
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              aria-controls={`panel-${item.id}`}
              id={`tab-${item.id}`}
              onClick={() => setTab(item.id)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowRight" && event.key !== "ArrowLeft")
                  return;
                event.preventDefault();
                const index = TABS.findIndex((entry) => entry.id === tab);
                const nextIndex =
                  event.key === "ArrowRight"
                    ? (index + 1) % TABS.length
                    : (index - 1 + TABS.length) % TABS.length;
                const next = TABS[nextIndex];
                if (next) {
                  setTab(next.id);
                  document.getElementById(`tab-${next.id}`)?.focus();
                }
              }}
              className={`relative inline-flex min-h-11 items-center px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                tab === item.id
                  ? "font-semibold text-ink after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-brand"
                  : "font-medium text-muted hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="mt-4"
      >
        {tab === "overview" ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Kpi
                  label="Registrations"
                  value={counts.registrations}
                  detail={`${counts.eligible} eligible`}
                />
                <Kpi
                  label="Submissions"
                  value={counts.submissions}
                  detail={`${counts.underReview} under review`}
                />
                <Kpi
                  label="Prize pool"
                  value={<Amount value={pool} compact />}
                  detail="USD commitment"
                />
                <Kpi
                  label="Sponsor secured"
                  value={<Amount value={secured} compact />}
                  detail="Provider-confirmed only"
                />
              </div>
              {pool.atomic !== "0" ? (
                <NgnEstimate
                  amount={pool}
                  block
                  className="text-[0.625rem] text-muted"
                  prefix="Estimated prize pool in naira: "
                  showRate
                />
              ) : null}
              <Section
                title="Publish readiness"
                description="A programme with a failing check can still be a draft."
              >
                <ul className="grid gap-2 sm:grid-cols-2">
                  {checks.map((check) => (
                    <li
                      key={check.key}
                      className={`rounded-lg border p-2.5 ${
                        check.complete
                          ? "border-brand/20 bg-brand-tint"
                          : "border-warning/30 bg-warning/5"
                      }`}
                    >
                      <p className="text-[0.6875rem] font-semibold text-ink">
                        {check.label}
                      </p>
                      <p className="mt-0.5 text-[0.625rem] leading-4 text-muted">
                        {check.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              </Section>
              <Section
                title="Modules"
                description="Only enabled, available modules appear publicly."
              >
                <ul className="grid gap-2 sm:grid-cols-2">
                  {record.modules.map((module) => (
                    <li
                      key={module.key}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border p-2.5"
                    >
                      <span className="text-[0.6875rem] font-medium text-ink">
                        {moduleLabel(module.key)}
                      </span>
                      <Pill
                        tone={module.enabled ? "accent" : "neutral"}
                        size="xs"
                      >
                        {module.enabled
                          ? moduleAvailabilityLabel(module.availability)
                          : "Off"}
                      </Pill>
                    </li>
                  ))}
                </ul>
              </Section>
            </div>
            <aside className="space-y-3">
              {deadline ? (
                <Section title="Next deadline">
                  <p className="text-sm font-semibold text-ink">
                    {deadline.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatProgrammeDate(deadline.at, true)}
                  </p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-brand-strong">
                    {daysUntil(deadline.at)} days
                  </p>
                </Section>
              ) : null}
              <Section title="Recent audit">
                <ul className="space-y-2">
                  {audits.slice(0, 5).map((entry) => (
                    <li key={entry.id}>
                      <p className="text-[0.6875rem] font-semibold text-ink">
                        {entry.action}
                      </p>
                      <p className="text-[0.625rem] text-muted">
                        {formatProgrammeDate(entry.at, true)} · {entry.actor}
                      </p>
                    </li>
                  ))}
                </ul>
              </Section>
            </aside>
          </div>
        ) : null}

        {tab === "participants" ? (
          <Section
            title="Participants"
            description="Registration and eligibility records."
          >
            <div className="flex flex-wrap gap-2">
              <Input
                aria-label="Search participants"
                value={participantQuery}
                placeholder="Search name, handle, or location"
                onChange={(event) => setParticipantQuery(event.target.value)}
                className="max-w-xs"
              />
              <div className="w-44">
                <Select
                  aria-label="Filter participant status"
                  options={[
                    { label: "All statuses", value: "all" },
                    { label: "Eligible", value: "eligible" },
                    { label: "Pending", value: "pending" },
                    { label: "Rejected", value: "rejected" },
                    { label: "Withdrawn", value: "withdrawn" },
                  ]}
                  value={participantStatus}
                  onValueChange={(value) =>
                    setParticipantStatus(value as typeof participantStatus)
                  }
                />
              </div>
            </div>
            {filteredParticipants.length > 0 ? (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[40rem] text-left text-xs">
                  <thead className="border-b border-border text-[0.625rem] uppercase tracking-[0.08em] text-muted">
                    <tr>
                      <th className="py-2 pr-3 font-semibold">Participant</th>
                      <th className="py-2 pr-3 font-semibold">Location</th>
                      <th className="py-2 pr-3 font-semibold">Registered</th>
                      <th className="py-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredParticipants.map((registration) => (
                      <tr key={registration.id}>
                        <td className="py-2 pr-3">
                          <p className="font-semibold text-ink">
                            {registration.participantName}
                          </p>
                          <p className="text-[0.625rem] text-muted">
                            {registration.handle}
                          </p>
                          {registration.eligibilityNote ? (
                            <p className="text-[0.625rem] text-warning-strong">
                              {registration.eligibilityNote}
                            </p>
                          ) : null}
                        </td>
                        <td className="py-2 pr-3 text-muted">
                          {registration.location}
                        </td>
                        <td className="py-2 pr-3 text-muted">
                          {formatProgrammeDate(registration.registeredAt)}
                        </td>
                        <td className="py-2">
                          <Pill
                            size="xs"
                            tone={
                              registration.status === "eligible"
                                ? "accent"
                                : "neutral"
                            }
                          >
                            {registration.status}
                          </Pill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty text="No participants match this search." />
            )}
          </Section>
        ) : null}

        {tab === "submissions" ? (
          <Section
            title="Submissions"
            description="Review completeness and moderation state. Judging scores live in the next tab."
          >
            <div className="flex flex-wrap gap-2">
              <Input
                aria-label="Search submissions"
                value={submissionQuery}
                placeholder="Search title, creator, or category"
                onChange={(event) => setSubmissionQuery(event.target.value)}
                className="max-w-xs"
              />
              <div className="w-48">
                <Select
                  aria-label="Filter submission status"
                  options={[
                    { label: "All statuses", value: "all" },
                    { label: "Draft", value: "draft" },
                    { label: "Submitted", value: "submitted" },
                    { label: "Under review", value: "under_review" },
                    { label: "Shortlisted", value: "shortlisted" },
                    { label: "Accepted", value: "accepted" },
                    { label: "Disqualified", value: "disqualified" },
                  ]}
                  value={submissionStatus}
                  onValueChange={(value) =>
                    setSubmissionStatus(value as typeof submissionStatus)
                  }
                />
              </div>
            </div>
            {filteredSubmissions.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {filteredSubmissions.map((submission) => (
                  <li
                    key={submission.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">
                        {submission.title}
                      </p>
                      <p className="text-[0.6875rem] text-muted">
                        {submission.creator} · {submission.category} ·{" "}
                        {submission.supporters} supporters
                      </p>
                    </div>
                    <div className="w-40">
                      <Select
                        aria-label={`Status for ${submission.title}`}
                        options={[
                          { label: "Draft", value: "draft" },
                          { label: "Submitted", value: "submitted" },
                          { label: "Under review", value: "under_review" },
                          { label: "Shortlisted", value: "shortlisted" },
                          { label: "Accepted", value: "accepted" },
                          { label: "Disqualified", value: "disqualified" },
                        ]}
                        value={submission.status}
                        onValueChange={(value) =>
                          updateSubmission(
                            submission.id,
                            value as SubmissionStatus,
                          )
                        }
                      />
                    </div>
                    <Link
                      href={`/ideas/${submission.ideaId}`}
                      className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      Open idea
                      <HugeiconsIcon
                        icon={ArrowRight02Icon}
                        size={13}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty text="No submissions match this search." />
            )}
          </Section>
        ) : null}

        {tab === "judging" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Section
              title="Rubric"
              description="Weights must total 100 before publication."
            >
              <ul className="space-y-2">
                {record.rubric.criteria.map((criterion) => (
                  <li
                    key={criterion.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border p-2.5"
                  >
                    <div>
                      <p className="text-xs font-semibold text-ink">
                        {criterion.label}
                      </p>
                      <p className="text-[0.625rem] text-muted">
                        {criterion.guidance}
                      </p>
                    </div>
                    <span className="text-xs font-bold tabular-nums text-ink">
                      {criterion.weight}%
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[0.6875rem] text-muted">
                Total{" "}
                {record.rubric.criteria.reduce(
                  (sum, criterion) => sum + criterion.weight,
                  0,
                )}{" "}
                · Tie-break: {record.rubric.tieBreak.replace("_", " ")}
              </p>
            </Section>
            <Section
              title="Judges"
              description="A declared sponsor conflict excludes a judge from scoring and from the worklist."
            >
              {record.rubric.judges.length > 0 ? (
                <ul className="space-y-2">
                  {record.rubric.judges.map((judge) => (
                    <li
                      key={judge.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border p-2.5"
                    >
                      <div>
                        <p className="text-xs font-semibold text-ink">
                          {judge.name}
                        </p>
                        <p className="text-[0.625rem] text-muted">
                          {judge.affiliation}
                        </p>
                      </div>
                      <Pill
                        tone={
                          judge.conflict === "excluded" ? "danger" : "neutral"
                        }
                        size="xs"
                      >
                        {judge.conflict}
                      </Pill>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty text="No judges assigned yet." />
              )}
              <p className="mt-2 text-[0.6875rem] text-muted">
                Results visibility: {record.rubric.resultsVisibility}.
                Unpublished scores are never shown publicly.
              </p>
            </Section>
          </div>
        ) : null}

        {tab === "leaderboard" ? (
          <Section
            title="Leaderboard"
            description="Judge totals and community support are separate columns. Community support only breaks a tie when the rubric says so."
            action={
              record.snapshot?.published ? (
                <Pill tone="accent" size="xs">
                  Frozen · public
                </Pill>
              ) : (
                <Pill tone="warning" size="xs">
                  Not published
                </Pill>
              )
            }
          >
            {leaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[38rem] text-left text-xs">
                  <thead className="border-b border-border text-[0.625rem] uppercase tracking-[0.08em] text-muted">
                    <tr>
                      <th className="py-2 pr-3 font-semibold">Rank</th>
                      <th className="py-2 pr-3 font-semibold">Submission</th>
                      <th className="py-2 pr-3 text-right font-semibold">
                        Judge score
                      </th>
                      <th className="py-2 text-right font-semibold">
                        Community
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {leaderboard.map((entry) => {
                      const submission = submissionFor(
                        record,
                        entry.submissionId,
                      );
                      return (
                        <tr key={entry.submissionId}>
                          <td className="py-2 pr-3 font-bold tabular-nums text-ink">
                            {entry.rank}
                          </td>
                          <td className="py-2 pr-3">
                            <p className="font-semibold text-ink">
                              {submission?.title ?? entry.submissionId}
                            </p>
                            <p className="text-[0.625rem] text-muted">
                              {submission?.creator}
                            </p>
                          </td>
                          <td className="py-2 pr-3 text-right tabular-nums text-ink">
                            {entry.judgeScore.toFixed(2)}
                          </td>
                          <td className="py-2 text-right tabular-nums text-muted">
                            {entry.communityScore}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty text="No submitted entries to rank yet." />
            )}
            {record.snapshot?.published ? (
              <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-[0.6875rem] text-muted">
                Frozen {formatProgrammeDate(record.snapshot.capturedAt, true)} ·
                checksum {record.snapshot.checksum}
              </p>
            ) : null}
          </Section>
        ) : null}

        {tab === "rewards" ? (
          <Section
            title="Rewards and fulfilment"
            description="Advance only through allowed states. Delivery needs a reference."
          >
            {record.rewards.length > 0 ? (
              <ul className="space-y-2">
                {record.rewards.map((reward) => (
                  <li
                    key={reward.id}
                    className="rounded-xl border border-border p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {reward.placement}. {reward.title}
                        </p>
                        <p className="text-[0.6875rem] text-muted">
                          {reward.kind.replace("_", " ")} ·{" "}
                          {reward.fulfilmentOwner}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold tabular-nums text-ink">
                          {reward.amount ? (
                            <Amount value={reward.amount} compact />
                          ) : (
                            "Non-cash"
                          )}
                        </p>
                        {reward.amount ? (
                          <NgnEstimate
                            amount={reward.amount}
                            block
                            className="text-[0.625rem] text-muted"
                          />
                        ) : null}
                        <p className="text-[0.625rem] text-muted">
                          {reward.fundingStatus}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Pill
                        size="xs"
                        tone={
                          reward.fulfilmentStatus === "delivered"
                            ? "accent"
                            : "neutral"
                        }
                      >
                        {reward.fulfilmentStatus}
                      </Pill>
                      <div className="w-44">
                        <Select
                          aria-label={`Fulfilment status for ${reward.title}`}
                          options={[
                            { label: "Committed", value: "committed" },
                            { label: "Funded", value: "funded" },
                            {
                              label: "Eligibility pending",
                              value: "eligibility_pending",
                            },
                            { label: "Approved", value: "approved" },
                            { label: "Processing", value: "processing" },
                            { label: "Delivered", value: "delivered" },
                            { label: "Failed", value: "failed" },
                          ]}
                          value={reward.fulfilmentStatus}
                          onValueChange={(value) =>
                            updateReward(
                              reward.id,
                              value as RewardFulfilmentStatus,
                            )
                          }
                        />
                      </div>
                      <Input
                        aria-label={`Delivery reference for ${reward.title}`}
                        value={evidence[reward.id] ?? ""}
                        placeholder="Delivery reference"
                        onChange={(event) =>
                          setEvidence((current) => ({
                            ...current,
                            [reward.id]: event.target.value,
                          }))
                        }
                        className="max-w-xs"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty text="This programme has no rewards." />
            )}
          </Section>
        ) : null}

        {tab === "sponsors" ? (
          <Section
            title="Sponsors"
            description="Invoices become paid only with a reference and a verified confirmation."
          >
            {record.sponsors.length > 0 ? (
              <div className="mb-4 rounded-xl border border-border bg-canvas p-3">
                <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  Public logo wall preview
                </p>
                <div className="mt-2">
                  <SponsorLogoWall sponsors={record.sponsors} />
                </div>
              </div>
            ) : null}
            {record.sponsors.length > 0 ? (
              <ul className="space-y-3">
                {sortSponsorsForDisplay(record.sponsors).map((sponsor) => (
                  <li
                    key={sponsor.id}
                    className="rounded-xl border border-border p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <SponsorLogo sponsor={sponsor} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-ink">
                            {sponsor.name}
                          </p>
                          <p className="text-[0.6875rem] text-muted">
                            {sponsor.tier} · {sponsor.deliverables.join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-ink">
                          <Amount value={sponsor.commitment} compact />
                        </p>
                        <Pill
                          size="xs"
                          tone={
                            sponsor.invoiceStatus === "paid"
                              ? "accent"
                              : sponsor.invoiceStatus === "overdue"
                                ? "danger"
                                : "warning"
                          }
                        >
                          {sponsor.invoiceStatus}
                        </Pill>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-end gap-2">
                      <Input
                        aria-label={`Logo URL for ${sponsor.name}`}
                        value={logoDrafts[sponsor.id] ?? sponsor.logoUrl ?? ""}
                        placeholder="https://… or /images/…"
                        onChange={(event) =>
                          setLogoDrafts((current) => ({
                            ...current,
                            [sponsor.id]: event.target.value,
                          }))
                        }
                        className="max-w-xs"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => saveSponsorLogo(sponsor.id)}
                      >
                        Save logo
                      </Button>
                      <span className="text-[0.625rem] text-muted">
                        {isSafeLogoUrl(sponsor.logoUrl)
                          ? "Shown on the public wall"
                          : "Initials tile shown"}
                      </span>
                    </div>
                    {sponsor.invoiceStatus !== "paid" &&
                    sponsor.invoiceStatus !== "cancelled" ? (
                      <div className="mt-2 flex flex-wrap items-end gap-2">
                        <Input
                          aria-label={`Payment reference for ${sponsor.name}`}
                          value={invoiceRefs[sponsor.id] ?? ""}
                          placeholder="Transfer reference"
                          onChange={(event) =>
                            setInvoiceRefs((current) => ({
                              ...current,
                              [sponsor.id]: event.target.value,
                            }))
                          }
                          className="max-w-xs"
                        />
                        <label className="flex min-h-11 items-center gap-2 text-[0.6875rem] text-muted">
                          <input
                            type="checkbox"
                            checked={invoiceConfirmed[sponsor.id] ?? false}
                            onChange={(event) =>
                              setInvoiceConfirmed((current) => ({
                                ...current,
                                [sponsor.id]: event.target.checked,
                              }))
                            }
                            className="size-4 accent-brand"
                          />
                          Transfer verified
                        </label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => confirmInvoice(sponsor.id)}
                        >
                          Record payment
                        </Button>
                      </div>
                    ) : sponsor.invoiceStatus === "paid" ? (
                      <p className="mt-2 text-[0.6875rem] text-brand-strong">
                        {sponsor.confirmedByProvider
                          ? "Provider-confirmed"
                          : "Paid marker without provider confirmation"}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty text="No sponsors attached to this programme." />
            )}
          </Section>
        ) : null}

        {tab === "branding" ? (
          <Section
            title="Branding and public copy"
            description="Saved locally. The public ideathon reads preview content today."
          >
            <div className="space-y-3">
              <label className="block text-xs font-medium text-ink">
                Hero copy
                <Input
                  value={brandingDraft.heroCopy}
                  onChange={(event) =>
                    setBrandingDraft((current) => ({
                      ...current,
                      heroCopy: event.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </label>
              <label className="block text-xs font-medium text-ink">
                Description
                <Textarea
                  rows={3}
                  value={brandingDraft.description}
                  onChange={(event) =>
                    setBrandingDraft((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </label>
              <Button type="button" size="md" onClick={saveBranding}>
                Save copy
              </Button>
              <div className="rounded-xl border border-border p-3">
                <p className="text-xs font-semibold text-ink">
                  Partner and sponsor logos
                </p>
                <p className="mt-0.5 text-[0.625rem] leading-5 text-muted">
                  Logos are edited per sponsor in the Sponsors tab. Partners
                  without a supplied mark fall back to initials on the public
                  page.
                </p>
                <div className="mt-2">
                  <SponsorLogoWall
                    sponsors={record.sponsors}
                    emptyLabel="No sponsors yet, so the public wall is hidden."
                  />
                </div>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-xs font-semibold text-ink">Banner</p>
                {record.assets.find((asset) => asset.kind === "banner")?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      record.assets.find((asset) => asset.kind === "banner")
                        ?.url
                    }
                    alt="Programme banner"
                    className="mt-2 aspect-[3/1] w-full rounded-lg object-cover"
                  />
                ) : (
                  <p className="mt-1 text-xs text-muted">
                    No banner asset. The public page uses a branded fallback.
                  </p>
                )}
              </div>
            </div>
          </Section>
        ) : null}

        {tab === "schedule" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Timeline">
              <ul className="space-y-2 text-xs">
                {(
                  [
                    ["Registration opens", record.schedule.registrationOpensAt],
                    [
                      "Registration closes",
                      record.schedule.registrationClosesAt,
                    ],
                    ["Submissions open", record.schedule.submissionOpensAt],
                    ["Submissions close", record.schedule.submissionClosesAt],
                    ["Judging starts", record.schedule.judgingStartsAt],
                    ["Judging ends", record.schedule.judgingEndsAt],
                    ["Results", record.schedule.resultsAt],
                    ["Event", record.schedule.eventStartsAt],
                  ] as const
                ).map(([label, at]) => (
                  <li
                    key={label}
                    className="flex items-center justify-between gap-3 border-b border-border pb-2"
                  >
                    <span className="text-muted">{label}</span>
                    <span className="font-medium text-ink">
                      {formatProgrammeDate(at, true)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[0.625rem] text-muted">
                Times stored in UTC, shown in {record.schedule.timezone}.
              </p>
            </Section>
            <Section title="Sessions and experts">
              {record.workshops.length === 0 && record.experts.length === 0 ? (
                <Empty text="No workshops or experts configured." />
              ) : (
                <ul className="space-y-2">
                  {record.workshops.map((workshop) => (
                    <li
                      key={workshop.id}
                      className="rounded-lg border border-border p-2.5"
                    >
                      <p className="text-xs font-semibold text-ink">
                        {workshop.title}
                      </p>
                      <p className="text-[0.625rem] text-muted">
                        {formatProgrammeDate(workshop.startsAt, true)} ·{" "}
                        {workshop.facilitator} · {workshop.seatsTaken}/
                        {workshop.capacity} seats
                      </p>
                    </li>
                  ))}
                  {record.experts.map((expert) => (
                    <li
                      key={expert.id}
                      className="rounded-lg border border-border p-2.5"
                    >
                      <p className="text-xs font-semibold text-ink">
                        {expert.name}
                      </p>
                      <p className="text-[0.625rem] text-muted">
                        {expert.expertise.join(", ")} · {expert.availability}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
        ) : null}

        {tab === "ai" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Section
              title="AI analysis allowance"
              description="Advanced synthesis is gated by plan. Basic analytics stay available to every creator."
            >
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold text-ink">
                  {previewAiUsage.used} of {previewAiUsage.allowance} analyses
                  used
                </p>
                <Pill tone="promoted" size="xs">
                  Pro
                </Pill>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/[0.06]">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{
                    width: `${Math.round((previewAiUsage.used / Math.max(1, previewAiUsage.allowance)) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-[0.6875rem] text-muted">
                Resets {formatProgrammeDate(previewAiUsage.resetsAt)}. Usage is
                preview data; the API must enforce the entitlement server-side.
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-contrast px-4 text-xs font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-brand"
              >
                Ask about Pro access
              </Link>
            </Section>
            <Section
              title="Analysis jobs"
              description="No AI provider is connected, so no analysis is generated or claimed."
            >
              <Empty text="No analysis jobs yet. When the provider and entitlement service are connected, job status, failures, and usage will appear here." />
            </Section>
          </div>
        ) : null}

        {tab === "settings" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Section
              title="Lifecycle"
              description="Server-side authorization decides whether a transition is allowed. This preview mirrors the rules."
            >
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "scheduled",
                    "registration_open",
                    "submission_open",
                    "judging",
                    "results_review",
                    "completed",
                    "archived",
                  ] as ProgrammeStatus[]
                ).map((status) => (
                  <Button
                    key={status}
                    type="button"
                    size="sm"
                    variant={status === record.status ? "secondary" : "outline"}
                    disabled={!canTransitionProgramme(record.status, status)}
                    onClick={() => changeStatus(status)}
                  >
                    {PROGRAMME_STATUS_LABELS[status]}
                  </Button>
                ))}
              </div>
              <p className="mt-2 text-[0.6875rem] text-muted">
                Current: {PROGRAMME_STATUS_LABELS[record.status]}. Archived
                programmes keep their frozen snapshot.
              </p>
            </Section>
            <Section
              title="Permissions"
              description="Mirrored from the product role model. The API must enforce each permission."
            >
              <ul className="space-y-1.5 text-[0.6875rem]">
                {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => (
                  <li
                    key={role}
                    className="rounded-lg border border-border p-2.5"
                  >
                    <p className="font-semibold capitalize text-ink">
                      {role.replace("_", " ")}
                    </p>
                    <p className="mt-0.5 text-muted">
                      {permissions.join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 flex items-center gap-1.5 text-[0.6875rem] text-muted">
                <HugeiconsIcon
                  icon={Shield01Icon}
                  size={13}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
                Preview access is{" "}
                {roleCan("platform_admin", "settings:manage")
                  ? "capable"
                  : "restricted"}
                .
              </p>
            </Section>
            <div className="lg:col-span-2">
              <Section
                title="Audit history"
                description="Sensitive changes require actor, timestamp, action, and before/after state."
              >
                <ul className="space-y-2">
                  {audits.map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded-lg border border-border p-2.5"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-xs font-semibold text-ink">
                          {entry.action}
                        </p>
                        <p className="text-[0.625rem] tabular-nums text-muted">
                          {formatProgrammeDate(entry.at, true)}
                        </p>
                      </div>
                      <p className="mt-0.5 text-[0.625rem] text-muted">
                        {entry.actor} ({entry.actorRole.replace("_", " ")}) ·{" "}
                        {entry.target}
                        {entry.before || entry.after
                          ? ` · ${entry.before ?? "—"} → ${entry.after ?? "—"}`
                          : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </Section>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
