import type { Metadata } from "next";
import Link from "next/link";

import { StatePanel } from "@/components/ui/state-panel";
import { PrePledgesDashboard } from "@/features/pre-pledges/components/pre-pledges-dashboard";
import { getPrePledgesView } from "@/features/pre-pledges/server/pre-pledges";
import {
  isPrePledgeSort,
  isPrePledgeStatusFilter,
  type PrePledgeSort,
  type PrePledgeStatusFilter,
} from "@/features/pre-pledges/types";

export const metadata: Metadata = {
  title: "Pre-pledges",
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

  const view = await getPrePledgesView();

  if (view.status !== "ready") {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
        <StatePanel
          variant="unavailable"
          eyebrow="Pre-pledges"
          title={
            view.status === "signed_out"
              ? "Sign in to see your pre-pledges"
              : "Pre-pledges are unavailable"
          }
          description={
            view.status === "signed_out"
              ? "Sign in to review the ideas you have signalled intent for."
              : view.reason
          }
          action={
            <Link
              href="/d/discover"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Discover ideas
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <PrePledgesDashboard
      data={view.data}
      dataSource={view.dataSource}
      query={query}
      sort={sort}
      status={status}
    />
  );
}
