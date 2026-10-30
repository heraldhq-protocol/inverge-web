"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Copy01Icon,
  RefreshIcon,
  Tick02Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import { address as toSolanaAddress } from "@solana/kit";
import {
  useWeb3Auth,
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
} from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { authHref } from "@/features/auth/lib/auth-routes";
import { WalletConnectionLoading } from "@/features/wallet/components/wallet-connection-states";
import { isSolanaAddress, shortenAddress } from "@/features/wallet/lib/address";
import { formatTokenAmount } from "@/features/wallet/lib/token-amount";
import type { WalletAccount } from "@/features/wallet/types";

/**
 * The wallet connection card.
 *
 * The SDK is the only source of truth for whether a provider session exists and
 * which address it returned. The server projection (`account`) is the only
 * source of truth for whether that address is linked to an Inverge account.
 * Neither is inferred from the other, and `connect()` runs only from the
 * explicit button — never on mount.
 *
 * A balance is read only when the provider has returned a validated address.
 * If the read fails the card says so; it never renders `0` in place of an
 * unknown figure.
 */

type SolanaBalance =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; lamports: bigint }
  | { status: "unavailable" };

function useSolanaBalance(
  rpc: ReturnType<typeof useSolanaWallet>["rpc"],
  owner: string | null,
): {
  balance: SolanaBalance;
  retry: () => void;
} {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    balance: SolanaBalance;
  } | null>(null);
  const key = owner ? `${owner}:${attempt}` : null;

  useEffect(() => {
    if (!rpc || !owner || key === null) return;

    let cancelled = false;

    void Promise.resolve()
      .then(() => rpc.getBalance(toSolanaAddress(owner)).send())
      .then(({ value }) => {
        if (!cancelled) {
          setResult({ balance: { lamports: value, status: "ready" }, key });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ balance: { status: "unavailable" }, key });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt, key, owner, rpc]);

  const balance: SolanaBalance =
    !rpc || !owner
      ? { status: "idle" }
      : result?.key === key
        ? result.balance
        : { status: "loading" };

  return {
    balance,
    retry: () => setAttempt((current) => current + 1),
  };
}

function WalletMark() {
  return (
    <span
      aria-hidden="true"
      className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.08] text-white"
    >
      <HugeiconsIcon icon={Wallet01Icon} size={21} strokeWidth={1.7} />
    </span>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.08] px-2.5 py-1 text-[0.6875rem] font-semibold text-white">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
      {label}
    </span>
  );
}

function CopyAddressButton({
  copied,
  onCopy,
}: {
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "Wallet address copied" : "Copy wallet address"}
      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <HugeiconsIcon
        icon={copied ? Tick02Icon : Copy01Icon}
        size={14}
        strokeWidth={1.9}
        aria-hidden="true"
      />
      <span aria-hidden="true">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

function BalanceFigure({
  balance,
  networkLabel,
  onRetry,
}: {
  balance: SolanaBalance;
  networkLabel: string;
  onRetry: () => void;
}) {
  if (balance.status === "loading" || balance.status === "idle") {
    return (
      <div aria-label="Reading balance" role="status">
        <span className="sr-only">Reading balance</span>
        <span
          aria-hidden="true"
          className="mt-2 block h-8 w-32 rounded-lg bg-white/10"
        />
      </div>
    );
  }

  if (balance.status === "ready") {
    return (
      <>
        <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] tabular-nums text-white sm:text-4xl">
          {formatTokenAmount(
            {
              assetId: "SOL",
              atomic: balance.lamports.toString(),
              decimals: 9,
            },
            { maxFractionDigits: 4 },
          )}{" "}
          <span className="text-base font-semibold text-white/60">SOL</span>
        </p>
        <p className="mt-1 text-xs text-white/55">Read from {networkLabel}</p>
      </>
    );
  }

  if (balance.status === "unavailable") {
    return (
      <>
        <p className="mt-1 text-2xl font-semibold text-white/80">
          Balance unavailable
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg text-xs font-semibold text-white/75 underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <HugeiconsIcon
            icon={RefreshIcon}
            size={14}
            strokeWidth={1.9}
            aria-hidden="true"
          />
          Try again
        </button>
      </>
    );
  }

  return (
    <p className="mt-1 text-2xl font-semibold text-white/70">
      Balance unavailable
    </p>
  );
}

