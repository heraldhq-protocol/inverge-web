"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
  useWalletUI,
  useWeb3Auth,
  useWeb3AuthConnect,
} from "@web3auth/modal/react";
import { useState } from "react";

/**
 * The only security action Inverge can actually perform: open the provider's
 * wallet UI. Recovery, export and session controls are provider-owned; the page
 * must not present local buttons for them.
 */
export function WalletSecurityButton({ linked }: { linked: boolean }) {
  const { initError, isConnected, isInitialized } = useWeb3Auth();
  const {
    connect,
    error: connectError,
    loading: connecting,
  } = useWeb3AuthConnect();
  const { error: walletError, loading: opening, showWalletUI } = useWalletUI();
  const [actionFailed, setActionFailed] = useState(false);

  const error = connectError ?? walletError ?? null;

  if (initError) {
    return (
      <p className="mt-3 text-xs leading-5 text-danger" role="alert">
        Wallet services couldn&rsquo;t start. Refresh the page or sign out and
        try again.
      </p>
    );
  }

  if (!isInitialized) {
    return (
      <button
        type="button"
        disabled
        className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl bg-brand/50 px-4 text-sm font-semibold text-white"
      >
        Starting wallet services…
      </button>
    );
  }

  function handleConnect(): void {
    setActionFailed(false);
    void connect().catch(() => setActionFailed(true));
  }

  function handleOpenWallet(): void {
    setActionFailed(false);
    void showWalletUI({ show: true }).catch(() => setActionFailed(true));
  }

  const busy = connecting || opening;
  const failed = actionFailed || error !== null;

  return (
    <div className="mt-3">
      <button
        type="button"
        aria-busy={busy}
        disabled={busy}
        onClick={isConnected ? handleOpenWallet : handleConnect}
        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-60"
      >
        {busy
          ? isConnected
            ? "Opening…"
            : "Connecting…"
          : isConnected
            ? "Open wallet"
            : "Connect wallet"}
        {busy ? null : (
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={15}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        )}
      </button>
      <p className="mt-2 text-xs leading-5 text-muted">
        {isConnected
          ? linked
            ? "This wallet is linked to your Inverge account."
            : "This wallet is not linked to your Inverge account yet."
          : "Connect the embedded wallet to review its provider-hosted controls."}
      </p>
      {failed ? (
        <p className="mt-1 text-xs leading-5 text-danger" role="alert">
          Wallet services aren&rsquo;t available right now. Try again.
        </p>
      ) : null}
    </div>
  );
}
