import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  BankIcon,
  CheckListIcon,
  Coins01Icon,
  MoneyBag02Icon,
  PercentCircleIcon,
  Undo03Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Amount } from "@/components/ui/amount";
import { Cover } from "@/components/ui/cover";
import { MetricCard } from "@/components/ui/metric-card";
import {
  MilestonePill,
  PhasePill,
} from "@/features/campaigns/components/campaign-status-pill";
import { PreviewDataChip } from "@/features/campaigns/components/prototype-notice";
import { formatBps } from "@/features/campaigns/lib/amounts";
import { formatShortDate } from "@/features/campaigns/lib/dates";
import { categoryLabel } from "@/features/campaigns/lib/filters";
import { isPublicPhase } from "@/features/campaigns/lib/status";
import type { CampaignWorkspaceView } from "@/features/campaigns/server/creator";
import { formatMoney } from "@/lib/money";

/**
 * A campaign's workspace.
 *
 * The escrow block keeps released stablecoin, pending approval, and refunded
 * fiat apart (FR-405/§9): a released tranche is USDC in the creator's connected
 * wallet, not money in a bank account, and the payout card says so instead of
 * implying a settled balance.
 *
 * The milestone list here is a summary, not the worklist. It shows state and
 * tranche; submitting a claim is a deliberate trip to the milestones screen.
 */

const payoutNotes = {
  "not-started": {
    label: "No payout yet",
    note: "This build has no off-ramp. A released tranche stays as USDC in the connected wallet; converting it to naira is a partner integration (FR-405) that is not connected here.",
    tone: "muted" as const,
  },
  pending: {
    label: "Settlement pending",
    note: "A payout has been instructed and has not settled yet. The settled amount is not final until it does.",
    tone: "warning" as const,
  },
  settled: {
    label: "Settled",
    note: "This payout has settled. The date comes from the settlement record, not from the release.",
    tone: "muted" as const,
  },
  unavailable: {
    label: "Payout unavailable",
    note: "Payout state could not be read. Treat the released total below as unreconciled until it can be.",
    tone: "warning" as const,
  },
};

