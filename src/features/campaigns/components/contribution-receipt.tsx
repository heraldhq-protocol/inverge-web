import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Link01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import type { ReactNode } from "react";

import { Amount } from "@/components/ui/amount";
import { Cover } from "@/components/ui/cover";
import { CampaignBreadcrumbs } from "@/features/campaigns/components/campaign-breadcrumbs";
import {
  ContributionPill,
  PaymentPill,
  RefundPill,
} from "@/features/campaigns/components/campaign-status-pill";
import { PrototypeNotice } from "@/features/campaigns/components/prototype-notice";
import { formatKoboAsNaira } from "@/features/campaigns/lib/amounts";
import { formatShortDate } from "@/features/campaigns/lib/dates";
import {
  contributionStateDescriptions,
  paymentStateDescriptions,
  refundStateDescriptions,
} from "@/features/campaigns/lib/status";
import type { ContributionReceiptView } from "@/features/campaigns/server/backing";

/**
 * The full record for one contribution.
 *
 * The three legs are separated because they fail independently: a provider
 * payment can succeed while the escrow leg is still reconciling, and a refund can
 * be available while the contribution itself is confirmed. Each leg states its
 * own state, what that state means, and — where a chain reference would go — that
 * none exists, rather than leaving a blank that reads as "confirmed on chain".
 */

