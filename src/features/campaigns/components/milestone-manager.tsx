import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Clock01Icon,
  LockKeyIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Amount } from "@/components/ui/amount";
import { MilestonePill } from "@/features/campaigns/components/campaign-status-pill";
import { MilestoneClaimForm } from "@/features/campaigns/components/milestone-claim-form";
import { MilestoneEvidenceList } from "@/features/campaigns/components/campaign-milestone-timeline";
import { formatBps } from "@/features/campaigns/lib/amounts";
import { formatShortDate } from "@/features/campaigns/lib/dates";
import { isObjectionOpen } from "@/features/campaigns/lib/milestones";
import type { CampaignWorkspaceView } from "@/features/campaigns/server/creator";

/**
 * The milestone worklist.
 *
 * Every milestone is listed, including the ones that cannot be acted on, each
 * with the reason it is closed. A manager that only showed the next actionable
 * item would hide the state of the plan a creator most needs to explain to their
 * backers — a failed claim, a running objection window, a released tranche.
 *
 * `nowIso` is passed in rather than read here, so the objection window is decided
 * by one clock for the whole render and the component stays pure.
 */
export function MilestoneManager({
  view,
  nowIso,
}: {
  view: CampaignWorkspaceView;
  nowIso: string;
}) {
  const { campaign, worklist } = view;
  const byId = new Map(campaign.milestones.map((item) => [item.id, item]));
  const now = new Date(nowIso);

  return (
    <div className="max-w-4xl">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <Link
          href="/d/creator/campaigns"
          className="font-semibold hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
        >
          Campaigns
        </Link>
        <span aria-hidden="true"> / </span>
        <Link
          href={`/d/creator/campaigns/${campaign.id}`}
          className="font-semibold hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
        >
          {campaign.title}
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Milestones</span>
      </nav>

      <header className="mt-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
            Creator workspace
          </p>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
          Milestone plan
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
          Funds move only after a claim is approved and its objection window has
          closed. Submitting a claim does not release anything by itself.
        </p>
      </header>

      <ol className="mt-6 space-y-4">
        {worklist.map((item) => {
          const milestone = byId.get(item.milestoneId);
          if (!milestone) return null;

          const objectionOpen = isObjectionOpen(milestone, now);

          return (
            <li key={item.milestoneId}>
              <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                      Milestone {item.sequence} ·{" "}
                      {formatBps(item.allocationBps)} ·{" "}
                      <Amount value={item.tranche} />
                    </p>
                    <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-ink sm:text-lg">
                      {item.title}
                    </h2>
                  </div>
                  <MilestonePill state={milestone.state} />
                </div>

                <p className="mt-3 rounded-xl border border-border bg-canvas px-3.5 py-3 text-sm leading-6 text-ink">
                  <span className="font-semibold">Next: </span>
                  {item.requiredAction}
                </p>

                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                      What it delivers
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-ink">
                      {milestone.deliverable}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                      Evidence required
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-ink">
                      {milestone.evidence}
                    </dd>
                  </div>
                </dl>

                {milestone.objectionClosesAt ? (
                  <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3 text-xs text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <HugeiconsIcon
                        icon={Clock01Icon}
                        size={13}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      {objectionOpen
                        ? `Objections close ${formatShortDate(milestone.objectionClosesAt)}`
                        : `Objections closed ${formatShortDate(milestone.objectionClosesAt)}`}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{formatBps(milestone.objectionBps)} objected</span>
                  </p>
                ) : null}

                {milestone.submission ? (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                      Your submission ·{" "}
                      {formatShortDate(milestone.submission.submittedAt)}
                    </p>
                    <div className="mt-2">
                      <MilestoneEvidenceList
                        evidence={milestone.submission.evidence}
                      />
                    </div>
                  </div>
                ) : null}

                {milestone.decision ? (
                  <div className="mt-3 rounded-xl border border-border bg-canvas p-3.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                      Decision · {formatShortDate(milestone.decision.decidedAt)}
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-ink">
                      {milestone.decision.summary}
                    </p>
                  </div>
                ) : null}

                {item.canSubmit ? (
                  <div className="mt-4 border-t border-border pt-4">
                    <MilestoneClaimForm
                      milestone={milestone}
                      tranche={item.tranche}
                      objectionWindowDays={campaign.escrow.objectionWindowDays}
                    />
                  </div>
                ) : item.blockedReason ? (
                  <p className="mt-3 flex gap-2 rounded-xl bg-canvas px-3.5 py-3 text-xs leading-5 text-muted ring-1 ring-border">
                    <HugeiconsIcon
                      icon={
                        milestone.state === "upcoming"
                          ? LockKeyIcon
                          : Alert02Icon
                      }
                      size={14}
                      strokeWidth={1.9}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0"
                    />
                    {item.blockedReason}
                  </p>
                ) : null}
              </section>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
