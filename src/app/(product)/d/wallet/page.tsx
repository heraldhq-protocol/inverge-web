import type { Metadata } from "next";

import { readSessionUser } from "@/features/auth/server/session-user";
import { WalletOverview } from "@/features/wallet/components/wallet-overview";
import { WalletPageShell } from "@/features/wallet/components/wallet-page-shell";
import { getWalletView } from "@/features/wallet/server/wallet";

export const metadata: Metadata = {
  title: "Wallet",
  description: "Your wallet for backing ideas and tracking contributions.",
};

export default async function WalletPage() {
  const view = getWalletView();
  const user = await readSessionUser();

  return (
    <WalletPageShell
      active="overview"
      description="Your wallet for backing ideas and tracking contributions."
    >
      <WalletOverview authenticated={user !== null} view={view} />
    </WalletPageShell>
  );
}
