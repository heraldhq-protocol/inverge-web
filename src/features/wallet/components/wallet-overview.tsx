import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowRight01Icon,
  CreditCardIcon,
  HandCoinsIcon,
  QrCodeIcon,
  Shield01Icon,
  Undo03Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Amount } from "@/components/ui/amount";
import { MetricCard } from "@/components/ui/metric-card";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatShortDate } from "@/features/campaigns/lib/dates";
import { WalletActivityList } from "@/features/wallet/components/wallet-activity-list";
import { WalletAuthPanel } from "@/features/wallet/components/wallet-auth-panel";
import { WalletBalanceGrid } from "@/features/wallet/components/wallet-balance-card";
import {
  CapabilityList,
  WalletStatusPill,
} from "@/features/wallet/components/wallet-status-pill";
import { hasWalletAttention } from "@/features/wallet/content/preview-wallet";
import { getWalletNetwork } from "@/features/wallet/lib/networks";
import type { WalletView } from "@/features/wallet/types";

/**
 * Wallet overview.
 *
 * It answers the four questions a backer has in order: is there an account, what
 * is in it, what needs me, and what can I actually do. Where the answer is "not
 * connected", the page says that and offers no control that pretends otherwise.
 */

function ActionLink({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: IconSvgElement;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-20 items-start gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand-strong"
      >
        <HugeiconsIcon icon={icon} size={18} strokeWidth={1.8} />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1 text-sm font-semibold text-ink">
          {label}
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={14}
            strokeWidth={1.9}
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-muted">
          {description}
        </span>
      </span>
    </Link>
  );
}

export function WalletOverview({ view }: { view: WalletView }) {
  const network = getWalletNetwork(view.account.network);
  const recentActivity = view.activity.slice(0, 4);
  const attention = hasWalletAttention(view);

  return (
    <div className="space-y-7">
      {attention ? (
        <div className="flex gap-3 rounded-2xl border border-warning/30 bg-warning/[0.07] px-4 py-3.5">
          <HugeiconsIcon
            icon={Alert02Icon}
            size={18}
            strokeWidth={1.9}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-warning-strong"
          />
          <p className="text-sm leading-6 text-ink">
            {view.counts.needsAttention === 1
              ? "1 wallet record needs your attention."
              : `${view.counts.needsAttention} wallet records need your attention.`}{" "}
            <Link
              href="/d/wallet/activity?filter=attention"
              className="font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Review them
            </Link>
          </p>
        </div>
      ) : null}

      <WalletAuthPanel />

      <section aria-labelledby="wallet-account-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="wallet-account-title"
            className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
          >
            Account
          </h2>
          <WalletStatusPill state={view.account.provisioning} />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <dl className="space-y-2.5 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <dt className="text-muted">Provider</dt>
                <dd className="font-medium text-ink">
                  {view.account.provider.label}
                </dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <dt className="text-muted">Network</dt>
                <dd className="font-medium text-ink">{network.label}</dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <dt className="text-muted">Public address</dt>
                <dd className="font-medium text-ink">
                  {view.account.address ?? "No address linked yet"}
                </dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <dt className="text-muted">Provisioned</dt>
                <dd className="font-medium text-ink">
                  {view.account.provisionedAt
                    ? formatShortDate(view.account.provisionedAt)
                    : "Not provisioned"}
                </dd>
              </div>
            </dl>

            {view.account.address === null ? (
              <p className="mt-3 rounded-xl border border-border bg-canvas p-3 text-xs leading-5 text-muted">
                This build does not invent an address. Signing in above shows
                your provider&rsquo;s address on this device only; receiving,
                sending, and signing stay unavailable until that account is
                linked to your Inverge identity.
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-border bg-canvas p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={Shield01Icon}
                size={17}
                strokeWidth={1.8}
                aria-hidden="true"
                className="text-brand-strong"
              />
              <p className="text-sm font-semibold text-ink">
                What is real here
              </p>
            </div>
            <ul className="mt-2.5 space-y-1.5 text-xs leading-5 text-muted">
              <li>
                Activity is derived from preview contribution records, not a
                chain index.
              </li>
              <li>
                Balances are labelled samples. Nothing was deposited, withdrawn,
                or confirmed.
              </li>
              <li>
                No private key, seed phrase, or signing share is read, stored,
                or shown by this page.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="wallet-balances-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="wallet-balances-title"
            className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
          >
            Balances
          </h2>
          <Pill tone="neutral" size="xs">
            Preview
          </Pill>
        </div>
        <div className="mt-3">
          <WalletBalanceGrid balances={view.balances} />
        </div>
      </section>

      <section aria-labelledby="wallet-actions-title">
        <h2
          id="wallet-actions-title"
          className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
        >
          What you can do
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <ActionLink
            description="No address exists, so this page explains the handoff instead of showing a QR code."
            href="/d/wallet/receive"
            icon={QrCodeIcon}
            label="Add funds"
          />
          <ActionLink
            description="See every contribution and refund record with its own settlement state."
            href="/d/wallet/activity"
            icon={Wallet01Icon}
            label="View activity"
          />
          <ActionLink
            description="Back a campaign from the balance shown here once signing is connected."
            href="/campaigns"
            icon={HandCoinsIcon}
            label="Back a campaign"
          />
          <ActionLink
            description="Card and bank funding needs a licensed provider quote. None is configured."
            href="/d/wallet/receive#on-ramp"
            icon={CreditCardIcon}
            label="Card or bank funding"
          />
        </div>
      </section>

      <section aria-labelledby="wallet-refunds-title">
        <SectionHeading
          actionHref="/d/wallet/refunds"
          actionLabel="All refunds"
          description="Refund eligibility is a campaign outcome. This wallet shows what is claimable and what has been returned, not a claim it can execute."
          title="Refunds"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Refundable"
            icon={Undo03Icon}
            value={<Amount value={view.totals.refundable} />}
            hint="Claimable because a campaign missed its target."
          />
          <MetricCard
            label="In progress"
            icon={Wallet01Icon}
            value={<Amount value={view.totals.refundsInProgress} />}
            hint="Claimed and still being returned."
          />
          <MetricCard
            label="Refunded"
            icon={Shield01Icon}
            value={<Amount value={view.totals.refunded} />}
            hint="Confirmed as returned."
          />
        </div>
      </section>

      <section aria-labelledby="wallet-recent-title">
        <SectionHeading
          actionHref="/d/wallet/activity"
          actionLabel="All activity"
          description="Every row links back to the contribution record it came from."
          title="Recent activity"
        />
        <WalletActivityList items={recentActivity} />
      </section>

      <section aria-labelledby="wallet-capabilities-title">
        <h2
          id="wallet-capabilities-title"
          className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
        >
          Connected capabilities
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-5 text-muted">
          A capability is only marked connected when its mechanism is actually
          present in this build.
        </p>
        <div className="mt-3 rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <CapabilityList capabilities={view.capabilities} />
        </div>
      </section>
    </div>
  );
}
