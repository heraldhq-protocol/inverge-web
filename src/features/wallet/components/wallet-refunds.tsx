import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Amount } from "@/components/ui/amount";
import { Pill } from "@/components/ui/pill";
import { StatePanel } from "@/components/ui/state-panel";
import { RefundPill } from "@/features/campaigns/components/campaign-status-pill";
import { formatShortDate } from "@/features/campaigns/lib/dates";
import { refundStateDescriptions } from "@/features/campaigns/lib/status";
import { capabilityStatus } from "@/features/wallet/lib/capabilities";
import { refundActionAvailability } from "@/features/wallet/lib/refunds";
import type { WalletRefund, WalletView } from "@/features/wallet/types";
import type { MoneyAmount } from "@/lib/money";

/**
 * Refunds.
 *
 * A refund is a campaign outcome, not a wallet action. This page shows what is
 * eligible, what is on its way, and what has been returned. There is no refund
 * service behind this build, so there is no claim control at all: a disabled
 * button would suggest that the only missing step is the backer's click.
 */

function RefundCard({
  executionAvailable,
  refund,
}: {
  executionAvailable: boolean;
  refund: WalletRefund;
}) {
  const action = refundActionAvailability(refund.state);

  return (
    <li className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-5 text-ink">
            {refund.campaignTitle}
          </p>
          <p className="mt-0.5 text-xs text-muted">Contribution refund</p>
        </div>
        <RefundPill state={refund.state} />
      </div>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-xs text-muted">Refund amount</p>
        <p className="text-lg font-semibold tabular-nums text-ink">
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

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 text-xs">
        <Link
          href={`/d/backing/${refund.contributionId}`}
          className="inline-flex min-h-9 items-center gap-1 font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          View contribution
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={13}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </Link>
        {refund.claimSubmittedAt ? (
          <span className="text-muted">
            Claim submitted {formatShortDate(refund.claimSubmittedAt)}
          </span>
        ) : null}
        {refund.confirmedAt ? (
          <span className="text-muted">
            Returned {formatShortDate(refund.confirmedAt)}
          </span>
        ) : null}
      </div>

      {action.canRequest && !executionAvailable ? (
        <p className="mt-2 text-xs leading-5 text-muted">
          {action.reason ?? "Claiming isn’t available yet."}
        </p>
      ) : null}
    </li>
  );
}

function SummaryCell({
  hint,
  label,
  value,
}: {
  hint: string;
  label: string;
  value: MoneyAmount;
}) {
  return (
    <div className="p-4">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-ink">
        <Amount value={value} />
      </p>
      <p className="mt-0.5 text-[0.6875rem] leading-5 text-muted">{hint}</p>
    </div>
  );
}

export function WalletRefunds({ view }: { view: WalletView }) {
  const refunds = view.refunds;
  const preview = view.dataSource === "preview";
  const executionAvailable =
    capabilityStatus(view.capabilities, "refunds") === "available";

  return (
    <div className="space-y-5 sm:space-y-6">
      <section aria-labelledby="refund-summary-title">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="refund-summary-title"
            className="text-base font-semibold text-ink"
          >
            Refund summary
          </h2>
          {preview ? (
            <Pill tone="neutral" size="xs">
              Example data
            </Pill>
          ) : null}
        </div>

        <div className="mt-2.5 grid divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <SummaryCell
            label="Refundable"
            value={view.totals.refundable}
            hint="Eligible because a campaign missed its target."
          />
          <SummaryCell
            label="In progress"
            value={view.totals.refundsInProgress}
            hint="Claimed and still being returned."
          />
          <SummaryCell
            label="Returned"
            value={view.totals.refunded}
            hint="Confirmed back to the contributing wallet."
          />
        </div>

        {!executionAvailable ? (
          <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-muted">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
              className="mt-0.5 shrink-0"
            />
            Refund claims can&rsquo;t be submitted yet. These records are
            examples until the refund service is connected, and nothing on this
            page moves money.
          </p>
        ) : null}
      </section>

      <section aria-labelledby="refund-records-title">
        <h2
          id="refund-records-title"
          className="text-base font-semibold text-ink"
        >
          Refund records
        </h2>

        {refunds.length === 0 ? (
          <div className="mt-2.5">
            <StatePanel
              variant="empty"
              eyebrow="No refunds"
              title="Nothing is refundable right now"
              description="If a campaign you backed doesn’t reach its target, any refund will appear here with its own status."
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
          <ul className="mt-2.5 space-y-3">
            {refunds.map((refund) => (
              <RefundCard
                executionAvailable={executionAvailable}
                key={refund.id}
                refund={refund}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
