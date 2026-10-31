"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowDownRight01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Copy01Icon,
  PlusSignCircleIcon,
  RefreshIcon,
  Shield01Icon,
  Tick02Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import {
  NetworkSolana,
  TokenSOL,
  TokenUSDC,
  WalletMetamask,
} from "@web3icons/react";
import { address as toSolanaAddress } from "@solana/kit";
import { useWalletSession } from "@solana/react-hooks";
import {
  useCheckout,
  useReceive,
  useWalletUI,
  useWeb3Auth,
  useWeb3AuthConnect,
} from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { authHref, SIGN_OUT_PATH } from "@/features/auth/lib/auth-routes";
import { WalletConnectionLoading } from "@/features/wallet/components/wallet-connection-states";
import { isSolanaAddress, shortenAddress } from "@/features/wallet/lib/address";
import { getUsdcMint } from "@/features/wallet/lib/networks";
import { formatTokenAmount } from "@/features/wallet/lib/token-amount";
import {
  useSplTokenBalance,
  type SplTokenBalance,
} from "@/features/wallet/lib/use-spl-token-balance";
import {
  formatUsd,
  useSolPrice,
  type SolPrice,
} from "@/features/wallet/lib/use-sol-price";
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

/**
 * The connected account address.
 *
 * `useSolanaWallet().accounts` is populated lazily by the wallet-standard
 * `connect` call, but the hook does not subscribe to that mutation. The
 * framework-kit `useWalletSession` reads the connected client store and is the
 * reactive source; the provider array remains a fallback for the moment before
 * the client session is published.
 */
function resolveOwner(
  sessionAddress: string | null,
  accounts: readonly string[] | null,
): string | null {
  if (sessionAddress && isSolanaAddress(sessionAddress)) return sessionAddress;
  return accounts?.find((candidate) => isSolanaAddress(candidate)) ?? null;
}

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

  const balance: SolanaBalance = !owner
    ? { status: "idle" }
    : !rpc
      ? { status: "unavailable" }
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
      className="grid size-14 shrink-0 place-items-center rounded-full bg-white shadow-[0_10px_30px_-14px_rgba(0,0,0,0.75)]"
    >
      <WalletMetamask size={34} variant="branded" />
    </span>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand px-2.5 py-1 text-[0.6875rem] font-semibold text-white shadow-[0_6px_18px_-8px_rgba(31,168,92,0.9)]">
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
      className="grid size-8 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-white transition-colors hover:bg-white/[0.14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <HugeiconsIcon
        icon={copied ? Tick02Icon : Copy01Icon}
        size={13}
        strokeWidth={2}
        aria-hidden="true"
      />
    </button>
  );
}

function BalanceFigure({
  balance,
  price,
  usdc,
  onRetry,
}: {
  balance: SolanaBalance;
  price: SolPrice;
  usdc: SplTokenBalance;
  onRetry?: (() => void) | undefined;
}) {
  const usdcAmount =
    usdc.status === "ready" ? Number(usdc.atomic) / 10 ** usdc.decimals : null;

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
    const sol = formatTokenAmount(
      {
        assetId: "SOL",
        atomic: balance.lamports.toString(),
        decimals: 9,
      },
      { maxFractionDigits: 4 },
    );
    const solUsd =
      price.status === "ready"
        ? (Number(balance.lamports) / 1_000_000_000) * price.usd
        : null;
    const usd = solUsd !== null ? solUsd + (usdcAmount ?? 0) : null;
    const usdcLabel =
      usdc.status === "ready"
        ? formatTokenAmount(
            {
              assetId: "USDC",
              atomic: usdc.atomic.toString(),
              decimals: usdc.decimals,
            },
            { maxFractionDigits: 2 },
          )
        : null;

    return (
      <>
        <p
          className="mt-1 text-3xl font-semibold tracking-[-0.04em] tabular-nums text-white sm:text-4xl"
          title={
            usd !== null
              ? "SOL at the live market price; USDC at $1.00"
              : undefined
          }
        >
          {usd !== null ? (
            formatUsd(usd)
          ) : (
            <>
              {sol}{" "}
              <span className="text-base font-semibold text-white/60">SOL</span>
            </>
          )}
        </p>
        <p className="mt-1 text-xs leading-5 text-white/55">
          {usd !== null ? (
            <>
              {`≈ ${sol} SOL`}
              {usdcLabel !== null
                ? ` + ${usdcLabel} USDC`
                : usdc.status === "unavailable" || usdc.status === "idle"
                  ? " · USDC unavailable"
                  : " · reading USDC…"}
              {price.stale ? " · price may be stale" : ""}
            </>
          ) : price.status === "loading" ? (
            "Reading USD price…"
          ) : (
            "USD price unavailable"
          )}
        </p>
      </>
    );
  }

  if (balance.status === "unavailable") {
    return (
      <>
        <p className="mt-1 text-2xl font-semibold text-white/80">
          Balance unavailable
        </p>
        {onRetry ? (
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
        ) : null}
      </>
    );
  }

  return (
    <p className="mt-1 text-2xl font-semibold text-white/70">
      Balance unavailable
    </p>
  );
}

