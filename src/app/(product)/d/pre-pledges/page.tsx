import type { Metadata } from "next";
import Link from "next/link";

import { StatePanel } from "@/components/ui/state-panel";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { PrePledgesDashboard } from "@/features/pre-pledges/components/pre-pledges-dashboard";
import { prePledgesPreviewData } from "@/features/pre-pledges/content/preview-data";
import {
  isPrePledgeSort,
  isPrePledgeStatusFilter,
  type PrePledgeSort,
  type PrePledgeStatusFilter,
} from "@/features/pre-pledges/types";
import { isApiConfigured } from "@/lib/api/server";

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

  // Pre-pledges have no creator read endpoint yet. A live account sees an
  // honest unavailable state rather than the preview account's intentions.
  if (!isPreviewAuth() && isApiConfigured()) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
        <StatePanel
          variant="unavailable"
          eyebrow="Pre-pledges"
          title="Pre-pledges are not connected yet"
          description="The API does not expose a creator pre-pledge read model yet. Your live account is not showing any preview intentions."
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
      data={prePledgesPreviewData}
      query={query}
      sort={sort}
      status={status}
    />
  );
}
