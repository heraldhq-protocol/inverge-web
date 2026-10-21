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
  description: "Contributions and refunds, each with its own settlement state.",
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
      description="Every contribution and refund record in one history. A failed or pending record stays visible so you can see what did not happen."
      title="Activity"
      view={view}
    >
      <WalletActivityDashboard filter={filter} query={query} view={view} />
    </WalletPageShell>
  );
}