export function CampaignWorkspace({ view }: { view: CampaignWorkspaceView }) {
  const { campaign, escrow, ledger, summary, worklist } = view;
  const payout = payoutNotes[escrow.payout.state];
  const nextMilestone = worklist.find((item) => item.canSubmit) ?? null;

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <Link
          href="/d/creator/campaigns"
          className="font-semibold hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
        >
          Campaigns
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{campaign.title}</span>
      </nav>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <div className="hidden w-20 shrink-0 overflow-hidden rounded-xl sm:block">
            <Cover
              seed={campaign.slug}
              label={categoryLabel(campaign.category)}
              src={campaign.cover}
              ratio="thumbnail"
              size="grid"
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <PhasePill phase={campaign.phase} />
              <span className="text-xs text-muted">
                {categoryLabel(campaign.category)}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
              {campaign.title}
            </h1>
            <p className="mt-0.5 text-xs text-muted">
              {campaign.publishedAt
                ? `Published ${formatShortDate(campaign.publishedAt)}`
                : "Not published yet"}
              {campaign.phase === "funding"
                ? ` · Funding closes ${formatShortDate(campaign.funding.closesAt)}`
                : null}
            </p>
          </div>
        </div>

        <ul className="flex flex-wrap gap-1.5">
          <li>
            <Link
              href={`/d/creator/campaigns/${campaign.id}/edit`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border-strong bg-surface px-3.5 text-sm font-semibold text-ink transition-colors hover:border-brand-strong hover:bg-brand-soft hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
            >
              Edit campaign
            </Link>
          </li>
          <li>
            <Link
              href={`/d/creator/campaigns/${campaign.id}/milestones`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border-strong bg-surface px-3.5 text-sm font-semibold text-ink transition-colors hover:border-brand-strong hover:bg-brand-soft hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
            >
              <HugeiconsIcon
                icon={CheckListIcon}
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
              />
              Milestones
            </Link>
          </li>
          {isPublicPhase(campaign.phase) ? (
            <li>
              <Link
                href={`/campaigns/${campaign.slug}`}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border-strong bg-surface px-3.5 text-sm font-semibold text-ink transition-colors hover:border-brand-strong hover:bg-brand-soft hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
              >
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  size={16}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                Public page
              </Link>
            </li>
          ) : null}
        </ul>
      </div>

      {campaign.review.status === "changes-requested" ||
      campaign.review.status === "rejected" ? (
        <div className="mt-5 rounded-2xl border border-warning/30 bg-warning/[0.07] px-4 py-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <PhasePill phase={campaign.phase} size="xs" />
            <p className="text-sm font-semibold text-ink">
              {campaign.review.status === "changes-requested"
                ? "Inverge asked for changes"
                : "This campaign was not accepted"}
            </p>
          </div>
          <p className="mt-1.5 text-sm leading-6 text-ink">
            {campaign.review.status === "changes-requested"
              ? campaign.review.summary
              : campaign.review.reason}
          </p>
          <p className="mt-2 text-xs leading-5 text-muted">
            {campaign.review.status === "changes-requested"
              ? `Changes requested ${formatShortDate(campaign.review.requestedAt)}.`
              : `Decision recorded ${formatShortDate(campaign.review.decidedAt)}.`}{" "}
            Resubmitting is not available in this build; the review queue is a
            preview.
          </p>
        </div>
      ) : null}

      <p className="mt-4 text-sm leading-6 text-muted">
        <span className="font-semibold text-ink">Next: </span>
        {summary.nextAction}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Raised"
          icon={MoneyBag02Icon}
          value={escrow.raised ? <Amount value={escrow.raised} /> : "—"}
          hint={`Target ${formatMoney(escrow.target)}`}
          {...(escrow.raised === null
            ? {
                unavailable:
                  "The indexer has not reported this campaign's total yet.",
              }
            : {})}
        />
        <MetricCard
          label="Released"
          icon={Coins01Icon}
          value={<Amount value={escrow.totalReleased} />}
          hint="Out of escrow, held as USDC in your wallet."
        />
        <MetricCard
          label="Approved, awaiting release"
          icon={PercentCircleIcon}
          value={<Amount value={escrow.totalPending} />}
          hint="Decided, not yet transferred."
        />
        <MetricCard
          label="Refunded"
          icon={Undo03Icon}
          value={<Amount value={escrow.totalRefunded} />}
          hint="Returned to backers."
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section
          aria-labelledby="workspace-escrow"
          className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="workspace-escrow"
              className="text-base font-bold tracking-[-0.02em] text-ink"
            >
              Where the escrow sits
            </h2>
            <PreviewDataChip title="Escrow figures are preview data until the escrow indexer is connected" />
          </div>

          <table className="mt-3 w-full text-left text-sm">
            <caption className="sr-only">
              Each milestone tranche and where it currently sits.
            </caption>
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-[0.08em] text-muted">
                <th scope="col" className="py-2 font-semibold">
                  Tranche
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Amount
                </th>
                <th scope="col" className="py-2 font-semibold">
                  In escrow
                </th>
              </tr>
            </thead>
            <tbody>
              {ledger.rows.map((row) => (
                <tr
                  key={row.milestoneId}
                  className="border-b border-border/70 last:border-0"
                >
                  <th scope="row" className="py-2.5 font-normal text-ink">
                    <span className="text-muted">{row.sequence}.</span>{" "}
                    {row.title}
                  </th>
                  <td className="py-2.5 tabular-nums text-ink">
                    <Amount value={row.tranche} />
                  </td>
                  <td className="py-2.5 capitalize text-muted">{row.bucket}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section
          aria-labelledby="workspace-payout"
          className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
        >
          <h2
            id="workspace-payout"
            className="text-base font-bold tracking-[-0.02em] text-ink"
          >
            Getting paid
          </h2>

          <div className="mt-3 flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-canvas text-muted ring-1 ring-border">
              <HugeiconsIcon
                icon={
                  escrow.payout.state === "settled" ? BankIcon : Wallet01Icon
                }
                size={18}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{payout.label}</p>
              <p className="mt-0.5 text-xs text-muted">
                {escrow.payout.destinationLabel}
                {escrow.payout.lastSettledAt
                  ? ` · last settled ${formatShortDate(escrow.payout.lastSettledAt)}`
                  : null}
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-muted">{payout.note}</p>
        </section>
      </div>

      <section aria-labelledby="workspace-plan" className="mt-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="workspace-plan"
              className="text-base font-bold tracking-[-0.02em] text-ink"
            >
              Milestone plan
            </h2>
            <p className="mt-1 text-sm text-muted">
              {nextMilestone
                ? `Milestone ${nextMilestone.sequence} is ready for a claim.`
                : "No milestone can be claimed right now."}
            </p>
          </div>
          <Link
            href={`/d/creator/campaigns/${campaign.id}/milestones`}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Open the worklist
          </Link>
        </div>

        <ol className="mt-3 grid gap-3">
          {worklist.map((item) => (
            <li
              key={item.milestoneId}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Milestone {item.sequence} · {formatBps(item.allocationBps)}{" "}
                    · <Amount value={item.tranche} />
                  </p>
                  <h3 className="mt-1 text-sm font-bold text-ink">
                    {item.title}
                  </h3>
                </div>
                <MilestonePill state={item.state} size="xs" />
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">
                {item.requiredAction}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
