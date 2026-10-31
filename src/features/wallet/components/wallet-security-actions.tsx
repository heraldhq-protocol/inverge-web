"use client";

import dynamic from "next/dynamic";

import type { WalletSdkConfig } from "@/features/wallet/lib/provider-config";
import { resolveWalletSdkConfig } from "@/features/wallet/lib/provider-config";

/**
 * Wallet Services boundary for the security page.
 *
 * The security page is a server component, but managing the embedded wallet is
 * a browser-only provider action. This module resolves the public SDK config,
 * then loads the provider tree after mount so `@web3auth/modal` never enters the
 * server render or the initial bundle.
 */
const WalletSecurityBoundary = dynamic(
  () =>
    import("@/features/wallet/components/wallet-security-boundary").then(
      (module) => module.WalletSecurityBoundary,
    ),
  {
    loading: () => (
      <p className="mt-3 text-xs leading-5 text-muted" role="status">
        Starting wallet services…
      </p>
    ),
    ssr: false,
  },
);

export function WalletSecurityActions({ linked }: { linked: boolean }) {
  const config: WalletSdkConfig | null = resolveWalletSdkConfig({
    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
    network: process.env.NEXT_PUBLIC_WEB3AUTH_NETWORK,
    cluster: process.env.NEXT_PUBLIC_WALLET_NETWORK,
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
  });

  if (!config) {
    return (
      <div
        role="status"
        className="mt-3 rounded-xl border border-border bg-surface/70 px-3 py-2.5"
      >
        <p className="text-xs font-semibold text-ink">
          Wallet services unavailable
        </p>
        <p className="mt-0.5 text-xs leading-5 text-muted">
          This environment has no embedded-wallet provider configured. Contact
          support if you expected to manage a wallet here.
        </p>
      </div>
    );
  }

  return <WalletSecurityBoundary config={config} linked={linked} />;
}
