import type { Metadata } from "next";

import { WalletPageShell } from "@/features/wallet/components/wallet-page-shell";
import { WalletRefunds } from "@/features/wallet/components/wallet-refunds";
import { getWalletView } from "@/features/wallet/server/wallet";

export const metadata: Metadata = {
  title: "Wallet refunds",
  description:
    "Refund records derived from campaign outcomes. Claiming is not connected in this build.",
};

export default function WalletRefundsPage() {
  const view = getWalletView();

  return (
    <WalletPageShell
      active="refunds"
      description="Refunds are decided by the campaign outcome, not by the wallet. This page shows what is eligible, in progress, or returned, and never claims a refund was executed."
      title="Refunds"
      view={view}
    >
      <WalletRefunds view={view} />
    </WalletPageShell>
  );
}