export function WalletConnectionCard({
  account,
  authenticated,
  networkLabel,
}: {
  account: WalletAccount;
  authenticated: boolean;
  networkLabel: string;
}) {
  const { initError, isConnected, isInitialized, isInitializing } =
    useWeb3Auth();
  const {
    connect,
    error: connectError,
    loading: connecting,
  } = useWeb3AuthConnect();
  const {
    disconnect,
    error: disconnectError,
    loading: disconnecting,
  } = useWeb3AuthDisconnect();
  const { accounts, rpc } = useSolanaWallet();

  const owner =
    accounts?.find((candidate) => isSolanaAddress(candidate)) ?? null;
  const { balance, retry } = useSolanaBalance(rpc, owner);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const busy = connecting || disconnecting;

  function handleConnect(): void {
    // The provider hook reports failures through `error`; catching here keeps a
    // declined sign-in from becoming an unhandled rejection.
    void connect().catch(() => undefined);
  }

  function handleDisconnect(): void {
    void disconnect().catch(() => undefined);
  }

  async function handleCopy(): Promise<void> {
    if (!owner) return;

    try {
      await navigator.clipboard.writeText(owner);
      setCopyFailed(false);
      setCopied(true);
    } catch {
      setCopied(false);
      setCopyFailed(true);
    }
  }

  if (initError) {
    return (
      <section
        role="alert"
        aria-labelledby="wallet-connection-error-title"
        className="rounded-3xl border border-danger/25 bg-surface p-5 sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-2xl bg-danger/10 text-danger"
          >
            <HugeiconsIcon icon={Alert02Icon} size={21} strokeWidth={1.8} />
          </span>
          <h2
            id="wallet-connection-error-title"
            className="text-lg font-semibold tracking-[-0.025em] text-ink"
          >
            We couldn&rsquo;t start the wallet connection.
          </h2>
        </div>
        <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
          No address or balance can be shown right now. Reload the page to try
          again.
        </p>
        <Button
          className="mt-4"
          onClick={() => window.location.reload()}
          size="sm"
          variant="secondary"
        >
          Reload page
        </Button>
      </section>
    );
  }

  if (isInitializing || !isInitialized) return <WalletConnectionLoading />;

  if (!authenticated) {
    return (
      <section
        aria-labelledby="wallet-signed-out-title"
        className="rounded-3xl border border-border bg-surface p-5 sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-2xl bg-brand/10 text-brand-strong"
          >
            <HugeiconsIcon icon={Wallet01Icon} size={21} strokeWidth={1.7} />
          </span>
          <h2
            id="wallet-signed-out-title"
            className="text-xl font-semibold tracking-[-0.03em] text-ink"
          >
            Your wallet starts here.
          </h2>
        </div>
        <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
          Sign in to access your Inverge wallet.
        </p>
        <Link
          href={authHref("/d/wallet")}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
        >
          Sign in
        </Link>
      </section>
    );
  }

  if (!isConnected) {
    return (
      <section
        aria-labelledby="wallet-not-ready-title"
        className="rounded-3xl border border-border bg-surface p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-2xl bg-brand/10 text-brand-strong"
          >
            <HugeiconsIcon icon={Wallet01Icon} size={21} strokeWidth={1.7} />
          </span>
          <div className="min-w-0">
            <h2
              id="wallet-not-ready-title"
              className="text-xl font-semibold tracking-[-0.03em] text-ink"
            >
              Your wallet isn&rsquo;t ready yet.
            </h2>
          </div>
        </div>
        <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
          Your account is signed in, but no wallet address is available yet.
        </p>
        <Button
          aria-busy={connecting}
          className="mt-4"
          disabled={busy}
          onClick={handleConnect}
          size="sm"
        >
          {connecting ? "Connecting…" : "Connect wallet"}
        </Button>
        <p className="mt-2 text-xs leading-5 text-muted">
          You&rsquo;ll choose a sign-in method once. Nothing opens until you
          continue.
        </p>
        {connectError ? (
          <p className="mt-2 text-xs leading-5 text-danger" role="alert">
            We couldn&rsquo;t connect your wallet. Please try again.
          </p>
        ) : null}
      </section>
    );
  }

  if (!owner) {
    return (
      <section
        aria-labelledby="wallet-no-account-title"
        className="rounded-3xl border border-warning/30 bg-warning/[0.06] p-5 sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-2xl bg-warning/10 text-warning-strong"
          >
            <HugeiconsIcon icon={Alert02Icon} size={21} strokeWidth={1.8} />
          </span>
          <h2
            id="wallet-no-account-title"
            className="text-lg font-semibold tracking-[-0.025em] text-ink"
          >
            We couldn&rsquo;t find a Solana wallet.
          </h2>
        </div>
        <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
          You&rsquo;re connected to the provider, but it didn&rsquo;t return a
          Solana address. Disconnect and connect again with the same method.
        </p>
        <Button
          className="mt-4"
          disabled={busy}
          onClick={handleDisconnect}
          size="sm"
          variant="secondary"
        >
          {disconnecting ? "Disconnecting…" : "Disconnect wallet"}
        </Button>
      </section>
    );
  }

  const linkedAddress = account.address;

  if (linkedAddress !== null && linkedAddress !== owner) {
    return (
      <section
        role="alert"
        aria-labelledby="wallet-mismatch-title"
        className="rounded-3xl border border-danger/25 bg-surface p-5 sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-2xl bg-danger/10 text-danger"
          >
            <HugeiconsIcon icon={Alert02Icon} size={21} strokeWidth={1.8} />
          </span>
          <h2
            id="wallet-mismatch-title"
            className="text-lg font-semibold tracking-[-0.025em] text-ink"
          >
            This wallet doesn&rsquo;t match your account.
          </h2>
        </div>
        <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
          This device is connected to {shortenAddress(owner)}, but your Inverge
          account is linked to {shortenAddress(linkedAddress)}. Disconnect and
          connect with the wallet linked to your account.
        </p>
        <Button
          className="mt-4"
          disabled={busy}
          onClick={handleDisconnect}
          size="sm"
          variant="secondary"
        >
          {disconnecting ? "Disconnecting…" : "Disconnect wallet"}
        </Button>
      </section>
    );
  }

  const linked = account.provisioning === "ready" && linkedAddress === owner;

  return (
    <section
      aria-labelledby="wallet-card-title"
      className="rounded-3xl border border-contrast/20 bg-contrast p-5 text-white shadow-[0_20px_50px_-36px_rgba(13,29,21,0.5)] sm:p-6"
    >
      <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <WalletMark />
            <div className="min-w-0">
              <h2
                id="wallet-card-title"
                className="truncate text-base font-semibold text-white"
              >
                {account.provider.label}
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/55">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-brand"
                />
                {networkLabel}
              </p>
            </div>
            <StatusBadge label="Connected" />
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium text-white/50">Address</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <p
                className="font-mono text-sm font-medium text-white"
                title={owner}
              >
                {shortenAddress(owner)}
              </p>
              <CopyAddressButton
                copied={copied}
                onCopy={() => void handleCopy()}
              />
            </div>
            <p aria-live="polite" className="mt-1 min-h-4 text-[0.6875rem]">
              {copied ? (
                <span className="text-white/60">Address copied.</span>
              ) : copyFailed ? (
                <span className="text-danger">
                  Copy failed. Open the full address and copy it manually.
                </span>
              ) : null}
            </p>
            <details className="group mt-0.5">
              <summary className="inline-flex cursor-pointer list-none items-center text-xs font-medium text-white/55 underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                Full address
              </summary>
              <code className="mt-1 block max-w-full break-all font-mono text-[0.6875rem] leading-5 text-white/60">
                {owner}
              </code>
            </details>
          </div>
        </div>

        <div className="min-w-0 sm:text-right">
          <p className="text-xs font-medium text-white/50">Balance</p>
          <BalanceFigure
            balance={balance}
            networkLabel={networkLabel}
            onRetry={retry}
          />
          <p className="mt-2 text-[0.6875rem] leading-5 text-white/55">
            USDC isn&rsquo;t available here yet.
          </p>
        </div>
      </div>

      <div className="relative mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-white/10 pt-3.5 text-xs text-white/55">
        <p>
          {linked
            ? "Linked to your Inverge account."
            : "This address is on this device and isn’t linked to your Inverge account yet."}
        </p>
        <button
          type="button"
          onClick={handleDisconnect}
          disabled={busy}
          className="min-h-9 rounded-lg font-semibold text-white/70 underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50"
        >
          {disconnecting ? "Disconnecting…" : "Disconnect wallet"}
        </button>
      </div>

      {disconnectError ? (
        <p className="relative mt-1 text-xs text-danger" role="alert">
          Disconnecting failed. Please try again.
        </p>
      ) : null}
    </section>
  );
}
