"use client";

import { WalletConnectionCard } from "@/features/wallet/components/wallet-connection-card";
import { WalletSdkBoundary } from "@/features/wallet/components/wallet-sdk-boundary";
import type { WalletSdkConfig } from "@/features/wallet/lib/provider-config";
import type { WalletAccount } from "@/features/wallet/types";

/**
 * The wallet overview's client boundary.
 *
 * It lives in its own module so the page can dynamic-import everything that
 * touches `@web3auth/modal` without pulling the SDK into the server render or
 * the initial client bundle. The auth route uses `WalletSdkBoundary` directly
 * with its own panel.
 */
export function WalletConnectionBoundary({
  account,
  authenticated,
  config,
  networkLabel,
}: {
  account: WalletAccount;
  authenticated: boolean;
  config: WalletSdkConfig;
  networkLabel: string;
}) {
  return (
    <WalletSdkBoundary config={config}>
      <WalletConnectionCard
        account={account}
        authenticated={authenticated}
        networkLabel={networkLabel}
      />
    </WalletSdkBoundary>
  );
}
