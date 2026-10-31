import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  ReceiptTextIcon,
  Undo03Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Pill } from "@/components/ui/pill";
import { formatShortDate } from "@/features/campaigns/lib/dates";
import {
  walletActivityStatusLabels,
  walletActivityStatusTones,
} from "@/features/wallet/lib/activity";
import { formatTokenAmountWithSymbol } from "@/features/wallet/lib/token-amount";
import type { WalletActivityItem } from "@/features/wallet/types";

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  hour12: true,
  minute: "2-digit",
  timeZone: "UTC",
});

function formatActivityTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return `${formatShortDate(iso)} · ${timeFormatter.format(date)}`;
}

function amountPrefix(item: WalletActivityItem): string {
  if (!item.amount || item.status === "failed") return "";
  if (item.direction === "out") return "−";
  if (item.direction === "in") return "+";
  return "";
}

function ActivityRow({ item }: { item: WalletActivityItem }) {
  const isRefund = item.kind === "refund";
  const isLink = item.reference.kind !== "none";

  const content = (
    <>
      <span
        aria-hidden="true"
        className={`grid size-10 shrink-0 place-items-center rounded-full ${
          isRefund
            ? "bg-warning/12 text-warning-strong"
            : "bg-brand/10 text-brand-strong"
        }`}
      >
        <HugeiconsIcon
          icon={isRefund ? Undo03Icon : ReceiptTextIcon}
          size={18}
          strokeWidth={1.8}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0 text-sm font-semibold leading-5 text-ink">
            {item.title}
          </span>
          <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
            {item.amount ? (
              <>
                {amountPrefix(item)}
                {formatTokenAmountWithSymbol(
                  {
                    assetId: item.amount.assetId,
                    atomic: item.amount.atomic,
                    decimals: item.amount.decimals,
                  },
                  { maxFractionDigits: 2 },
                )}
              </>
            ) : (
              <span className="text-xs font-medium text-muted">
                No transfer
              </span>
            )}
          </span>
        </span>

        <span className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[0.6875rem] text-muted">
            {formatActivityTimestamp(item.occurredAt)}
          </span>
          <Pill tone={walletActivityStatusTones[item.status]} size="xs">
            {walletActivityStatusLabels[item.status]}
          </Pill>
        </span>
      </span>

      {isLink ? (
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={15}
          strokeWidth={1.9}
          aria-hidden="true"
          className="mt-1 hidden shrink-0 text-muted sm:block"
        />
      ) : null}
    </>
  );

  if (item.reference.kind === "none") {
    return <div className="flex gap-3 py-4">{content}</div>;
  }

  return (
    <Link
      href={item.reference.href}
      className="-mx-2 flex gap-3 rounded-xl px-2 py-4 transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {content}
    </Link>
  );
}

export function WalletActivityList({
  items,
  emptyTitle = "No activity yet",
  emptyDescription = "Contributions and refunds appear here once they exist.",
}: {
  items: readonly WalletActivityItem[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-sm font-semibold text-ink">{emptyTitle}</p>
        <p className="mt-1 text-sm leading-6 text-muted">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((item) => (
        <li key={item.id}>
          <ActivityRow item={item} />
        </li>
      ))}
    </ul>
  );
}
