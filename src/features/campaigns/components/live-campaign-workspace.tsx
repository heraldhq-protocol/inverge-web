import { ArrowLeft01Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

import { Amount } from "@/components/ui/amount";
import { Cover } from "@/components/ui/cover";
import { Meter } from "@/components/ui/meter";
import { PhasePill } from "@/features/campaigns/components/campaign-status-pill";
import { formatShortDate } from "@/features/campaigns/lib/dates";
import { daysLeftLabel } from "@/features/campaigns/lib/filters";
import { fundedRatio } from "@/features/campaigns/lib/amounts";
import type { LiveCreatorCampaignView } from "@/features/campaigns/server/live-creator-campaign-detail";

/**
 * A live creator campaign workspace.
 *
 * This is intentionally narrower than the preview workspace: the campaign
 * endpoint has no escrow ledger, contribution rows, or milestone write actions,
 * so the page shows the plan and funding position and leaves those sections out.
 */
export function LiveCampaignWorkspace({
  view,
}: {
  view: LiveCreatorCampaignView;
}) {
  const ratio = fundedRatio(view.raised, view.target) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/d/creator/campaigns"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            size={16}
            strokeWidth={1.9}
            aria-hidden="true"
          />
          All campaigns
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/d/creator/campaigns/${view.campaignId}/milestones`}
            className="inline-flex min-h-10 items-center rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-ink hover:border-brand/40 hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Milestones
          </Link>
          <Link
            href={`/d/creator/campaigns/${view.campaignId}/edit`}
            className="inline-flex min-h-10 items-center rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-ink hover:border-brand/40 hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Edit
          </Link>
          {view.publicHref ? (
            <Link
              href={view.publicHref}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-brand px-3 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Public page
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                size={15}
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </Link>
          ) : null}
        </div>
      </div>

      <header className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="grid gap-0 md:grid-cols-[16rem_minmax(0,1fr)]">
          <div className="min-h-52 border-b border-border md:border-b-0 md:border-r">
            <Cover
              seed={view.slug}
              label={view.title}
              src={view.cover}
              ratio="thumbnail"
              size="lane"
            />
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <PhasePill phase={view.phase} size="sm" />
              {view.reviewStatus ? (
                <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-semibold text-muted">
                  Review: {view.reviewStatus.replaceAll("_", " ").toLowerCase()}
                </span>
              ) : null}
            </div>
            <h1 className="mt-3 text-balance text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
              {view.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {view.summary}
            </p>
            <p className="mt-4 rounded-xl border border-brand/15 bg-brand/[0.035] px-3 py-2 text-sm leading-6 text-ink">
              <span className="font-semibold">Next: </span>
              {view.nextAction}
            </p>
          </div>
        </div>
      </header>

      <section
        aria-labelledby="campaign-funding-heading"
        className="grid gap-3 sm:grid-cols-3"
      >
        <h2 id="campaign-funding-heading" className="sr-only">
          Funding
        </h2>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Raised
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-ink">
            <Amount value={view.raised} />
          </p>
          <Meter
            className="mt-2"
            ratio={ratio}
            cap={false}
            srLabel={`${Math.round(ratio * 100)} percent of target`}
          />
          <p className="mt-1 text-xs text-muted">
            of <Amount value={view.target} />
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Deadline
          </p>
          <p className="mt-2 text-lg font-bold text-ink">
            {formatShortDate(view.deadline)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {view.phase === "funding"
              ? daysLeftLabel(view.deadline, new Date())
              : "Funding not open"}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Milestones released
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-ink">
            {view.milestones.filter((milestone) => milestone.state === "released")
              .length}{" "}
            of {view.milestones.length}
          </p>
          <p className="mt-1 text-xs text-muted">
            Claim decisions are recorded against the published plan.
          </p>
        </div>
      </section>

      <section aria-labelledby="campaign-milestones-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="campaign-milestones-heading"
              className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
            >
              Milestone plan
            </h2>
            <p className="mt-1 text-sm text-muted">
              Tranches are released only after the evidence for each milestone
              is reviewed.
            </p>
          </div>
          {view.launchedAt ? (
            <p className="text-xs text-muted">
              Launched {formatShortDate(view.launchedAt)}
            </p>
          ) : null}
        </div>

        {view.milestones.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border-strong bg-surface px-5 py-8 text-center text-sm text-muted">
            This campaign has no milestone plan yet.
          </p>
        ) : (
          <ol className="mt-4 grid gap-3">
            {view.milestones.map((milestone) => (
              <li
                key={milestone.id}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand-strong">
                      {milestone.index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-ink">
                        {milestone.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {milestone.deliverable}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums text-ink">
                      {milestone.tranchePct}%
                    </p>
                    <p className="mt-0.5 text-xs text-muted">Tranche</p>
                    <p className="mt-2 rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted">
                      {milestone.stateLabel}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <p className="text-xs leading-5 text-muted">
        Escrow balances, contribution rows, and milestone claim submission are
        not exposed by the campaign API yet, so this live workspace does not show
        or change them.
      </p>
    </div>
  );
}
