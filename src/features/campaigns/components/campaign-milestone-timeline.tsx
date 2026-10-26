import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  ChevronDownIcon,
  Image01Icon,
  Link01Icon,
  Note02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";

import { Amount } from "@/components/ui/amount";
import { MilestonePill } from "@/features/campaigns/components/campaign-status-pill";
import { formatBps } from "@/features/campaigns/lib/amounts";
import { allocationFor } from "@/features/campaigns/lib/allocation";
import { formatShortDate } from "@/features/campaigns/lib/dates";
import {
  currentMilestone,
  escrowLedger,
  isObjectionOpen,
  milestoneProgress,
  milestoneTranche,
  objectionOutcome,
} from "@/features/campaigns/lib/milestones";
import type {
  Campaign,
  CampaignMilestone,
  MilestoneEvidence,
} from "@/features/campaigns/types";

/**
 * The milestone plan, as a delivery record.
 *
 * This is the contract the escrow enforces, so it shows the untidy parts too:
 * the evidence definition a claim will be judged against, an open objection
 * window with its current weight, and a failed claim with its refundable
 * consequence. A timeline that only ever showed approvals would misrepresent
 * what a backer is agreeing to.
 *
 * Each milestone is a disclosure: the sequence, the amount, and the status are
 * what a reader scans, and the evidence and decision history is opened on the
 * one they care about. The current milestone starts open, so the page never
 * makes a reader click to find out where their money is.
 */

const evidenceIcon: Record<MilestoneEvidence["kind"], typeof Link01Icon> = {
  link: Link01Icon,
  note: Note02Icon,
  photo: Image01Icon,
};

function markerTone(
  bucket: "refundable" | "released" | "unreleased",
  state: string,
) {
  if (bucket === "released") return "bg-brand text-white";
  if (bucket === "refundable") return "bg-danger text-white";
  if (state === "objection-window" || state === "claim-submitted") {
    return "bg-warning text-white";
  }
  if (state === "approved") return "bg-brand/20 text-brand-strong";
  return "bg-ink/15 text-ink";
}

