import type { Metadata } from "next";

import { WalletPageShell } from "@/features/wallet/components/wallet-page-shell";
import { WalletReceive } from "@/features/wallet/components/wallet-receive";
import { getWalletView } from "@/features/wallet/server/wallet";

export const metadata: Metadata = {
  title: "Receive funds",
  description:
    "How to add funds to your Inverge wallet, and why no receiving address exists in this build.",
};

export default function WalletReceivePage() {
  const view = getWalletView();

  return (
    <WalletPageShell
      active="receive"
      description="Adding funds needs a real address or a licensed on-ramp quote. Neither exists in this build, so this page explains the handoff instead of inventing one."
      title="Receive"
    >
      <WalletReceive view={view} />
    </WalletPageShell>
  );
}
