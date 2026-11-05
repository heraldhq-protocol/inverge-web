import type { Metadata } from "next";

import {
  AdminPageHeader,
  AdminUnavailable,
} from "@/features/admin/components/admin-workspace-ui";
import { BoostPriceEditor } from "@/features/admin/components/boost-price-editor";
import { RefreshAdminData } from "@/features/admin/components/refresh-admin-data";
import { getBoostPrices } from "@/features/admin/server/boost-prices";

export const metadata: Metadata = {
  title: "Boost pricing",
  description: "Configure Basic and Featured placement prices and durations.",
  robots: { index: false, follow: false },
};

export default async function BoostPricesPage() {
  const result = await getBoostPrices();
  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdminPageHeader
        title="Boost pricing"
        description="Set the one-off price and placement duration for Basic and Featured idea boosts."
      >
        <RefreshAdminData label="Refresh prices" />
      </AdminPageHeader>
      {result.status === "ready" ? (
        <BoostPriceEditor key={new Date().toISOString()} prices={result.data} />
      ) : (
        <AdminUnavailable message={result.message} />
      )}
    </div>
  );
}
