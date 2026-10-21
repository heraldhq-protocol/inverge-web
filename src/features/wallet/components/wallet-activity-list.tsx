import { HugeiconsIcon } from "@hugeicons/react";
import { ReceiptTextIcon, Undo03Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Pill } from "@/components/ui/pill";
import { formatShortDate } from "@/features/campaigns/lib/dates";
import {
  walletActivityStatusLabels,
  walletActivityStatusTones,
  walletDirectionLabels,
} from "@/features/wallet/lib/activity";
import { formatTokenAmountWithSymbol } from "@/features/wallet/lib/token-amount";
import type { WalletActivityItem } from "@/features/wallet/types";

function ActivityRow({ item }: { item: WalletActivityItem }) {
  const isRefund = item.kind === "refund";

  const body = (
    <>
      <span
        aria-hidden="true"
        className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ${
          isRefund
            ? "bg-warning/10 text-warning-strong"
            : "bg-brand/10 text-brand-strong"
        }`}
      >
        <HugeiconsIcon
          icon={isRefund ? Undo03Icon : ReceiptTextIcon}
          size={17}
          strokeWidth={1.8}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-5 text-ink">
              {item.title}
            </span>
            <span className="mt-0.5 block text-[0.6875rem] text-muted">
              {formatShortDate(item.occurredAt)} ·{" "}
              {walletDirectionLabels[item.direction]}
            </span>
          </span>
          <span className="flex shrink-0 flex-col items-end gap-1.5">
            {item.amount ? (
              <span className="text-sm font-semibold tabular-nums text-ink">
                {formatTokenAmountWithSymbol(
                  {
                    assetId: item.amount.assetId,
                    atomic: item.amount.atomic,
                    decimals: item.amount.decimals,
                  },
                  { maxFractionDigits: 2 },
                )}
              </span>
            ) : (
              <span className="text-xs font-medium text-muted">
                No transfer
              </span>
            )}
            <Pill tone={walletActivityStatusTones[item.status]} size="xs">
              {walletActivityStatusLabels[item.status]}
            </Pill>
          </span>
        </span>
        <span className="mt-1.5 block text-xs leading-5 text-muted">
          {item.description}
        </span>
      </span>
    </>
  );

  if (item.reference.kind === "none") {
    return <div className="flex gap-3 py-3.5">{body}</div>;
  }

  return (
    <Link
      href={item.reference.href}
      className="flex gap-3 rounded-xl py-3.5 transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {body}
    </Link>
  );
}

export function WalletActivityList({
  items,
  emptyTitle = "No wallet activity yet",
  emptyDescription = "Contributions and refunds appear here once they exist. This preview has no deposits or withdrawals to show.",
}: {
  items: readonly WalletActivityItem[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-canvas p-5">
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
