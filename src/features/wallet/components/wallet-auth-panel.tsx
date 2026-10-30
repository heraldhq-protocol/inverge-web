"use client";

import dynamic from "next/dynamic";

import {
  WalletConnectionLoading,
  WalletConnectionUnavailable,
} from "@/features/wallet/components/wallet-connection-states";
import type { WalletSdkConfig } from "@/features/wallet/lib/provider-config";
import { resolveWalletSdkConfig } from "@/features/wallet/lib/provider-config";
import type { WalletAccount } from "@/features/wallet/types";

/**
 * Wallet connection boundary.
 *
 * The provider tree is a frontend-only SDK, so it is loaded after mount and
 * never during SSR. When no Client ID is present the card explains the gap
 * instead of initialising a provider that cannot provision anything.
 *
 * Nothing here calls `connect()`. The provider mounts, restores an existing
 * session silently if one exists, and waits for the user to continue.
 */
const WalletConnectionBoundary = dynamic(
  () =>
    import("@/features/wallet/components/wallet-connection-boundary").then(
      (module) => module.WalletConnectionBoundary,
    ),
  { loading: () => <WalletConnectionLoading />, ssr: false },
);

export function WalletAuthPanel({
  account,
  authenticated,
  networkLabel,
}: {
  account: WalletAccount;
  authenticated: boolean;
  networkLabel: string;
}) {
  const config: WalletSdkConfig | null = resolveWalletSdkConfig({
    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
    network: process.env.NEXT_PUBLIC_WEB3AUTH_NETWORK,
    cluster: process.env.NEXT_PUBLIC_WALLET_NETWORK,
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
  });

  if (!config) return <WalletConnectionUnavailable />;

  return (
    <WalletConnectionBoundary
      account={account}
      authenticated={authenticated}
      config={config}
      networkLabel={networkLabel}
    />
  );
}