function WalletAction({
  busy,
  hint,
  icon,
  label,
  onClick,
}: {
  busy: boolean;
  hint: string;
  icon: IconSvgElement;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-busy={busy}
      disabled={busy}
      onClick={onClick}
      title={hint}
      className="group flex min-h-[5.25rem] flex-col items-center justify-center gap-2 rounded-xl px-1.5 text-[0.6875rem] font-semibold text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60"
    >
      <span className="grid size-11 place-items-center rounded-2xl bg-white/[0.07] text-white/85 transition-colors group-hover:bg-white/[0.12] group-hover:text-white">
        <HugeiconsIcon
          icon={icon}
          size={19}
          strokeWidth={1.7}
          aria-hidden="true"
        />
      </span>
      {busy ? "Opening…" : label}
    </button>
  );
}

function WalletAssetsCard({
  balance,
  networkLabel,
  price,
  usdc,
}: {
  balance: SolanaBalance;
  networkLabel: string;
  price: SolPrice;
  usdc: SplTokenBalance;
}) {
  const sol =
    balance.status === "ready"
      ? `${formatTokenAmount(
          {
            assetId: "SOL",
            atomic: balance.lamports.toString(),
            decimals: 9,
          },
          { maxFractionDigits: 4 },
        )} SOL`
      : balance.status === "unavailable"
        ? "Unavailable"
        : "Reading…";
  const solUsd =
    balance.status === "ready" && price.status === "ready"
      ? (Number(balance.lamports) / 1_000_000_000) * price.usd
      : null;
  const usdcText =
    usdc.status === "ready"
      ? `${formatTokenAmount(
          {
            assetId: "USDC",
            atomic: usdc.atomic.toString(),
            decimals: usdc.decimals,
          },
          { maxFractionDigits: 2 },
        )} USDC`
      : usdc.status === "unavailable"
        ? "Unavailable"
        : "Reading…";
  const usdcUsd =
    usdc.status === "ready" ? Number(usdc.atomic) / 10 ** usdc.decimals : null;

  return (
    <section
      aria-labelledby="wallet-assets-title"
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id="wallet-assets-title"
          className="text-base font-semibold text-ink"
        >
          Assets
        </h2>
        <span className="text-xs font-medium text-muted">{networkLabel}</span>
      </div>

      <ul className="mt-3 space-y-2">
        <li className="flex items-center justify-between gap-3 rounded-xl border border-border bg-canvas/60 p-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-white ring-1 ring-border"
            >
              <TokenSOL size={30} variant="branded" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">
                Solana{" "}
                <span className="text-xs font-medium text-muted">(SOL)</span>
              </p>
              <p className="mt-0.5 text-xs tabular-nums text-muted">{sol}</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p
              className="text-lg font-bold tracking-[-0.02em] tabular-nums text-ink sm:text-xl"
              title={
                solUsd !== null
                  ? "Estimated from the live SOL price, refreshed every 30 seconds"
                  : undefined
              }
            >
              {solUsd !== null ? formatUsd(solUsd) : "—"}
            </p>
          </div>
        </li>
        <li className="flex items-center justify-between gap-3 rounded-xl border border-border bg-canvas/60 p-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-white ring-1 ring-border"
            >
              <TokenUSDC size={30} variant="branded" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">
                USD Coin{" "}
                <span className="text-xs font-medium text-muted">(USDC)</span>
              </p>
              <p className="mt-0.5 text-xs tabular-nums text-muted">
                {usdcText}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p
              className="text-lg font-bold tracking-[-0.02em] tabular-nums text-ink sm:text-xl"
              title={
                usdcUsd !== null
                  ? "USDC is valued at $1.00 for this display"
                  : undefined
              }
            >
              {usdcUsd !== null ? formatUsd(usdcUsd) : "—"}
            </p>
          </div>
        </li>
      </ul>

      <p className="mt-3 text-xs leading-5 text-muted">
        USD values are estimates, refreshed every 30 seconds; they are not a
        quote. USDC is read from the Circle-issued mint for this network and
        valued at $1.00.
      </p>
    </section>
  );
}

