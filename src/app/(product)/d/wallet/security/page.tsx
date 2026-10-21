import type { Metadata } from "next";

import { WalletPageShell } from "@/features/wallet/components/wallet-page-shell";
import { WalletSecurity } from "@/features/wallet/components/wallet-security";
import { getWalletView } from "@/features/wallet/server/wallet";

export const metadata: Metadata = {
  title: "Wallet security",
  description:
    "How Inverge protects wallet signing, and what is deliberately unavailable in this build.",
};

export default function WalletSecurityPage() {
  const view = getWalletView();

  return (
    <WalletPageShell
      active="security"
      description="What protects the wallet, what Inverge never asks for, and which security controls are actually connected."
      title="Security"
      view={view}
    >
      <WalletSecurity view={view} />
    </WalletPageShell>
  );
}
