import type { Metadata } from "next";

import { WalletOverview } from "@/features/wallet/components/wallet-overview";
import { WalletPageShell } from "@/features/wallet/components/wallet-page-shell";
import { getWalletView } from "@/features/wallet/server/wallet";

export const metadata: Metadata = {
  title: "Wallet",
  description:
    "Review your Inverge wallet, its balances, activity, and what is connected.",
};

export default function WalletPage() {
  const view = getWalletView();

  return (
    <WalletPageShell
      active="overview"
      description="Your wallet is tied to your Inverge identity. This build labels every sample figure and never invents an address, a balance, or a transfer."
      view={view}
    >
      <WalletOverview view={view} />
    </WalletPageShell>
  );
}
