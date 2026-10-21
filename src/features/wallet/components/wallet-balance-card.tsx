import { HugeiconsIcon } from "@hugeicons/react";
import { Coins01Icon } from "@hugeicons/core-free-icons";

import { Pill } from "@/components/ui/pill";
import { getWalletAsset } from "@/features/wallet/lib/networks";
import {
  formatTokenAmount,
  type TokenAmount,
} from "@/features/wallet/lib/token-amount";
import type { WalletBalance } from "@/features/wallet/types";

/**
 * One balance.
 *
 * A sample figure is labelled as a sample on the card itself, not only in a
 * page-level notice. Someone screenshotting the card still sees that it is not a
 * chain read.
 */

function balanceAmount(balance: WalletBalance): TokenAmount {
  return {
    assetId: balance.assetId,
    atomic: balance.atomic,
    decimals: balance.decimals,
  };
}

export function WalletBalanceCard({ balance }: { balance: WalletBalance }) {
  const asset = getWalletAsset(balance.assetId);
  const amount = balanceAmount(balance);
  const maxFractionDigits = balance.decimals >= 6 ? 2 : 4;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-lg bg-brand/10 text-brand-strong"
          >
            <HugeiconsIcon icon={Coins01Icon} size={16} strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-xs font-medium text-muted">{asset.name}</p>
            <p className="text-[0.6875rem] text-muted/80">{asset.id}</p>
          </div>
        </div>
        {balance.sample ? (
          <Pill tone="neutral" size="xs">
            Sample balance
          </Pill>
        ) : null}
      </div>

      <p className="mt-3 text-2xl font-bold tracking-[-0.035em] tabular-nums text-ink">
        {formatTokenAmount(amount, { maxFractionDigits })}{" "}
        <span className="text-sm font-semibold text-muted">{asset.symbol}</span>
      </p>

      <p className="mt-1.5 text-xs leading-5 text-muted">
        {balance.sample
          ? "Illustrative figure for the preview. It is not read from a wallet or a chain."
          : "Balance read from the configured network."}
      </p>
    </div>
  );
}

export function WalletBalanceGrid({
  balances,
}: {
  balances: readonly WalletBalance[];
}) {
  if (balances.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-canvas p-4 text-sm leading-6 text-muted">
        No balance can be shown because no wallet account exists.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {balances.map((balance) => (
        <WalletBalanceCard key={balance.assetId} balance={balance} />
      ))}
    </div>
  );
}