function WalletCardBackdrop() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_140%_at_100%_0%,rgba(52,120,84,0.38),transparent_55%)]"
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16]"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 900 220"
      >
        <path
          d="M-60 198C80 128 170 108 300 112s210 84 330 52 220-92 340-58"
          stroke="#9fe7bb"
          strokeWidth="1"
        />
        <path
          d="M-40 176C100 110 190 92 320 96s210 78 330 50 220-84 340-48"
          opacity=".8"
          stroke="#9fe7bb"
          strokeWidth=".8"
        />
        <path
          d="M-20 154C120 92 210 76 340 80s200 72 320 46 220-74 330-38"
          opacity=".65"
          stroke="#9fe7bb"
          strokeWidth=".7"
        />
        <path
          d="M-80 60C60 20 160 30 280 60s190 60 310 40 230-50 350-20"
          opacity=".45"
          stroke="#9fe7bb"
          strokeWidth=".7"
        />
      </svg>
    </>
  );
}

function WalletSafetyCard() {
  return (
    <section
      aria-labelledby="wallet-safety-title"
      className="rounded-2xl border border-brand/15 bg-brand/[0.04] p-4 sm:p-5"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-10 place-items-center rounded-full bg-brand/12 text-brand-strong"
        >
          <HugeiconsIcon icon={Shield01Icon} size={20} strokeWidth={1.8} />
        </span>
        <h2
          id="wallet-safety-title"
          className="text-base font-semibold text-ink sm:text-lg"
        >
          Keep your wallet safe
        </h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">
        Your wallet is protected by MetaMask&rsquo;s secure infrastructure.
        Never share your recovery phrase with anyone.
      </p>
      <Link
        href="/d/wallet/security"
        className="mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-full border border-brand/20 bg-white/70 px-4 text-sm font-semibold text-ink transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        View security settings
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={14}
          strokeWidth={1.9}
          aria-hidden="true"
        />
      </Link>
    </section>
  );
}

