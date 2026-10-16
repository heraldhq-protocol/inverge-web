import type { Metadata } from "next";

import { PrePledgesDashboard } from "@/features/pre-pledges/components/pre-pledges-dashboard";
import { prePledgesPreviewData } from "@/features/pre-pledges/content/preview-data";
import {
  isPrePledgeSort,
  isPrePledgeStatusFilter,
  type PrePledgeSort,
  type PrePledgeStatusFilter,
} from "@/features/pre-pledges/types";

export const metadata: Metadata = {
  title: "Pre-pledges | Inverge",
  description: "Review and manage your non-binding pre-pledge intentions.",
};

type PrePledgesPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    sort?: string | string[];
    status?: string | string[];
  }>;
};

export default async function PrePledgesPage({
  searchParams,
}: PrePledgesPageProps) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 120) : "";
  const status: PrePledgeStatusFilter =
    typeof params.status === "string" && isPrePledgeStatusFilter(params.status)
      ? params.status
      : "all";
  const sort: PrePledgeSort =
    typeof params.sort === "string" && isPrePledgeSort(params.sort)
      ? params.sort
      : "most-recent";

  return (
    <PrePledgesDashboard
      data={prePledgesPreviewData}
      query={query}
      sort={sort}
      status={status}
    />
  );
}
