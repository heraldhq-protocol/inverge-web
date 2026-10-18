import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContributionReceipt } from "@/features/campaigns/components/contribution-receipt";
import { getContributionReceiptView } from "@/features/campaigns/server/backing";
import { PRIVATE_ROBOTS } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ contributionId: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { contributionId } = await params;
  const view = getContributionReceiptView(contributionId);

  return {
    description:
      "One contribution's full record: the payment, the escrow entry, and the refund, each with its own state.",
    robots: PRIVATE_ROBOTS,
    title: view
      ? `Contribution to ${view.contribution.campaignTitle}`
      : "Contribution record",
  };
}

/**
 * One contribution's receipt.
 *
 * An id that does not resolve renders the not-found page rather than an empty
 * receipt: a receipt with no amount, no route, and no dates would read as a
 * record of a contribution that does not exist.
 */
export default async function ContributionReceiptPage({ params }: PageProps) {
  const { contributionId } = await params;
  const view = getContributionReceiptView(contributionId);
  if (!view) notFound();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <ContributionReceipt view={view} />
    </div>
  );
}
