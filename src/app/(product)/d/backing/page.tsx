import type { Metadata } from "next";

import { BackingDashboard } from "@/features/campaigns/components/backing-dashboard";
import { parseBackingFilters } from "@/features/campaigns/lib/backing";
import { getBackingView } from "@/features/campaigns/server/backing";

export const metadata: Metadata = {
  description:
    "Every campaign you have contributed to, with its payment, escrow, and refund states kept apart.",
  robots: { follow: false, index: false },
  title: "Campaigns you back",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * The backer's history (D-017).
 *
 * Filters are read from the URL and applied on the server, so a filtered history
 * is a real address that works before hydration and survives a reload. The
 * records come from the same fixture the receipt page reads, so a row and its
 * detail page can never disagree.
 */
export default async function BackingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { query, sort, status } = parseBackingFilters(params);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <BackingDashboard
        view={getBackingView()}
        query={query}
        sort={sort}
        status={status}
      />
    </div>
  );
}
