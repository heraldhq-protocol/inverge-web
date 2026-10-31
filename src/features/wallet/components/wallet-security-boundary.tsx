"use client";

import { WalletSdkBoundary } from "@/features/wallet/components/wallet-sdk-boundary";
import { WalletSecurityButton } from "@/features/wallet/components/wallet-security-button";
import type { WalletSdkConfig } from "@/features/wallet/lib/provider-config";

export function WalletSecurityBoundary({
  config,
  linked,
}: {
  config: WalletSdkConfig;
  linked: boolean;
}) {
  return (
    <WalletSdkBoundary config={config}>
      <WalletSecurityButton linked={linked} />
    </WalletSdkBoundary>
  );
}
