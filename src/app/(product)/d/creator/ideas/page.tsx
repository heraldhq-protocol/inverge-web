import type { Metadata } from "next";
import Link from "next/link";

import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { MetricStrip } from "@/components/ui/metric-strip";
import { CreatorIdeaList } from "@/features/ideas/components/creator-idea-list";
import { CreatorStudioStatePage } from "@/features/ideas/components/creator-studio-state";
import { CreatorStudioTabs } from "@/features/ideas/components/creator-studio-tabs";
import { getCreatorView } from "@/features/ideas/server/creator-view";

export const metadata: Metadata = {
  title: "My ideas",
  description:
    "Every idea you own, with its lifecycle state, visibility, support, and feedback.",
};

/**
 * The creator's own list (D-014). `/d/creator/ideas` is not discovery — public
 * discovery lives at `/d/discover` and `/ideas`.
 */
export default async function MyIdeasPage() {
  const result = await getCreatorView();

  if (result.status !== "ready") {
    return (
      <CreatorStudioStatePage
        active="ideas"
        next="/d/creator/ideas"
        result={result}
        retryHref="/d/creator/ideas"
      />
    );
  }

  const { dataSource, metrics, rows, truncated } = result.view;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
            Creator Studio
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
            My ideas
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
            Every idea you own — draft or published — with the support and
            feedback it has gathered.
          </p>
        </div>
        <Link
          href="/d/creator/ideas/new"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <HugeiconsIcon
            icon={PlusSignIcon}
            size={17}
            strokeWidth={2}
            aria-hidden="true"
          />
          New idea
        </Link>
      </div>

      <div className="mt-5">
        <CreatorStudioTabs active="ideas" />
      </div>

      <MetricStrip
        className="mt-5 max-w-2xl"
        items={[
          { label: "Published ideas", value: metrics.publishedIdeas },
          { label: "Drafts", value: metrics.draftIdeas },
          {
            label: "Supporters",
            value: metrics.totalSupporters.toLocaleString("en-US"),
          },
        ]}
      />

      <p className="mt-4 max-w-3xl text-xs leading-5 text-muted">
        {dataSource === "live"
          ? "This list reads the signed-in creator's own ideas from the API, including drafts. Drafts stay private until you publish them."
          : "Preview workspace. Ideas, metrics, and forms come from fixtures until the API is configured."}
        {truncated
          ? " Showing the newest 100 ideas; older ideas are not listed."
          : ""}
      </p>

      <section aria-labelledby="owned-ideas-heading" className="mt-6">
        <h2 id="owned-ideas-heading" className="sr-only">
          Your ideas
        </h2>
        <CreatorIdeaList
          rows={rows}
          emptyAction={
            <Link
              href="/d/creator/ideas/new"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Start an idea
            </Link>
          }
        />
      </section>
    </div>
  );
}
