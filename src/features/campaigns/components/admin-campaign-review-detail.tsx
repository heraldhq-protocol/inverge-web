"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowLeft02Icon,
  CheckListIcon,
  Clock01Icon,
  Note01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useSyncExternalStore, useState, type FormEvent } from "react";

import { Amount } from "@/components/ui/amount";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Pill } from "@/components/ui/pill";
import { Textarea } from "@/components/ui/textarea";
import { adminCan, type AdminActor } from "@/features/admin/permissions";
import { PhasePill } from "@/features/campaigns/components/campaign-status-pill";
import {
  applyCampaignReviewOverride,
  CAMPAIGN_REVIEW_ACTIONS,
  CAMPAIGN_REVIEW_MIN_REASON,
  campaignReviewActionDescriptions,
  campaignReviewActionLabels,
  campaignReviewNextStatuses,
  campaignReviewPastLabels,
  campaignReviewStatusLabels,
  campaignReviewStatusTones,
  type CampaignReviewAction,
} from "@/features/campaigns/lib/admin-review";
import {
  getCampaignReviewStoreSnapshot,
  getServerCampaignReviewStoreSnapshot,
  recordCampaignReview,
  subscribeCampaignReviewStore,
} from "@/features/campaigns/lib/admin-review-store";
import { bpsOf, formatBps, sumAmounts } from "@/features/campaigns/lib/amounts";
import {
  formatDateOrNull,
  formatShortDate,
} from "@/features/campaigns/lib/dates";
import { campaignCategoryText } from "@/features/campaigns/lib/filters";
import { campaignPhaseDescriptions } from "@/features/campaigns/lib/status";
import type { Campaign } from "@/features/campaigns/types";

/**
 * One campaign's review.
 *
 * The reviewer sees the pitch, the milestone plan with each evidence definition,
 * and the disclosures, because those are what the decision is actually about.
 * The decision form turns on two independent gates: `campaign:review` and the
 * campaign being `in-review`. The domain rule is re-run by `recordCampaignReview`,
 * so a stale render or a disabled control cannot bypass either gate.
 *
 * Nothing here claims an effect it does not have: approval records a preview
 * state only, and it neither verifies identity (FR-103) nor confirms the
 * application fee (FR-311).
 */