export function MilestoneEvidenceList({
  evidence,
}: {
  evidence: readonly MilestoneEvidence[];
}) {
  if (evidence.length === 0) {
    return (
      <p className="text-sm text-muted">
        No evidence files are attached to this claim yet.
      </p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {evidence.map((item) => {
        const Icon = evidenceIcon[item.kind];

        return (
          <li key={item.id} className="flex gap-2.5">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-canvas text-muted">
              <HugeiconsIcon
                icon={Icon}
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </span>
            <div className="min-w-0">
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded text-sm font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {item.label}
                </a>
              ) : (
                <p className="text-sm font-semibold text-ink">{item.label}</p>
              )}
              <p className="mt-0.5 text-xs leading-5 text-muted">
                {item.description}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Where the plan stands, from the plan itself.
 *
 * Every figure is a count of the milestones' own states or a sum of their own
 * tranches; nothing here is an estimate or a projection.
 */
function MilestoneSummary({ campaign }: { campaign: Campaign }) {
  const progress = milestoneProgress(campaign.milestones);
  const current = currentMilestone(campaign.milestones);
  const ledger = escrowLedger(campaign);
  const failed = campaign.phase === "funding-failed";

  return (
    <section
      aria-labelledby="milestone-summary-heading"
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <h2 className="sr-only" id="milestone-summary-heading">
        Plan progress
      </h2>

      <dl className="grid gap-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-muted">Milestones released</dt>
          <dd className="mt-1 text-lg font-bold tabular-nums tracking-[-0.02em] text-ink">
            {progress.released} of {progress.total}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Still in escrow</dt>
          <dd className="mt-1 text-lg font-bold tracking-[-0.02em] text-ink">
            <Amount value={ledger.unreleased} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Refundable</dt>
          <dd className="mt-1 text-lg font-bold tracking-[-0.02em] text-ink">
            <Amount value={ledger.refundable} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Current milestone</dt>
          <dd className="mt-1 text-sm font-semibold text-ink">
            {current ? `Milestone ${current.sequence}` : "Plan complete"}
          </dd>
        </div>
      </dl>

      <p className="mt-4 border-t border-border pt-3 text-xs leading-5 text-muted">
        {failed
          ? "The funding window closed below target, so the plan never started: nothing was released, and the raise is refundable."
          : current
            ? `${current.title} is the milestone being worked on. Its tranche is released only once the evidence below is approved.`
            : "Every milestone in this plan has been released."}
      </p>
    </section>
  );
}

function MilestoneItem({
  campaign,
  isCurrent,
  milestone,
  now,
}: {
  campaign: Campaign;
  isCurrent: boolean;
  milestone: CampaignMilestone;
  now: Date;
}) {
  const allocation = allocationFor(campaign);
  const tranche =
    allocation.milestones.find((item) => item.milestoneId === milestone.id)
      ?.amount ??
    milestoneTranche(allocation.remaining, milestone.allocationBps);
  const outcome = objectionOutcome(
    milestone,
    campaign.escrow.objectionThresholdBps,
  );
  const { objectionWindowDays } = campaign.escrow;
  const refundsEverything = campaign.phase === "funding-failed";
  const bucket = refundsEverything ? "refundable" : markerBucket(milestone);

  return (
    <li className="relative">
      <span
        aria-hidden="true"
        className={`absolute -left-[2.15rem] top-5 grid size-5 place-items-center rounded-full ring-4 ring-canvas ${markerTone(
          bucket,
          milestone.state,
        )}`}
      >
        <HugeiconsIcon
          icon={CheckmarkCircle01Icon}
          size={12}
          strokeWidth={2.4}
        />
      </span>

      <details
        className="group rounded-2xl border border-border bg-surface open:shadow-sm"
        open={isCurrent}
      >
        <summary className="flex cursor-pointer list-none items-start gap-3 rounded-2xl p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:p-5">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
              Milestone {milestone.sequence}
            </p>
            <h3 className="mt-1 text-base font-bold tracking-[-0.02em] text-ink sm:text-lg">
              {milestone.title}
            </h3>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
              <span className="font-semibold tabular-nums text-ink">
                <Amount value={tranche} />
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {formatBps(milestone.allocationBps)} of escrow
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {milestone.expectedAt
                  ? `Expected ${formatShortDate(milestone.expectedAt)}`
                  : "Not dated"}
              </span>
            </p>
            <div className="mt-2">
              <MilestonePill state={milestone.state} />
            </div>
          </div>

          <HugeiconsIcon
            icon={ChevronDownIcon}
            size={18}
            strokeWidth={1.9}
            aria-hidden="true"
            className="mt-1 shrink-0 text-muted transition-transform group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>

        <div className="space-y-4 border-t border-border p-4 sm:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
              What it delivers
            </p>
            <p className="mt-1.5 text-sm leading-6 text-ink">
              {milestone.deliverable}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-canvas p-3.5">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
              Evidence this claim is judged against
            </p>
            <p className="mt-1.5 text-sm leading-6 text-ink">
              {milestone.evidence}
            </p>
            <p className="mt-1.5 text-xs leading-5 text-muted">
              Fixed when the campaign was approved, and not changed afterwards.
            </p>
          </div>

          {milestone.submission ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                Claim submitted{" "}
                {formatShortDate(milestone.submission.submittedAt)}
              </p>
              <div className="mt-2">
                <MilestoneEvidenceList
                  evidence={milestone.submission.evidence}
                />
              </div>
            </div>
          ) : null}

          {milestone.objectionClosesAt ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  size={13}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                {isObjectionOpen(milestone, now)
                  ? `Objections close ${formatShortDate(milestone.objectionClosesAt)}`
                  : `Objections closed ${formatShortDate(milestone.objectionClosesAt)}`}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {formatBps(milestone.objectionBps)} objected
                {outcome === "unknown"
                  ? ", threshold per published terms"
                  : campaign.escrow.objectionThresholdBps === null
                    ? ""
                    : `, threshold ${formatBps(campaign.escrow.objectionThresholdBps)}`}
              </span>
            </div>
          ) : null}

          {milestone.decision ? (
            <div className="rounded-xl border border-border bg-canvas p-3.5">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                Decision {formatShortDate(milestone.decision.decidedAt)}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-ink">
                {milestone.decision.summary}
              </p>
              <p className="mt-1.5 text-xs leading-5 text-muted">
                {milestone.decision.transaction
                  ? `Recorded on ${milestone.decision.transaction.network}.`
                  : "No transaction is recorded for this decision in this preview."}
              </p>
            </div>
          ) : null}

          {milestone.state === "upcoming" && objectionWindowDays !== null ? (
            <p className="text-xs leading-5 text-muted">
              On submission, a {objectionWindowDays}-day objection window opens
              before any funds move.
            </p>
          ) : null}
        </div>
      </details>
    </li>
  );
}

/** The bucket a milestone's own state puts its tranche in. */
function markerBucket(
  milestone: CampaignMilestone,
): "refundable" | "released" | "unreleased" {
  if (milestone.state === "released") return "released";
  if (milestone.state === "failed" || milestone.state === "refund-available") {
    return "refundable";
  }
  return "unreleased";
}

export function CampaignMilestoneTimeline({
  campaign,
  nowIso,
}: {
  campaign: Campaign;
  nowIso: string;
}) {
  const now = new Date(nowIso);
  const current = currentMilestone(campaign.milestones);

  return (
    <div className="space-y-6">
      <MilestoneSummary campaign={campaign} />
      <ol className="space-y-4 border-l border-border pl-8 sm:pl-9">
        {campaign.milestones.map((milestone) => (
          <MilestoneItem
            key={milestone.id}
            campaign={campaign}
            isCurrent={milestone.id === current?.id}
            milestone={milestone}
            now={now}
          />
        ))}
      </ol>
    </div>
  );
}
