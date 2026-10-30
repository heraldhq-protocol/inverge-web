import type { Metadata } from "next";

import { WalletPageShell } from "@/features/wallet/components/wallet-page-shell";
import { WalletRefunds } from "@/features/wallet/components/wallet-refunds";
import { getWalletView } from "@/features/wallet/server/wallet";

export const metadata: Metadata = {
  title: "Wallet refunds",
  description:
    "Refund status for contributions you have backed. Refund claims are not connected yet.",
};

export default async function WalletRefundsPage() {
  const view = await getWalletView();

  return (
    <WalletPageShell
      active="refunds"
      description="Refunds are decided by the campaign outcome. Eligible amounts return to the wallet you contributed from."
      title="Refunds"
    >
      <WalletRefunds view={view} />
    </WalletPageShell>
  );
}
