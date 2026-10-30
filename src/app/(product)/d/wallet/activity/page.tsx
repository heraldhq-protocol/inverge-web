import type { Metadata } from "next";

import { WalletActivityDashboard } from "@/features/wallet/components/wallet-activity-dashboard";
import { WalletPageShell } from "@/features/wallet/components/wallet-page-shell";
import {
  isWalletActivityFilter,
  type WalletActivityFilter,
} from "@/features/wallet/lib/activity";
import { getWalletView } from "@/features/wallet/server/wallet";

export const metadata: Metadata = {
  title: "Wallet activity",
  description: "Your contribution and refund history.",
};

type WalletActivityPageProps = {
  searchParams: Promise<{
    filter?: string | string[];
    q?: string | string[];
  }>;
};

export default async function WalletActivityPage({
  searchParams,
}: WalletActivityPageProps) {
  const params = await searchParams;
  const view = getWalletView();
  const query = typeof params.q === "string" ? params.q.slice(0, 120) : "";
  const filter: WalletActivityFilter =
    typeof params.filter === "string" && isWalletActivityFilter(params.filter)
      ? params.filter
      : "all";

  return (
    <WalletPageShell
      active="activity"
      description="Every contribution and refund, in one place."
      title="Activity"
    >
      <WalletActivityDashboard filter={filter} query={query} view={view} />
    </WalletPageShell>
  );
}
