import type { Metadata } from "next";

import { WalletPageShell } from "@/features/wallet/components/wallet-page-shell";
import { WalletSecurity } from "@/features/wallet/components/wallet-security";
import { getWalletView } from "@/features/wallet/server/wallet";

export const metadata: Metadata = {
  title: "Wallet security",
  description:
    "How Inverge protects the embedded wallet and where provider-hosted security controls live.",
};

export default async function WalletSecurityPage() {
  const view = await getWalletView();

  return (
    <WalletPageShell
      active="security"
      description="What protects the wallet, what Inverge never asks for, and where to manage the provider-hosted controls."
      title="Security"
    >
      <WalletSecurity view={view} />
    </WalletPageShell>
  );
}
