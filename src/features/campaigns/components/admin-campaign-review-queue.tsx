"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  CheckListIcon,
  Clock01Icon,
  Note01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import { Amount } from "@/components/ui/amount";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Pill } from "@/components/ui/pill";
import { PhasePill } from "@/features/campaigns/components/campaign-status-pill";
import {
  applyCampaignReviewOverride,
  campaignReviewStatusLabels,
  campaignReviewStatusTones,
} from "@/features/campaigns/lib/admin-review";
import {
  getCampaignReviewStoreSnapshot,
  getServerCampaignReviewStoreSnapshot,
  subscribeCampaignReviewStore,
} from "@/features/campaigns/lib/admin-review-store";
import { formatShortDate } from "@/features/campaigns/lib/dates";
import { campaignCategoryText } from "@/features/campaigns/lib/filters";
import type { Campaign } from "@/features/campaigns/types";

/**
 * The campaign review queue.
 *
 * It is grouped by the review union rather than by the campaign phase, because
 * the two answer different questions: review says whether Inverge has decided,
 * and the phase says what the listing is doing. A campaign in
 * `changes-requested` is waiting on its creator, not on an admin, and saying so
 * here is what keeps the queue a worklist instead of a list of everything.
 *
 * Campaign records come from the fixtures; decisions come from this browser. The
 * two sources are labelled separately so a locally decided row is never mistaken
 * for a server state.
 */
export function AdminCampaignReviewQueue({
  initialCampaigns,
}: {
  initialCampaigns: readonly Campaign[];
}) {
  const store = useSyncExternalStore(
    subscribeCampaignReviewStore,
    getCampaignReviewStoreSnapshot,
    getServerCampaignReviewStoreSnapshot,
  );
  const campaigns = useMemo(
    () =>
      initialCampaigns.map((campaign) =>
        applyCampaignReviewOverride(campaign, store.overrides[campaign.id]),
      ),
    [initialCampaigns, store.overrides],
  );

  const awaiting = campaigns
    .filter((campaign) => campaign.review.status === "in-review")
    .toSorted((left, right) =>
      reviewedAt(left).localeCompare(reviewedAt(right)),
    );
  const changes = campaigns
    .filter((campaign) => campaign.review.status === "changes-requested")
    .toSorted((left, right) =>
      reviewedAt(right).localeCompare(reviewedAt(left)),
    );
  const decided = campaigns
    .filter(
      (campaign) =>
        campaign.review.status === "approved" ||
        campaign.review.status === "rejected",
    )
    .toSorted((left, right) =>
      reviewedAt(right).localeCompare(reviewedAt(left)),
    );

  const submittedCount = awaiting.length + changes.length + decided.length;

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header>
        <Eyebrow>Admin · Campaigns</Eyebrow>
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
          Campaign review queue
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted">
          Submitted campaigns, grouped by review state. A campaign in
          &ldquo;changes requested&rdquo; is waiting on its creator, not on a
          reviewer. Only a campaign awaiting review can receive a decision.
        </p>
      </header>

      <section
        aria-label="Preview boundary"
        className="mt-4 rounded-2xl border border-warning/30 bg-warning/[0.07] px-4 py-3.5"
      >
        <p className="text-sm font-semibold text-ink">
          Decisions recorded here stay in this browser
        </p>
        <p className="mt-1 text-sm leading-6 text-muted">
          The API exposes the authoritative review endpoint (POST
          /admin/campaigns/:id/review), but this preview is not connected to it,
          so a decision here is a named preview record, not a production state
          change. KYC status and the application fee — FR-103 and FR-311 — are
          enforced by the API and are not confirmed anywhere in this queue.
        </p>
      </section>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <QueueMetric
          icon={Clock01Icon}
          label="Awaiting review"
          value={awaiting.length}
          hint="Can receive a decision now."
        />
        <QueueMetric
          icon={Alert02Icon}
          label="Changes requested"
          value={changes.length}
          hint="Waiting on the creator."
        />
        <QueueMetric
          icon={CheckListIcon}
          label="Decided"
          value={decided.length}
          hint="Approved or rejected in the fixture set."
        />
      </dl>

      {submittedCount === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-border-strong px-4 py-10 text-center text-sm text-muted">
          No campaign has been submitted for review in this preview.
        </p>
      ) : null}

      <div className="mt-5 space-y-5">
        <QueueSection
          description="Oldest submission first, so nothing waits indefinitely."
          id="awaiting-review"
          title="Awaiting review"
        >
          {awaiting.length === 0 ? (
            <EmptyRow>Nothing is waiting for a review decision.</EmptyRow>
          ) : (
            <ul className="divide-y divide-border">
              {awaiting.map((campaign) => (
                <QueueRow campaign={campaign} key={campaign.id} />
              ))}
            </ul>
          )}
        </QueueSection>

        <QueueSection
          description="Sent back to the creator with a reason. No admin action until they resubmit."
          id="changes-requested"
          title="Changes requested"
        >
          {changes.length === 0 ? (
            <EmptyRow>No campaign is waiting on its creator.</EmptyRow>
          ) : (
            <ul className="divide-y divide-border">
              {changes.map((campaign) => (
                <QueueRow campaign={campaign} key={campaign.id} />
              ))}
            </ul>
          )}
        </QueueSection>

        <QueueSection
          description="Decisions already recorded for this fixture set. A decision is not reversed here."
          id="decided"
          title="Decided"
        >
          {decided.length === 0 ? (
            <EmptyRow>No campaign has an approval or rejection yet.</EmptyRow>
          ) : (
            <ul className="divide-y divide-border">
              {decided.map((campaign) => (
                <QueueRow campaign={campaign} key={campaign.id} />
              ))}
            </ul>
          )}
        </QueueSection>
      </div>

      <p className="mt-5 border-t border-border pt-3 text-[0.6875rem] leading-5 text-muted">
        Drafts and unsubmitted campaigns are not shown. A campaign appears here
        once its creator has submitted it for review.
      </p>
    </div>
  );
}

