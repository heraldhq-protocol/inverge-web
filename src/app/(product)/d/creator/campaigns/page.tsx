import type { Metadata } from "next";
import Link from "next/link";

import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { MetricCard } from "@/components/ui/metric-card";
import { StatePanel } from "@/components/ui/state-panel";
import {
  CreatorCampaignList,
  creatorCampaignMetrics,
} from "@/features/campaigns/components/creator-campaign-list";
import { getCreatorCampaignsPageView } from "@/features/campaigns/server/live-creator-campaigns";
import { CreatorStudioTabs } from "@/features/ideas/components/creator-studio-tabs";

export const metadata: Metadata = {
  description:
    "Every campaign you own, with its review state, funding, and milestone progress.",
  title: "Campaigns",
};

/**
 * The creator's own campaigns.
 *
 * This is the workspace, not discovery: it lists the account's campaigns in
 * every phase, including drafts and rejected listings, because those are exactly
 * the ones that need the creator's attention.
 */
export default async function CreatorCampaignsPage() {
  const result = await getCreatorCampaignsPageView();
  const view = result.status === "ready" ? result.view : null;
  const tiles = view ? creatorCampaignMetrics(view.metrics) : [];
  const now = new Date();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
            Creator Studio
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
            Campaigns
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
            A campaign opens a funding window against a milestone plan that
            escrow enforces. Draft it, submit it for review, then deliver
            against the plan backers agreed to.
          </p>
        </div>
        <Link
          href="/d/creator/campaigns/new"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <HugeiconsIcon
            icon={PlusSignIcon}
            size={17}
            strokeWidth={2}
            aria-hidden="true"
          />
          New campaign
        </Link>
      </div>

      <div className="mt-5">
        <CreatorStudioTabs active="campaigns" />
      </div>

      {result.status !== "ready" ? (
        <div className="mt-6">
          <StatePanel
            variant="unavailable"
            eyebrow="Creator campaigns"
            title={
              result.status === "signed_out"
                ? "Sign in to see your campaigns"
                : "Campaigns are unavailable"
            }
            description={
              result.status === "signed_out"
                ? "Sign in to review the campaigns you own."
                : result.reason
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {tiles.map((tile) => (
              <MetricCard
                key={tile.label}
                hint={tile.hint}
                icon={tile.icon}
                label={tile.label}
                value={tile.value}
              />
            ))}
          </div>

          <p className="mt-4 max-w-3xl text-xs leading-5 text-muted">
            {view?.dataSource === "live"
              ? "Live campaigns for this account. Funding figures come from indexed campaign totals; review and milestone actions still open the preview workspace until their write surfaces are connected."
              : "Preview workspace. Campaigns, escrow figures, and milestone states come from fixtures until the campaigns and escrow APIs are connected; nothing here writes to them."}
          </p>

          <section aria-labelledby="owned-campaigns-heading" className="mt-6">
            <h2 id="owned-campaigns-heading" className="sr-only">
              Your campaigns
            </h2>
            <CreatorCampaignList
              emptyAction={
                <Link
                  href="/d/creator/campaigns/new"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Start a campaign
                </Link>
              }
              now={now}
              summaries={view?.summaries ?? []}
            />
          </section>
        </>
      )}
    </div>
  );
}