function LegCard({
  eyebrow,
  title,
  pill,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  pill: ReactNode;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-muted">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-base font-bold tracking-[-0.02em] text-ink">
            {title}
          </h2>
        </div>
        {pill}
      </div>
      <p className="mt-2.5 text-sm leading-6 text-muted">{description}</p>
      {children ? <div className="mt-3.5">{children}</div> : null}
    </section>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-border/70 py-2 last:border-0 last:pb-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export function ContributionReceipt({
  view,
}: {
  view: ContributionReceiptView;
}) {
  const { contribution } = view;
  const { payment, contribution: escrow, refund, fiatLeg } = contribution;

  const action =
    refund.state === "available"
      ? {
          body: `Claiming this refund is not available in this build: no refund service is connected, and this page will not simulate one. In the live product, a claim started here returns the eligible amount below to the wallet the contribution came from.`,
          title: "Claim a refund",
        }
      : payment.state === "user-action-required"
        ? {
            body: "This payment is waiting on you. Finishing it is not available in this build, because no payment provider is connected. In the live product, this record would reopen the provider's own step.",
            title: "Finish the payment",
          }
        : payment.state === "failed" ||
            payment.state === "quote-expired" ||
            payment.state === "provider-unavailable"
          ? {
              body: "This payment did not go through, so nothing is held in escrow for it. Retrying is not available in this build, because no payment provider is connected.",
              title: "Try the payment again",
            }
          : escrow.state === "reconciling"
            ? {
                body: "Inverge is reconciling this record against the escrow index. Nothing is wrong yet and there is nothing to do; the state will settle once the index catches up.",
                title: "Wait for reconciliation",
              }
            : null;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <CampaignBreadcrumbs
        trail={[
          { href: "/d", label: "Dashboard" },
          { href: "/d/backing", label: "Backing" },
          { label: contribution.campaignTitle },
        ]}
      />

      <header className="mt-4 flex flex-wrap items-start gap-5">
        <div className="hidden w-40 shrink-0 overflow-hidden rounded-2xl sm:block">
          <Cover
            seed={contribution.campaignSlug}
            label="Campaign"
            src={contribution.cover}
            ratio="thumbnail"
            size="grid"
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted">
            Contribution submitted {formatShortDate(contribution.submittedAt)}
          </p>
          <h1 className="mt-1 text-balance text-2xl font-bold leading-tight tracking-[-0.035em] text-ink sm:text-3xl">
            <Link
              href={`/campaigns/${contribution.campaignSlug}`}
              className="rounded hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {contribution.campaignTitle}
            </Link>
          </h1>
          <p className="mt-1 text-sm text-muted">by {contribution.creator}</p>
          <p className="mt-3 text-2xl font-bold tracking-[-0.035em] tabular-nums text-ink">
            <Amount value={contribution.amount} />{" "}
            <span className="text-sm font-semibold text-muted">
              {contribution.fundingAsset}
            </span>
          </p>
        </div>
      </header>

      <div className="mt-6">
        <PrototypeNotice title="No transaction exists for this contribution">
          This record comes from preview data. No wallet was connected, no
          provider was contacted, and no on-chain transaction was created, so
          there is no signature to show and nothing to verify on an explorer.
        </PrototypeNotice>
      </div>

      <div className="mt-6 space-y-4">
        <LegCard
          eyebrow="Leg 1 of 3"
          title="Payment"
          pill={<PaymentPill state={payment.state} />}
          description={paymentStateDescriptions[payment.state]}
        >
          <dl>
            <Row
              label="Route"
              value={
                contribution.route === "usdc-wallet"
                  ? "USDC from a wallet"
                  : "Naira on-ramp (card or bank transfer)"
              }
            />
            <Row label="Method" value={payment.method ?? "Not recorded"} />
            <Row
              label="Provider reference"
              value={payment.providerReference ?? "None recorded"}
            />
            {fiatLeg ? (
              <>
                <Row label="Original currency" value="Nigerian naira (NGN)" />
                <Row
                  label="Recorded quote"
                  value={
                    fiatLeg.quoteStatus === "current"
                      ? formatKoboAsNaira(fiatLeg.atomic)
                      : "Not available"
                  }
                />
                <Row
                  label="Quote expiry"
                  value={formatShortDate(fiatLeg.quoteExpiresAt)}
                />
                <Row
                  label="Quote status"
                  value={
                    fiatLeg.quoteStatus === "current"
                      ? "Current"
                      : fiatLeg.quoteStatus === "expired"
                        ? "Expired"
                        : "Not available"
                  }
                />
              </>
            ) : (
              <Row
                label="Fiat leg"
                value="None — this contribution was made in USDC, so no currency conversion applied"
              />
            )}
          </dl>
        </LegCard>

        <LegCard
          eyebrow="Leg 2 of 3"
          title="Escrow contribution"
          pill={<ContributionPill state={escrow.state} />}
          description={contributionStateDescriptions[escrow.state]}
        >
          <dl>
            <Row
              label="Recorded against escrow"
              value={
                escrow.confirmedAt
                  ? formatShortDate(escrow.confirmedAt)
                  : "Not yet"
              }
            />
            <Row
              label="Transaction"
              value={
                escrow.transaction
                  ? `${escrow.transaction.signature} on ${escrow.transaction.network}`
                  : "None recorded"
              }
            />
          </dl>
        </LegCard>

        <LegCard
          eyebrow="Leg 3 of 3"
          title="Refund"
          pill={<RefundPill state={refund.state} />}
          description={refundStateDescriptions[refund.state]}
        >
          <dl>
            {refund.reason ? (
              <Row label="Reason" value={refund.reason} />
            ) : null}
            <Row
              label="Eligible amount"
              value={
                refund.eligibleAmount ? (
                  <Amount value={refund.eligibleAmount} />
                ) : (
                  "Not applicable"
                )
              }
            />
            <Row
              label="Claim submitted"
              value={
                refund.claimSubmittedAt
                  ? formatShortDate(refund.claimSubmittedAt)
                  : "No claim submitted"
              }
            />
            <Row
              label="Refund confirmed"
              value={
                refund.confirmedAt
                  ? formatShortDate(refund.confirmedAt)
                  : "Not yet"
              }
            />
            <Row
              label="Transaction"
              value={
                refund.transaction
                  ? `${refund.transaction.signature} on ${refund.transaction.network}`
                  : "None recorded"
              }
            />
          </dl>
        </LegCard>

        {action ? (
          <section className="rounded-2xl border border-border bg-canvas p-4 sm:p-5">
            <h2 className="text-base font-bold tracking-[-0.02em] text-ink">
              {action.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">{action.body}</p>
          </section>
        ) : null}

        {contribution.support.relatedUpdateIds.length > 0 ? (
          <section className="rounded-2xl border border-border bg-canvas p-4 sm:p-5">
            <h2 className="text-base font-bold tracking-[-0.02em] text-ink">
              Related updates
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              The creator has posted{" "}
              {contribution.support.relatedUpdateIds.length === 1
                ? "1 update"
                : `${contribution.support.relatedUpdateIds.length} updates`}{" "}
              that relate to this contribution.
            </p>
            <Link
              href={`/campaigns/${contribution.campaignSlug}#updates`}
              className="mt-3 inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <HugeiconsIcon
                icon={Link01Icon}
                size={15}
                strokeWidth={1.9}
                aria-hidden="true"
              />
              Read the campaign updates
            </Link>
          </section>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/d/backing"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          All contributions
        </Link>
        <Link
          href={`/campaigns/${contribution.campaignSlug}`}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Open the campaign
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={16}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  );
}