function reviewedAt(campaign: Campaign): string {
  const review = campaign.review;
  switch (review.status) {
    case "in-review":
      return review.submittedAt;
    case "changes-requested":
      return review.requestedAt;
    case "rejected":
      return review.decidedAt;
    case "approved":
      return review.approvedAt;
    case "not-submitted":
      return campaign.publishedAt ?? "";
  }
}

function QueueMetric({
  icon,
  label,
  value,
  hint,
}: {
  icon: typeof Clock01Icon;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <dt className="text-xs font-medium text-muted">{label}</dt>
        <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand-strong">
          <HugeiconsIcon
            icon={icon}
            size={16}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
      </div>
      <dd className="mt-2 text-2xl font-bold tabular-nums tracking-[-0.035em] text-ink">
        {value}
      </dd>
      <p className="mt-1 text-xs leading-5 text-muted">{hint}</p>
    </div>
  );
}

function QueueSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={`queue-${id}`}
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex items-start gap-2">
        <HugeiconsIcon
          icon={Note01Icon}
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
          className="mt-0.5 text-brand-strong"
        />
        <div>
          <h2
            id={`queue-${id}`}
            className="text-base font-bold tracking-[-0.02em] text-ink"
          >
            {title}
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-muted">{description}</p>
        </div>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border-strong px-4 py-6 text-center text-sm text-muted">
      {children}
    </p>
  );
}

function QueueRow({ campaign }: { campaign: Campaign }) {
  const review = campaign.review;
  const actionable = review.status === "in-review";
  const reason =
    review.status === "changes-requested"
      ? review.summary
      : review.status === "rejected"
        ? review.reason
        : null;

  return (
    <li className="py-3.5">
      <Link
        href={`/admin/campaigns/${campaign.id}`}
        className="group flex flex-wrap items-start justify-between gap-3 rounded-xl transition-colors hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-ink group-hover:text-brand-strong">
              {campaign.title}
            </p>
            <Pill size="xs" tone={campaignReviewStatusTones[review.status]}>
              {campaignReviewStatusLabels[review.status]}
            </Pill>
            <PhasePill phase={campaign.phase} size="xs" />
          </div>
          <p className="mt-1 text-xs text-muted">
            {campaign.creator.name} · {campaignCategoryText(campaign)} ·{" "}
            {campaign.location}
          </p>
          {reason ? (
            <p className="mt-1.5 line-clamp-2 max-w-2xl text-xs leading-5 text-muted">
              <span className="font-semibold text-ink">Reviewer note: </span>
              {reason}
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold tabular-nums text-ink">
            <Amount value={campaign.funding.target} compact />
          </p>
          <p className="text-[0.625rem] text-muted">
            {campaign.milestones.length} milestones ·{" "}
            {formatShortDate(reviewedAt(campaign))}
          </p>
          <p className="mt-1 text-[0.625rem] font-semibold text-brand-strong">
            {actionable ? "Review campaign" : "View decision"}
          </p>
        </div>
      </Link>
    </li>
  );
}
