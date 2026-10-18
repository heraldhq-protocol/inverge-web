import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Link01Icon,
  Note02Icon,
  Image01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";

import { Amount } from "@/components/ui/amount";
import { MilestonePill } from "@/features/campaigns/components/campaign-status-pill";
import { formatBps } from "@/features/campaigns/lib/amounts";
import { formatShortDate } from "@/features/campaigns/lib/dates";
import {
  isObjectionOpen,
  milestoneTranche,
  objectionOutcome,
  trancheBucket,
} from "@/features/campaigns/lib/milestones";
import type {
  Campaign,
  CampaignMilestone,
  MilestoneEvidence,
} from "@/features/campaigns/types";

/**
 * The milestone plan, as a timeline.
 *
 * This is the contract the escrow enforces, so it shows the untidy parts too:
 * the evidence definition a claim will be judged against, an open objection
 * window with its current weight, and a failed claim with its refundable
 * consequence. A timeline that only ever shows approvals would misrepresent what
 * backers are agreeing to.
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

function MilestoneItem({
  campaign,
  milestone,
  now,
}: {
  campaign: Campaign;
  milestone: CampaignMilestone;
  now: Date;
}) {
  const bucket = trancheBucket(milestone.state);
  const tranche = milestoneTranche(
    campaign.funding.target,
    milestone.allocationBps,
  );
  const outcome = objectionOutcome(
    milestone,
    campaign.escrow.objectionThresholdBps,
  );
  const { objectionWindowDays } = campaign.escrow;

  return (
    <li className="relative">
      <span
        aria-hidden="true"
        className={`absolute -left-[2.15rem] top-1 grid size-5 place-items-center rounded-full ring-4 ring-canvas ${markerTone(
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

      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
              Milestone {milestone.sequence}
            </p>
            <h3 className="mt-1 text-base font-bold tracking-[-0.02em] text-ink sm:text-lg">
              {milestone.title}
            </h3>
          </div>
          <MilestonePill state={milestone.state} />
        </div>

        <dl className="mt-4 grid gap-3 border-y border-border py-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted">Tranche</dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-ink">
              <Amount value={tranche} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Share of escrow</dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-ink">
              {formatBps(milestone.allocationBps)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Expected</dt>
            <dd className="mt-0.5 font-semibold text-ink">
              {milestone.expectedAt
                ? formatShortDate(milestone.expectedAt)
                : "Not dated"}
            </dd>
          </div>
        </dl>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
            What it delivers
          </p>
          <p className="mt-1.5 text-sm leading-6 text-ink">
            {milestone.deliverable}
          </p>
        </div>

        <div className="mt-3 rounded-xl border border-border bg-canvas p-3.5">
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
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
              Claim submitted{" "}
              {formatShortDate(milestone.submission.submittedAt)}
            </p>
            <div className="mt-2">
              <MilestoneEvidenceList evidence={milestone.submission.evidence} />
            </div>
          </div>
        ) : null}

        {milestone.objectionClosesAt ? (
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3 text-xs text-muted">
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
          <div className="mt-4 rounded-xl border border-border bg-canvas p-3.5">
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
          <p className="mt-4 text-xs leading-5 text-muted">
            On submission, a {objectionWindowDays}-day objection window opens
            before any funds move.
          </p>
        ) : null}
      </div>
    </li>
  );
}

export function CampaignMilestoneTimeline({
  campaign,
  nowIso,
}: {
  campaign: Campaign;
  nowIso: string;
}) {
  const now = new Date(nowIso);

  return (
    <ol className="space-y-5 border-l border-border pl-8 sm:pl-9">
      {campaign.milestones.map((milestone) => (
        <MilestoneItem
          key={milestone.id}
          campaign={campaign}
          milestone={milestone}
          now={now}
        />
      ))}
    </ol>
  );
}