function WalletSessionWaiting() {
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setExpired(true), 8_000);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!expired) {
    return (
      <section
        aria-labelledby="wallet-preparing-title"
        className="rounded-3xl border border-border bg-surface p-5 sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-2xl bg-brand/10 text-brand-strong"
          >
            <HugeiconsIcon icon={Wallet01Icon} size={21} strokeWidth={1.7} />
          </span>
          <div className="min-w-0">
            <h2
              id="wallet-preparing-title"
              className="text-lg font-semibold tracking-[-0.025em] text-ink"
            >
              Setting up your Solana wallet.
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              This usually takes a few seconds. No address is shown until the
              provider returns one.
            </p>
          </div>
        </div>
        <p aria-live="polite" className="sr-only" role="status">
          Setting up your Solana wallet
        </p>
      </section>
    );
  }

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
          We couldn&rsquo;t find a Solana wallet for this sign-in.
        </h2>
      </div>
      <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
        Your Inverge session is active, but this sign-in method didn&rsquo;t
        return a Solana wallet. Sign out, then sign in again with Google, email,
        or a Solana wallet.
      </p>
      <Link
        href={SIGN_OUT_PATH}
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
      >
        Sign out and try again
      </Link>
    </section>
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
  const { accounts, rpc } = useSolanaWallet();
  const session = useWalletSession();
  const {
    error: checkoutError,
    loading: checkoutLoading,
    showCheckout,
  } = useCheckout();
  const {
    error: receiveError,
    loading: receiveLoading,
    showReceive,
  } = useReceive();
  const {
    error: walletUiError,
    loading: walletUiLoading,
    showWalletUI,
  } = useWalletUI();
  const price = useSolPrice();

  const owner = resolveOwner(
    session?.account.address.toString() ?? null,
    accounts,
  );
  const { balance, retry } = useSolanaBalance(rpc, owner);
  const usdc = useSplTokenBalance(rpc, owner, getUsdcMint(account.network));
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [actionFailed, setActionFailed] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const busy = connecting;

  function handleConnect(): void {
    // The provider hook reports failures through `error`; catching here keeps a
    // declined sign-in from becoming an unhandled rejection.
    void connect().catch(() => undefined);
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

  function runWalletAction(action: () => Promise<void>): void {
    setActionFailed(false);
    void action().catch(() => setActionFailed(true));
  }

  function openReceive(): void {
    runWalletAction(() => showReceive({ show: true }));
  }

  function openSend(): void {
    runWalletAction(() => showWalletUI({ show: true, path: "send" }));
  }

  function openAddFunds(): void {
    runWalletAction(() =>
      showCheckout({
        show: true,
        tokenList: ["SOL"],
        fiatList: ["USD", "NGN", "KES"],
      }),
    );
  }

  const actionError =
    actionFailed || Boolean(receiveError || walletUiError || checkoutError);

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

  if (!owner) return <WalletSessionWaiting />;

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
          account is linked to {shortenAddress(linkedAddress)}. Sign out, then
          sign in with the wallet linked to your account.
        </p>
        <Link
          href={SIGN_OUT_PATH}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
        >
          Sign out and try again
        </Link>
      </section>
    );
  }

  const linked = account.provisioning === "ready" && linkedAddress === owner;
  const walletName =
    account.provider.label === "MetaMask Embedded Wallets"
      ? "MetaMask Wallet"
      : account.provider.label;

  return (
    <div className="space-y-4">
      <section
        aria-labelledby="wallet-card-title"
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[linear-gradient(105deg,#061b12_0%,#0a281b_42%,#0e3322_72%,#1b4a32_100%)] p-5 text-white shadow-[0_24px_60px_-40px_rgba(6,27,18,0.85)] sm:p-6"
      >
        <WalletCardBackdrop />
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)_minmax(0,0.95fr)] lg:gap-0 lg:divide-x lg:divide-white/10">
          <div className="min-w-0 lg:flex lg:flex-col lg:justify-center lg:pr-6">
            <div className="flex items-start gap-3.5">
              <WalletMark />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="wallet-card-title"
                    className="truncate text-lg font-semibold tracking-[-0.02em] text-white sm:text-xl"
                    title={account.provider.label}
                  >
                    {walletName}
                  </h2>
                  <StatusBadge label="Connected" />
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-white/60">
                  <span aria-hidden="true" className="shrink-0">
                    <NetworkSolana size={14} variant="branded" />
                  </span>
                  {networkLabel}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 p-1 pl-3">
                <span
                  className="font-mono text-xs font-medium text-white/80"
                  title={owner}
                >
                  {shortenAddress(owner)}
                </span>
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
                <summary className="inline-flex cursor-pointer list-none items-center text-[0.6875rem] font-medium text-white/45 underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Full address
                </summary>
                <code className="mt-1 block max-w-full break-all font-mono text-[0.6875rem] leading-5 text-white/60">
                  {owner}
                </code>
              </details>
              <p className="mt-2 text-[0.6875rem] leading-5 text-white/45">
                {linked
                  ? "Linked to your Inverge account."
                  : "Not linked to your Inverge account yet."}
              </p>
            </div>
          </div>

          <div className="min-w-0 lg:flex lg:flex-col lg:justify-center lg:px-6">
            <p className="text-xs font-medium text-white/50">Total balance</p>
            <BalanceFigure
              balance={balance}
              price={price}
              usdc={usdc}
              onRetry={rpc ? retry : undefined}
            />
            <p className="mt-2 text-[0.6875rem] leading-5 text-white/50">
              {price.status === "ready"
                ? price.stale
                  ? `Live from ${networkLabel} · price may be stale`
                  : `Live from ${networkLabel} · USD estimate via CoinGecko`
                : `Live from ${networkLabel} · USD price unavailable`}
            </p>
          </div>

          <div className="min-w-0 lg:flex lg:flex-col lg:justify-center lg:pl-6">
            <div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-black/15 p-2">
              <WalletAction
                busy={receiveLoading}
                hint="Open the wallet receive options"
                icon={ArrowUp01Icon}
                label="Receive"
                onClick={openReceive}
              />
              <WalletAction
                busy={walletUiLoading}
                hint="Open the wallet send options"
                icon={ArrowDownRight01Icon}
                label="Send"
                onClick={openSend}
              />
              <WalletAction
                busy={checkoutLoading}
                hint="Add funds with bank transfer or P2P where available"
                icon={PlusSignCircleIcon}
                label="Add funds"
                onClick={openAddFunds}
              />
            </div>
            <p className="mt-2 text-center text-[0.625rem] leading-4 text-white/45">
              Bank transfer or P2P where available.
            </p>
            {actionError ? (
              <p
                className="mt-1 text-center text-[0.625rem] leading-4 text-danger"
                role="alert"
              >
                Wallet services aren&rsquo;t available right now. Try again.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start">
        <WalletAssetsCard
          balance={balance}
          networkLabel={networkLabel}
          price={price}
          usdc={usdc}
        />
        <WalletSafetyCard />
      </div>
    </div>
  );
}
