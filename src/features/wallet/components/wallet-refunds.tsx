import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowRight01Icon,
  HandCoinsIcon,
  InformationCircleIcon,
  Undo03Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Amount } from "@/components/ui/amount";
import { MetricCard } from "@/components/ui/metric-card";
import { StatePanel } from "@/components/ui/state-panel";
import { RefundPill } from "@/features/campaigns/components/campaign-status-pill";
import { formatShortDate } from "@/features/campaigns/lib/dates";
import { refundStateDescriptions } from "@/features/campaigns/lib/status";
import { CapabilityStatusPill } from "@/features/wallet/components/wallet-status-pill";
import { capabilityStatus } from "@/features/wallet/lib/capabilities";
import { refundActionAvailability } from "@/features/wallet/lib/refunds";
import type { WalletRefund, WalletView } from "@/features/wallet/types";

/**
 * Refunds.
 *
 * A refund is a campaign outcome, not a wallet action. This page can show what
 * is claimable, what is on its way, and what has been returned, but it cannot
 * execute a claim: there is no refund service and no escrow index behind this
 * build. The action is present and disabled, with the reason attached, rather
 * than omitted — a backer with a refundable contribution needs to know that the
 * record exists and why the button does nothing yet.
 */

function RefundCard({ refund }: { refund: WalletRefund }) {
  const action = refundActionAvailability(refund.state);

  return (
    <li className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-5 text-ink">
            {refund.campaignTitle}
          </p>
          <p className="mt-0.5 text-xs text-muted">Refund record {refund.id}</p>
        </div>
        <RefundPill state={refund.state} />
      </div>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-xs text-muted">Eligible amount</p>
        <p className="text-lg font-bold tabular-nums text-ink">
          <Amount value={refund.eligibleAmount} />
        </p>
      </div>

      <p className="mt-2 text-sm leading-6 text-muted">
        {refundStateDescriptions[refund.state]}
      </p>

      {refund.reason ? (
        <p className="mt-2 rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs leading-5 text-muted">
          {refund.reason}
        </p>
      ) : null}

      <dl className="mt-3 grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted">Contribution</dt>
          <dd>
            <Link
              href={`/d/backing/${refund.contributionId}`}
              className="font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Open record
            </Link>
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted">Claim submitted</dt>
          <dd className="font-medium text-ink">
            {refund.claimSubmittedAt
              ? formatShortDate(refund.claimSubmittedAt)
              : "Not submitted"}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted">Confirmed</dt>
          <dd className="font-medium text-ink">
            {refund.confirmedAt
              ? formatShortDate(refund.confirmedAt)
              : "Not confirmed"}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted">Transaction</dt>
          <dd className="font-medium text-ink">
            {refund.transaction?.signature ?? "None exists"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3.5">
        {action.canRequest ? (
          <button
            type="button"
            disabled
            aria-describedby={`refund-reason-${refund.id}`}
            className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white opacity-45"
          >
            {action.label}
          </button>
        ) : null}
        <p
          id={`refund-reason-${refund.id}`}
          className="min-w-0 flex-1 text-xs leading-5 text-muted"
        >
          {action.reason ??
            "Refund execution is not connected in this build, so this claim cannot be submitted."}
        </p>
      </div>
    </li>
  );
}

export function WalletRefunds({ view }: { view: WalletView }) {
  const refunds = view.refunds;
  const refundsStatus = capabilityStatus(view.capabilities, "refunds");
  const refundsCapability = view.capabilities.find(
    (capability) => capability.id === "refunds",
  );

  return (
    <div className="space-y-7">
      <section aria-labelledby="refund-summary-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="refund-summary-title"
              className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
            >
              Refund summary
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-muted">
              Refund eligibility comes from the campaign outcome. These figures
              are derived from preview contribution records, not from a refund
              service.
            </p>
          </div>
          <CapabilityStatusPill status={refundsStatus} />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <MetricCard
            label="Refundable"
            icon={Undo03Icon}
            value={<Amount value={view.totals.refundable} />}
            hint="Eligible now because a campaign missed its target."
          />
          <MetricCard
            label="In progress"
            icon={HandCoinsIcon}
            value={<Amount value={view.totals.refundsInProgress} />}
            hint="Claimed and still being returned."
          />
          <MetricCard
            label="Refunded"
            icon={InformationCircleIcon}
            value={<Amount value={view.totals.refunded} />}
            hint="Confirmed as returned to the source of the contribution."
          />
        </div>

        <div className="mt-3 flex gap-2.5 rounded-2xl border border-warning/30 bg-warning/[0.07] px-4 py-3.5">
          <HugeiconsIcon
            icon={Alert02Icon}
            size={17}
            strokeWidth={1.9}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-warning-strong"
          />
          <p className="text-sm leading-6 text-muted">
            {refundsCapability?.reason ??
              "Refund records are preview data and cannot be claimed here."}{" "}
            {refunds.length > 0
              ? "The records below show what the live product must display; none of them moves money."
              : null}
          </p>
        </div>
      </section>

      <section aria-labelledby="refund-records-title">
        <h2
          id="refund-records-title"
          className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
        >
          Refund records
        </h2>

        {refunds.length === 0 ? (
          <div className="mt-3">
            <StatePanel
              variant="empty"
              eyebrow="No refunds"
              title="Nothing is refundable right now"
              description="A refund appears here only when a contribution's campaign outcome makes one due or one is already being returned. This preview has no refund records to show."
              action={
                <Link
                  href="/d/backing"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Review your backing
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={16}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                </Link>
              }
            />
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {refunds.map((refund) => (
              <RefundCard key={refund.id} refund={refund} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
