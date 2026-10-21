import type { Metadata } from "next";

import { WalletPageShell } from "@/features/wallet/components/wallet-page-shell";
import { WalletSend } from "@/features/wallet/components/wallet-send";
import { getWalletView } from "@/features/wallet/server/wallet";

export const metadata: Metadata = {
  title: "Send funds",
  description:
    "Validate a Solana destination and amount before signing. Signing is not connected in this build.",
};

export default function WalletSendPage() {
  const view = getWalletView();

  return (
    <WalletPageShell
      active="send"
      description="A transfer leaves your wallet for an external address. The form validates the destination and amount for real; it cannot sign or send in this build."
      title="Send"
      view={view}
    >
      <WalletSend
        account={view.account}
        balances={view.balances}
        capabilities={view.capabilities}
      />
    </WalletPageShell>
  );
}
