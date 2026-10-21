"use client";

import dynamic from "next/dynamic";

import { AuthSignInPanel } from "@/features/auth/components/auth-sign-in-panel";
import type { OnboardingIntent } from "@/features/auth/lib/onboarding";
import { WalletAuthLoading } from "@/features/wallet/components/wallet-auth-loading";
import { WalletAuthUnavailable } from "@/features/wallet/components/wallet-auth-unavailable";
import type { WalletSdkConfig } from "@/features/wallet/lib/provider-config";
import { resolveWalletSdkConfig } from "@/features/wallet/lib/provider-config";

/**
 * Sign-in is the provider's modal, so the provider tree has to exist before the
 * button can open it. The SDK is loaded after mount and never during SSR.
 *
 * When no Client ID is present the card says sign-in is unavailable instead of
 * rendering a button that cannot do anything.
 */
const WalletSdkBoundary = dynamic(
  () =>
    import("@/features/wallet/components/wallet-sdk-boundary").then(
      (module) => module.WalletSdkBoundary,
    ),
  { loading: () => <WalletAuthLoading />, ssr: false },
);

export function AuthSignInCard({
  intent,
  returnPath,
}: {
  intent: OnboardingIntent;
  returnPath: string;
}) {
  const config: WalletSdkConfig | null = resolveWalletSdkConfig({
    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
    network: process.env.NEXT_PUBLIC_WEB3AUTH_NETWORK,
    cluster: process.env.NEXT_PUBLIC_WALLET_NETWORK,
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
  });

  if (!config) return <WalletAuthUnavailable />;

  return (
    <WalletSdkBoundary config={config}>
      <AuthSignInPanel intent={intent} returnPath={returnPath} />
    </WalletSdkBoundary>
  );
}
