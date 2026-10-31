import { HugeiconsIcon } from "@hugeicons/react";
import { Wallet01Icon } from "@hugeicons/core-free-icons";

import { Pill } from "@/components/ui/pill";
import { LoadingRegion } from "@/components/ui/skeleton";

/**
 * States that do not need the wallet SDK.
 *
 * They are imported by both the dynamic boundary's loading fallback and the
 * connection card, so this module must never import a provider package. Keeping
 * that rule is what stops the SDK from entering the server render or the initial
 * client bundle.
 */

export function WalletConnectionLoading() {
  return (
    <section
      aria-labelledby="wallet-connection-loading-title"
      className="rounded-3xl border border-contrast/15 bg-contrast p-5 text-white sm:p-6"
    >
      <h2 id="wallet-connection-loading-title" className="sr-only">
        Preparing your wallet
      </h2>
      <LoadingRegion label="Preparing your wallet">
        <div className="flex flex-wrap items-center gap-3">
          <span
            aria-hidden="true"
            className="size-11 rounded-2xl bg-white/10"
          />
          <div aria-hidden="true" className="space-y-2">
            <span className="block h-3.5 w-40 rounded-full bg-white/15" />
            <span className="block h-3 w-24 rounded-full bg-white/10" />
          </div>
        </div>
        <div
          aria-hidden="true"
          className="mt-6 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto]"
        >
          <div className="space-y-2.5">
            <span className="block h-3 w-28 rounded-full bg-white/10" />
            <span className="block h-9 w-44 rounded-lg bg-white/10" />
          </div>
          <div className="space-y-2.5 sm:text-right">
            <span className="block h-3 w-20 rounded-full bg-white/10 sm:ml-auto" />
            <span className="block h-9 w-32 rounded-lg bg-white/15 sm:ml-auto" />
          </div>
        </div>
      </LoadingRegion>
    </section>
  );
}

export function WalletConnectionUnavailable() {
  return (
    <section
      aria-labelledby="wallet-connection-unavailable-title"
      className="rounded-3xl border border-border bg-surface p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand-strong"
          >
            <HugeiconsIcon icon={Wallet01Icon} size={21} strokeWidth={1.7} />
          </span>
          <h2
            id="wallet-connection-unavailable-title"
            className="text-lg font-bold tracking-[-0.025em] text-ink"
          >
            Wallet connection isn&rsquo;t available
          </h2>
        </div>
        <Pill tone="neutral" size="xs">
          Unavailable
        </Pill>
      </div>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
        This environment can&rsquo;t connect a wallet right now, so no address
        or balance is shown. Your activity and refund records are still
        available below.
      </p>
    </section>
  );
}
