"use client";

import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
} from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";

import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { isSolanaAddress, shortenAddress } from "@/features/wallet/lib/address";

/**
 * Sign in, show the provider's address, and stop there.
 *
 * The address is displayed because the provider returned it, and it is labelled
 * as device-only: it is not linked to an Inverge account, so no balance,
 * contribution, or refund on this page reads from it. Signing is deliberately
 * absent — this card cannot move money.
 */
export function ConnectedWalletAuth() {
  const {
    connect,
    error: connectError,
    isConnected,
    loading: connecting,
  } = useWeb3AuthConnect();
  const {
    disconnect,
    error: disconnectError,
    loading: disconnecting,
  } = useWeb3AuthDisconnect();
  const { accounts } = useSolanaWallet();

  const address = accounts?.find((account) => isSolanaAddress(account)) ?? null;
  const busy = connecting || disconnecting;

  function handleConnect(): void {
    // The hook exposes failures through `error`; the rejection is caught here so
    // a declined sign-in cannot surface as an unhandled promise.
    void connect().catch(() => undefined);
  }

  function handleDisconnect(): void {
    void disconnect().catch(() => undefined);
  }

  return (
    <section
      aria-labelledby="wallet-signin-title"
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="wallet-signin-title"
          className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
        >
          Wallet sign-in
        </h2>
        <Pill tone={isConnected ? "accent" : "neutral"} size="xs">
          {isConnected ? "Signed in" : "Not signed in"}
        </Pill>
      </div>

      {isConnected ? (
        <div className="mt-3 space-y-3">
          {address ? (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm text-muted">Public address</span>
                <span
                  className="font-mono text-sm font-medium text-ink"
                  title={address}
                >
                  {shortenAddress(address)}
                </span>
              </div>
              <p className="rounded-xl border border-border bg-canvas p-3 text-xs leading-5 text-muted">
                This is your provider&rsquo;s address on this device. It is not
                linked to your Inverge account yet, so the balances, activity,
                and refunds on this page are still labelled preview data.
              </p>
            </>
          ) : (
            <p className="rounded-xl border border-warning/30 bg-warning/[0.07] p-3 text-xs leading-5 text-ink">
              Signed in, but this connection has no Solana account yet.
              Disconnect and sign in again with the same method you used before.
            </p>
          )}

          <Button
            disabled={busy}
            onClick={handleDisconnect}
            size="sm"
            variant="secondary"
          >
            {disconnecting ? "Disconnecting…" : "Disconnect"}
          </Button>

          {disconnectError ? (
            <p className="text-xs leading-5 text-danger">
              Disconnecting failed. Try again.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="max-w-2xl text-sm leading-6 text-muted">
            Create or recover your embedded Solana wallet. Use the same sign-in
            method every time &mdash; a different method produces a different
            wallet address.
          </p>

          <Button disabled={busy} onClick={handleConnect} size="sm">
            {connecting ? "Connecting…" : "Sign in to your wallet"}
          </Button>

          {connectError ? (
            <p className="text-xs leading-5 text-danger">
              Sign-in could not be completed. Try again.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