export function AdminCampaignReviewDetail({
  actor,
  initialCampaign,
}: {
  actor: AdminActor;
  initialCampaign: Campaign;
}) {
  const store = useSyncExternalStore(
    subscribeCampaignReviewStore,
    getCampaignReviewStoreSnapshot,
    getServerCampaignReviewStoreSnapshot,
  );
  const campaign = applyCampaignReviewOverride(
    initialCampaign,
    store.overrides[initialCampaign.id],
  );
  const events = store.events.filter(
    (event) => event.campaignId === campaign.id,
  );

  const [action, setAction] = useState<CampaignReviewAction | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canReview = adminCan(actor.role, "campaign:review");
  const actionable = canReview && campaign.review.status === "in-review";
  const useOfFundsTotal = sumAmounts(
    campaign.story.useOfFunds.map((line) => line.amount),
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!action) return;

    const result = recordCampaignReview(campaign, { action, actor, reason });
    if (!result.ok) {
      setError(result.message);
      return;
    }

    setAction(null);
    setReason("");
    setError(null);
    setNotice(
      `${campaignReviewPastLabels[result.decision.event.action]} recorded in this browser. It has not been sent to the API.`,
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Link
        href="/admin/campaigns"
        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <HugeiconsIcon
          icon={ArrowLeft02Icon}
          size={14}
          strokeWidth={1.9}
          aria-hidden="true"
        />
        Review queue
      </Link>

      <header className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>Campaign review</Eyebrow>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
            {campaign.title}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
            {campaign.summary}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Pill
              size="sm"
              tone={campaignReviewStatusTones[campaign.review.status]}
            >
              {campaignReviewStatusLabels[campaign.review.status]}
            </Pill>
            <PhasePill phase={campaign.phase} size="sm" />
            <Pill size="sm" tone="neutral">
              {campaignCategoryText(campaign)}
            </Pill>
          </div>
        </div>
        <p className="max-w-xs rounded-xl border border-border bg-surface px-3.5 py-3 text-xs leading-5 text-muted">
          {campaignPhaseDescriptions[campaign.phase]}
        </p>
      </header>

      {notice ? (
        <p
          role="status"
          className="mt-4 rounded-xl border border-brand/30 bg-brand-tint px-4 py-3 text-sm font-medium text-ink"
        >
          {notice}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="text-base font-bold tracking-[-0.02em] text-ink">
              Listing facts
            </h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <Fact label="Creator" value={campaign.creator.name} />
              <Fact label="Location" value={campaign.location} />
              <Fact
                label="Target"
                value={<Amount value={campaign.funding.target} compact />}
              />
              <Fact
                label="Funding closes"
                value={formatDateOrNull(campaign.funding.closesAt)}
              />
              <Fact label="Funding model" value="All-or-Nothing" />
              <Fact
                label="Submitted"
                value={
                  campaign.review.status === "in-review"
                    ? formatShortDate(campaign.review.submittedAt)
                    : "Not awaiting review"
                }
              />
            </dl>
            <p className="mt-3 rounded-xl bg-canvas px-3 py-2 text-xs leading-5 text-muted">
              Creator identity flag in this fixture:{" "}
              <span className="font-semibold text-ink">
                {campaign.creator.identityVerified
                  ? "marked verified"
                  : "not marked"}
              </span>
              . This is a fixture value, not a KYC provider result. FR-103 must
              be confirmed by the API before this queue is authoritative.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="text-base font-bold tracking-[-0.02em] text-ink">
              The pitch
            </h2>
            <div className="mt-3 space-y-3">
              <Prose label="Problem" body={campaign.story.problem} />
              <Prose label="Solution" body={campaign.story.solution} />
              <Prose
                label="Beneficiaries"
                body={campaign.story.beneficiaries}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-bold tracking-[-0.02em] text-ink">
                Use of funds
              </h2>
              <p className="text-xs text-muted">
                Totals{" "}
                <span className="font-semibold tabular-nums text-ink">
                  <Amount value={useOfFundsTotal} compact />
                </span>{" "}
                against a{" "}
                <span className="font-semibold tabular-nums text-ink">
                  <Amount value={campaign.funding.target} compact />
                </span>{" "}
                target
              </p>
            </div>
            <ul className="mt-3 divide-y divide-border">
              {campaign.story.useOfFunds.map((line) => (
                <li
                  key={line.label}
                  className="flex items-baseline justify-between gap-3 py-2.5"
                >
                  <span className="text-sm text-ink">{line.label}</span>
                  <span className="text-sm font-semibold tabular-nums text-ink">
                    <Amount value={line.amount} compact />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={Clock01Icon}
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
                className="text-brand-strong"
              />
              <h2 className="text-base font-bold tracking-[-0.02em] text-ink">
                Milestone plan
              </h2>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted">
              Tranches are reviewed as published. This decision does not alter
              an allocation, and it never releases a tranche. Funds already
              released under a milestone are not clawed back.
            </p>
            <ol className="mt-3 space-y-3">
              {campaign.milestones.map((milestone) => (
                <li
                  key={milestone.id}
                  className="rounded-xl border border-border bg-canvas p-3.5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">
                      Milestone {milestone.sequence} · {milestone.title}
                    </p>
                    <p className="text-xs font-semibold tabular-nums text-ink">
                      {formatBps(milestone.allocationBps)} ·{" "}
                      <Amount
                        value={bpsOf(
                          campaign.funding.target,
                          milestone.allocationBps,
                        )}
                        compact
                      />
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink">
                    {milestone.deliverable}
                  </p>
                  <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-muted">
                        Evidence required
                      </dt>
                      <dd className="mt-0.5 text-xs leading-5 text-muted">
                        {milestone.evidence}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-muted">
                        Expected
                      </dt>
                      <dd className="mt-0.5 text-xs leading-5 text-muted">
                        {formatDateOrNull(milestone.expectedAt)}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="text-base font-bold tracking-[-0.02em] text-ink">
              Disclosures
            </h2>
            <div className="mt-3 space-y-3">
              <Prose
                label="Who can contribute"
                body={campaign.disclosures.eligibility}
              />
              <Prose label="Risks" body={campaign.disclosures.risks} />
              <Prose
                label="If the target is not reached"
                body={campaign.disclosures.failurePlan}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={Note01Icon}
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
                className="text-brand-strong"
              />
              <h2 className="text-base font-bold tracking-[-0.02em] text-ink">
                Review history
              </h2>
            </div>
            <div className="mt-3 rounded-xl border border-border bg-canvas px-3.5 py-3">
              <p className="text-xs font-semibold text-ink">
                {campaignReviewStatusLabels[campaign.review.status]}
              </p>
              <p className="mt-0.5 text-xs leading-5 text-muted">
                {reviewHistoryText(campaign)}
              </p>
            </div>

            {events.length === 0 ? (
              <p className="mt-3 text-xs leading-5 text-muted">
                No decision has been recorded in this browser for this campaign.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {events.map((event) => (
                  <li
                    key={event.id}
                    className="rounded-xl border border-border px-3.5 py-2.5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-xs font-semibold text-ink">
                        {campaignReviewPastLabels[event.action]}
                      </p>
                      <time
                        className="text-[0.625rem] tabular-nums text-muted"
                        dateTime={event.at}
                      >
                        {formatShortDate(event.at)}
                      </time>
                    </div>
                    <p className="mt-0.5 text-[0.625rem] text-muted">
                      {event.actor.name} · {event.actor.role.replace("_", " ")}{" "}
                      · {campaignReviewStatusLabels[event.from]} →{" "}
                      {campaignReviewStatusLabels[event.to]}
                    </p>
                    {event.reason ? (
                      <p className="mt-1 text-xs leading-5 text-muted">
                        {event.reason}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 border-t border-border pt-2 text-[0.625rem] leading-4 text-muted">
              Local records are not an audit trail. The API appends the
              authoritative entry at POST /admin/campaigns/:id/review, but this
              preview is not connected to it yet.
            </p>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={CheckListIcon}
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
                className="text-brand-strong"
              />
              <h2 className="text-base font-bold tracking-[-0.02em] text-ink">
                Decision
              </h2>
            </div>

            {!canReview ? (
              <p className="mt-3 rounded-xl border border-warning/30 bg-warning/[0.07] px-3.5 py-3 text-xs leading-5 text-muted">
                Your role,{" "}
                <span className="font-semibold text-ink">
                  {actor.role.replace("_", " ")}
                </span>
                , does not include <code>campaign:review</code>. The API would
                refuse this action regardless of what this page renders.
              </p>
            ) : campaign.review.status !== "in-review" ? (
              <p className="mt-3 rounded-xl border border-border bg-canvas px-3.5 py-3 text-xs leading-5 text-muted">
                This campaign is{" "}
                <span className="font-semibold text-ink">
                  {campaignReviewStatusLabels[
                    campaign.review.status
                  ].toLowerCase()}
                </span>
                , so no further decision can be recorded. A decided campaign is
                not re-decided from this screen.
              </p>
            ) : (
              <form className="mt-3 space-y-3" onSubmit={onSubmit}>
                <fieldset className="space-y-2">
                  <legend className="sr-only">Review decision</legend>
                  {CAMPAIGN_REVIEW_ACTIONS.map((candidate) => (
                    <label
                      key={candidate}
                      className={`flex cursor-pointer gap-2.5 rounded-xl border p-3 transition-colors ${
                        action === candidate
                          ? "border-brand bg-brand-tint"
                          : "border-border hover:border-brand/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="campaign-review-action"
                        value={candidate}
                        checked={action === candidate}
                        onChange={() => {
                          setAction(candidate);
                          setError(null);
                        }}
                        className="mt-0.5 size-4 accent-brand"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-ink">
                          {campaignReviewActionLabels[candidate]}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-muted">
                          {campaignReviewActionDescriptions[candidate]}
                        </span>
                        <span className="mt-1 block text-[0.625rem] font-semibold text-brand-strong">
                          Sets review to{" "}
                          {campaignReviewStatusLabels[
                            campaignReviewNextStatuses[candidate]
                          ].toLowerCase()}
                        </span>
                      </span>
                    </label>
                  ))}
                </fieldset>

                <div>
                  <label
                    htmlFor="campaign-review-reason"
                    className="text-sm font-medium text-ink"
                  >
                    Reason for the creator
                  </label>
                  <p className="mt-0.5 text-xs leading-5 text-muted">
                    Required for a change request or a rejection, and recorded
                    verbatim in the decision and the local history.
                  </p>
                  <Textarea
                    id="campaign-review-reason"
                    name="campaign-review-reason"
                    className="mt-1.5"
                    rows={4}
                    value={reason}
                    onChange={(event) => {
                      setReason(event.target.value);
                      setError(null);
                    }}
                  />
                  <p className="mt-1 text-[0.6875rem] text-muted">
                    {reason.trim().length}/{CAMPAIGN_REVIEW_MIN_REASON}{" "}
                    characters minimum for a change request or rejection
                  </p>
                </div>

                {error ? (
                  <p className="rounded-xl border border-danger/30 bg-danger/[0.07] px-3 py-2 text-xs font-medium text-danger">
                    {error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!actionable || !action}
                >
                  {action
                    ? campaignReviewActionLabels[action]
                    : "Choose a decision"}
                </Button>
                <p className="text-[0.625rem] leading-4 text-muted">
                  This records a preview decision in this browser. It does not
                  publish the campaign, move money, or confirm identity.
                </p>
              </form>
            )}
          </section>

          <section className="rounded-2xl border border-warning/30 bg-warning/[0.07] p-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={Alert02Icon}
                size={15}
                strokeWidth={1.8}
                aria-hidden="true"
                className="text-warning-strong"
              />
              <h2 className="text-sm font-bold text-ink">
                Preconditions not verified here
              </h2>
            </div>
            <ul className="mt-2 space-y-1.5">
              {[
                "Identity verification (FR-103)",
                "Application fee confirmed (FR-311)",
                "Escrow funded and indexed",
                "Publication to the live discovery reader",
              ].map((label) => (
                <li
                  key={label}
                  className="flex items-center justify-between gap-2 text-xs text-muted"
                >
                  <span>{label}</span>
                  <Pill size="xs" tone="warning">
                    Missing
                  </Pill>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[0.625rem] leading-4 text-muted">
              Approval changes the local preview state to funding. It does not
              make the campaign public, because the discovery reader still reads
              the server fixtures.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-brand-tint p-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={Shield01Icon}
                size={15}
                strokeWidth={1.8}
                aria-hidden="true"
                className="text-brand-strong"
              />
              <h2 className="text-sm font-bold text-ink">Reviewer</h2>
            </div>
            <p className="mt-1 text-[0.6875rem] leading-4 text-muted">
              {actor.name} · {actor.role.replace("_", " ")} · id {actor.id}
            </p>
            <p className="mt-1.5 text-[0.625rem] leading-4 text-muted">
              Permission is enforced by the domain action and must be enforced
              again by the API AdminGuard.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
    </div>
  );
}

function Prose({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-canvas px-3.5 py-3">
      <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-ink">{body}</p>
    </div>
  );
}

function reviewHistoryText(campaign: Campaign): string {
  const review = campaign.review;
  switch (review.status) {
    case "not-submitted":
      return "The creator has not submitted this campaign for review.";
    case "in-review":
      return `Submitted ${formatShortDate(review.submittedAt)}. Awaiting a decision.`;
    case "changes-requested":
      return `Changes requested ${formatShortDate(review.requestedAt)} and sent back to the creator.`;
    case "rejected":
      return `Rejected ${formatShortDate(review.decidedAt)} with a recorded reason.`;
    case "approved":
      return `Approved ${formatShortDate(review.approvedAt)} and opened for funding.`;
  }
}
