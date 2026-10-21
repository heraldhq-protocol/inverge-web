"use client";

import dynamic from "next/dynamic";

import { WalletAuthLoading } from "@/features/wallet/components/wallet-auth-loading";
import { WalletAuthUnavailable } from "@/features/wallet/components/wallet-auth-unavailable";
import type { WalletSdkConfig } from "@/features/wallet/lib/provider-config";
import { resolveWalletSdkConfig } from "@/features/wallet/lib/provider-config";

/**
 * Wallet sign-in boundary.
 *
 * The provider tree is a frontend-only SDK, so it is loaded after mount and
 * never during SSR. When no Client ID is present the card explains the gap
 * instead of initialising a provider that cannot provision anything.
 */
const WalletSdkBoundary = dynamic(
  () =>
    import("@/features/wallet/components/wallet-sdk-boundary").then(
      (module) => module.WalletSdkBoundary,
    ),
  { loading: () => <WalletAuthLoading />, ssr: false },
);

export function WalletAuthPanel() {
  const config: WalletSdkConfig | null = resolveWalletSdkConfig({
    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
    network: process.env.NEXT_PUBLIC_WEB3AUTH_NETWORK,
    cluster: process.env.NEXT_PUBLIC_WALLET_NETWORK,
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
  });

  if (!config) return <WalletAuthUnavailable />;

  return <WalletSdkBoundary config={config} />;
}
