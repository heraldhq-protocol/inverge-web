import Link from "next/link";
import type { ReactNode } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

import { Container } from "@/components/ui/container";
import { StatePanel } from "@/components/ui/state-panel";
import { LiveCampaignCard } from "@/features/campaigns/components/live-campaign-card";
import type { CampaignFeedSurface } from "@/features/campaigns/server/feed-view";
import type {
  LiveCampaignFeedParams,
  LiveCampaignFeedSort,
  LiveCampaignFeedStatus,
} from "@/features/campaigns/server/live-campaigns";

type LiveFeedView = Extract<CampaignFeedSurface, { dataSource: "live" }>;

const STATUS_LABELS: Readonly<Record<LiveCampaignFeedStatus, string>> = {
  active: "Funding open",
  all: "All campaigns",
  completed: "Completed",
  failed: "Missed target",
  funded: "Funded",
};

const SORT_LABELS: Readonly<Record<LiveCampaignFeedSort, string>> = {
  "closing-soon": "Closing soon",
  "most-backed": "Most backed",
  newest: "Newest",
};

function feedHref(
  params: LiveCampaignFeedParams,
  overrides: Partial<LiveCampaignFeedParams> = {},
): string {
  const next = { ...params, ...overrides };
  const query = new URLSearchParams();
  if (next.status !== "all") query.set("status", next.status);
  if (next.sort !== "newest") query.set("sort", next.sort);
  if (next.q) query.set("q", next.q);
  if (next.cursor) query.set("cursor", next.cursor);
  const suffix = query.toString();
  return suffix ? `/campaigns?${suffix}` : "/campaigns";
}

function FilterLink({
  active,
  children,
  href,
}: {
  active: boolean;
  children: ReactNode;
  href: string;
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      href={href}
      className={`inline-flex min-h-9 items-center rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        active
          ? "bg-ink text-canvas"
          : "border border-border bg-surface text-ink hover:border-brand/35 hover:text-brand-strong"
      }`}
    >
      {children}
    </Link>
  );
}

/**
 * The live discovery feed.
 *
 * `GET /campaigns` now supports a free-text query alongside status, taxonomy,
 * region and three sorts, so search runs server-side and composes with the
 * status and sort links. Money bands, country and percent filters still belong
 * to the preview grid. Paging follows the API's opaque cursor, so "load more" is
 * always one real page.
 */
export function LiveCampaignFeed({ surface }: { surface: LiveFeedView }) {
  const { campaigns, params } = surface;
  const hasSearch = Boolean(params.q);

  return (
    <section className="bg-canvas">
      <Container className="py-8 sm:py-10">
        <p className="text-xs leading-5 text-muted">
          Live campaign records. Search by campaign, source idea, or creator, or
          browse by{" "}
          <Link
            href="/campaigns/categories/technology"
            className="font-semibold text-brand-strong underline-offset-2 hover:underline"
          >
            category
          </Link>{" "}
          for a taxonomy view.
        </p>

        <form
          action="/campaigns"
          role="search"
          className="mt-5 flex max-w-xl items-center gap-2"
        >
          <label htmlFor="campaign-search" className="sr-only">
            Search campaigns
          </label>
          <div className="relative min-w-0 flex-1">
            <HugeiconsIcon
              icon={Search01Icon}
              size={17}
              strokeWidth={1.8}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              id="campaign-search"
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search campaigns, ideas, or creators"
              className="min-h-11 w-full rounded-xl border border-border bg-surface py-2 pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-muted/70 hover:border-border-strong focus:border-brand focus:ring-3 focus:ring-brand/12"
            />
          </div>
          {params.status !== "all" ? (
            <input type="hidden" name="status" value={params.status} />
          ) : null}
          {params.sort !== "newest" ? (
            <input type="hidden" name="sort" value={params.sort} />
          ) : null}
          <button
            type="submit"
            className="inline-flex min-h-11 shrink-0 items-center rounded-xl bg-ink px-4 text-sm font-semibold text-canvas transition-colors hover:bg-contrast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Search
          </button>
        </form>

        <div className="mt-5 flex flex-col gap-4 border-y border-border py-4 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Campaign status" className="flex flex-wrap gap-2">
            {(Object.keys(STATUS_LABELS) as LiveCampaignFeedStatus[]).map(
              (status) => (
                <FilterLink
                  key={status}
                  active={params.status === status}
                  href={feedHref(params, { cursor: null, status })}
                >
                  {STATUS_LABELS[status]}
                </FilterLink>
              ),
            )}
          </nav>

          <nav aria-label="Campaign sort" className="flex flex-wrap gap-2">
            {(Object.keys(SORT_LABELS) as LiveCampaignFeedSort[]).map(
              (sort) => (
                <FilterLink
                  key={sort}
                  active={params.sort === sort}
                  href={feedHref(params, { cursor: null, sort })}
                >
                  {SORT_LABELS[sort]}
                </FilterLink>
              ),
            )}
          </nav>
        </div>

        {campaigns.length === 0 ? (
          <div className="mt-6">
            <StatePanel
              action={
                <Link
                  href="/campaigns"
                  className="inline-flex min-h-10 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Clear filters
                </Link>
              }
              description={
                hasSearch
                  ? `No public campaign matches “${params.q}”. Try a different title, creator, or clear the search.`
                  : "No public campaign matches this view. Clear the filters, or check back after a creator publishes one."
              }
              eyebrow={hasSearch ? "No search results" : "No campaigns"}
              title={
                hasSearch
                  ? "No campaigns match this search"
                  : "No campaigns match this filter"
              }
              variant="empty"
            />
          </div>
        ) : (
          <>
            <p className="mt-5 text-sm text-muted" aria-live="polite">
              Showing {campaigns.length}{" "}
              {campaigns.length === 1 ? "campaign" : "campaigns"}
              {hasSearch ? ` for “${params.q}”` : ""}
              {surface.hasMore ? " from this page" : ""}.
            </p>

            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <li key={campaign.id} className="h-full">
                  <LiveCampaignCard campaign={campaign} />
                </li>
              ))}
            </ul>

            <nav
              aria-label="Campaign pages"
              className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"
            >
              <Link
                href="/campaigns"
                className="inline-flex min-h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Back to the start
              </Link>

              {surface.hasMore && surface.nextCursor ? (
                <Link
                  href={feedHref(params, { cursor: surface.nextCursor })}
                  rel="next"
                  className="inline-flex min-h-10 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Load more campaigns
                </Link>
              ) : (
                <span className="text-xs text-muted">
                  End of the published catalogue.
                </span>
              )}
            </nav>
          </>
        )}
      </Container>
    </section>
  );
}
