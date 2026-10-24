import Link from "next/link";

import { Container } from "@/components/ui/container";
import { StatePanel } from "@/components/ui/state-panel";
import { LiveCampaignCard } from "@/features/campaigns/components/live-campaign-card";
import type { LiveCampaignCategoryView } from "@/features/campaigns/server/category-views";

const PAGE_SIZE = 24;

/**
 * The live category listing.
 *
 * Search, country, money, and sort controls belong to the preview discovery
 * grid and cannot be honoured by `GET /campaigns`, which exposes only taxonomy,
 * status, region, and three sorts. Rather than render controls that silently do
 * nothing, the live surface states the limitation and pages through the newest
 * window in the URL.
 *
 * Paging is server-rendered over the already-loaded window. It keeps a category
 * page to one screen of cards without asking the API for a second window or
 * pretending the window is the whole catalogue.
 */
export function LiveCampaignCategoryListing({
  view,
  basePath,
  page,
}: {
  view: LiveCampaignCategoryView;
  basePath: string;
  page: number;
}) {
  const label = view.subcategory?.label ?? view.category.label;
  const total = view.campaigns.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const visible = view.campaigns.slice(start, start + PAGE_SIZE);

  return (
    <section className="bg-canvas">
      <Container className="py-8 sm:py-10">
        <p className="text-xs leading-5 text-muted">
          Live campaign records. Search and advanced filters are not available
          on live category pages yet.
        </p>

        {view.truncated ? (
          <p className="mt-3 rounded-xl border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted">
            This category is read in a window of the newest {total} campaigns.
            Counts on this page cover that window only.
          </p>
        ) : null}

        {total === 0 ? (
          <div className="mt-6">
            <StatePanel
              action={
                <Link
                  href="/campaigns"
                  className="inline-flex min-h-10 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Browse campaigns
                </Link>
              }
              description={`No campaign is currently listed in ${label}. Browse another category, or check back after a creator publishes one.`}
              eyebrow="No campaigns yet"
              title={`No public campaigns in ${label} yet`}
              variant="empty"
            />
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-muted" aria-live="polite">
                Showing {start + 1}–{Math.min(start + PAGE_SIZE, total)} of{" "}
                {total} {total === 1 ? "campaign" : "campaigns"}
              </p>
              {pageCount > 1 ? (
                <p className="text-xs text-muted">
                  Page {current} of {pageCount}
                </p>
              ) : null}
            </div>

            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((campaign) => (
                <li key={campaign.id} className="h-full">
                  <LiveCampaignCard campaign={campaign} />
                </li>
              ))}
            </ul>

            {pageCount > 1 ? (
              <nav
                aria-label="Campaign pages"
                className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5"
              >
                {current > 1 ? (
                  <Link
                    href={pageHref(basePath, current - 1)}
                    rel="prev"
                    className="inline-flex min-h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="inline-flex min-h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-semibold text-muted opacity-60">
                    Previous
                  </span>
                )}

                <span className="text-xs text-muted">
                  {current} / {pageCount}
                </span>

                {current < pageCount ? (
                  <Link
                    href={pageHref(basePath, current + 1)}
                    rel="next"
                    className="inline-flex min-h-10 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="inline-flex min-h-10 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white opacity-60">
                    Next
                  </span>
                )}
              </nav>
            ) : null}
          </>
        )}
      </Container>
    </section>
  );
}

function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}
