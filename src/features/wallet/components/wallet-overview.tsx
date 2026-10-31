import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  HandCoinsIcon,
  ReceiptTextIcon,
  Shield01Icon,
  Undo03Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Pill } from "@/components/ui/pill";
import { WalletActivityList } from "@/features/wallet/components/wallet-activity-list";
import { WalletAuthPanel } from "@/features/wallet/components/wallet-auth-panel";
import { getWalletNetwork } from "@/features/wallet/lib/networks";
import type { WalletView } from "@/features/wallet/types";

/**
 * Wallet overview.
 *
 * The page answers three questions in order: what is my wallet doing, what can
 * I do next, and what has already happened. Technical capability audits and
 * sample balances live in the data layer, not on this screen. Every record that
 * is still preview data is labelled once, at the section it belongs to.
 */

function QuickAction({
  description,
  href,
  icon,
  label,
}: {
  description: string;
  href: string;
  icon: IconSvgElement;
  label: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex min-h-14 items-center gap-3 rounded-xl px-1.5 py-2 transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand-strong"
        >
          <HugeiconsIcon icon={icon} size={18} strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">{label}</span>
          <span className="mt-0.5 block text-xs leading-5 text-muted">
            {description}
          </span>
        </span>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={15}
          strokeWidth={1.9}
          aria-hidden="true"
          className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </li>
  );
}

export function WalletOverview({
  authenticated,
  view,
}: {
  authenticated: boolean;
  view: WalletView;
}) {
  const network = getWalletNetwork(view.account.network);
  const networkLabel = `${network.label.split(" ")[0]} • ${network.shortLabel}`;
  const recentActivity = view.activity.slice(0, 4);
  const preview = view.dataSource === "preview";

  return (
    <div className="space-y-5 sm:space-y-6">
      <WalletAuthPanel
        account={view.account}
        authenticated={authenticated}
        networkLabel={networkLabel}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start">
        <section
          aria-labelledby="wallet-recent-title"
          className="order-2 lg:order-1"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="wallet-recent-title"
                className="text-base font-semibold text-ink"
              >
                Recent activity
              </h2>
              {preview ? (
                <Pill tone="neutral" size="xs">
                  Example data
                </Pill>
              ) : null}
            </div>
            <Link
              href="/d/wallet/activity"
              className="inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              View all
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={14}
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </Link>
          </div>

          {preview ? (
            <p className="mt-1 text-xs leading-5 text-muted">
              Sample contributions and refunds until live wallet activity is
              connected.
            </p>
          ) : null}

          <div className="mt-2.5">
            {recentActivity.length > 0 ? (
              <div className="rounded-2xl border border-border bg-surface px-4 sm:px-5">
                <WalletActivityList items={recentActivity} />
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-5">
                <p className="text-sm font-semibold text-ink">
                  No activity yet
                </p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Contributions and refunds appear here once they exist.
                </p>
                <Link
                  href="/campaigns"
                  className="mt-3 inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Explore campaigns
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={14}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                </Link>
              </div>
            )}
          </div>
        </section>

        <aside
          aria-labelledby="wallet-actions-title"
          className="order-1 rounded-2xl border border-border bg-surface p-4 sm:p-5 lg:order-2"
        >
          <h2
            id="wallet-actions-title"
            className="text-base font-semibold text-ink"
          >
            Quick actions
          </h2>
          <ul className="mt-1.5 divide-y divide-border">
            <QuickAction
              description="Support a creator you believe in."
              href="/campaigns"
              icon={HandCoinsIcon}
              label="Back a campaign"
            />
            <QuickAction
              description="See every contribution and refund."
              href="/d/wallet/activity"
              icon={ReceiptTextIcon}
              label="View activity"
            />
            <QuickAction
              description="Check what is eligible and in progress."
              href="/d/wallet/refunds"
              icon={Undo03Icon}
              label="Refunds"
            />
          </ul>

          <Link
            href="/d/wallet/security"
            className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg text-xs font-semibold text-muted underline-offset-4 transition-colors hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={Shield01Icon}
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            Wallet security
          </Link>
        </aside>
      </div>

      <section className="overflow-hidden rounded-2xl border border-brand/15 bg-brand/[0.06] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="text-base font-semibold text-ink">
              Your wallet, your growth
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Support ideas, back campaigns and be part of something bigger.
            </p>
          </div>
          <Link
            href="/campaigns"
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
          >
            Explore campaigns
          </Link>
        </div>
      </section>
    </div>
  );
}
