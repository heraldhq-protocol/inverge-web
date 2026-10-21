"use client";

import { useWeb3AuthDisconnect } from "@web3auth/modal/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { WalletSdkConfig } from "@/features/wallet/lib/provider-config";
import { resolveWalletSdkConfig } from "@/features/wallet/lib/provider-config";

/**
 * Ends both halves of a session: the provider session in this browser and the
 * Inverge cookie. The provider half is only reachable through its SDK, so this
 * page mounts the SDK briefly and then leaves.
 *
 * If the SDK is not configured, only the cookie is cleared. The page says what
 * it did rather than pretending the provider session is gone.
 */
const WalletSdkBoundary = dynamic(
  () =>
    import("@/features/wallet/components/wallet-sdk-boundary").then(
      (module) => module.WalletSdkBoundary,
    ),
  { ssr: false },
);

type SignOutState = "working" | "failed";

function SignOutStatus({
  state,
  onRetry,
}: {
  state: SignOutState;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <p aria-live="polite" className="text-sm leading-6 text-muted">
        {state === "working"
          ? "Ending your session on this device…"
          : "Your session could not be ended. Check your connection and try again."}
      </p>

      {state === "failed" && onRetry ? (
        <Button className="mt-3 w-full" onClick={onRetry} size="sm">
          Try again
        </Button>
      ) : null}
    </div>
  );
}

function SignOutController({
  disconnect,
}: {
  /** Provider sign-out, when the SDK is available. */
  disconnect?: () => Promise<unknown>;
}) {
  const router = useRouter();
  const [state, setState] = useState<SignOutState>("working");
  const attempted = useRef(false);

  const signOut = useCallback(async () => {
    setState("working");

    try {
      // The provider session is best-effort: a failed disconnect must not leave
      // the Inverge cookie behind, or the next page would still look signed in.
      if (disconnect) await disconnect().catch(() => undefined);

      const response = await fetch("/api/auth/sign-out", { method: "POST" });
      if (!response.ok) throw new Error("sign_out_failed");

      router.replace("/");
    } catch {
      setState("failed");
    }
  }, [disconnect, router]);

  useEffect(() => {
    if (attempted.current) return;

    attempted.current = true;
    void signOut();
  }, [signOut]);

  return <SignOutStatus onRetry={() => void signOut()} state={state} />;
}

function ProviderSignOut() {
  const { disconnect } = useWeb3AuthDisconnect();

  return <SignOutController disconnect={disconnect} />;
}

export function SignOutCard() {
  const config: WalletSdkConfig | null = resolveWalletSdkConfig({
    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
    network: process.env.NEXT_PUBLIC_WEB3AUTH_NETWORK,
    cluster: process.env.NEXT_PUBLIC_WALLET_NETWORK,
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
  });

  if (!config) return <SignOutController />;

  return (
    <WalletSdkBoundary config={config}>
      <ProviderSignOut />
    </WalletSdkBoundary>
  );
}
