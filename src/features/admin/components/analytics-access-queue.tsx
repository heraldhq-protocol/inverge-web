import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AccessRequestRow } from "@/features/admin/components/access-request-row";
import {
  adminFieldClass,
  adminLinkClass,
} from "@/features/admin/components/admin-workspace-ui";
import { ACCESS_FILTERS } from "@/features/admin/lib/access-requests";
import {
  analyticsAccessHref,
  type AnalyticsAccessList,
  type AnalyticsAccessQuery,
} from "@/features/admin/lib/analytics-access";

const tiers = {
  STARTER: "Starter",
  TRUSTED: "Trusted",
  ESTABLISHED: "Established",
};

export function AnalyticsAccessQueue({
  list,
  query,
  asOf,
}: {
  list: AnalyticsAccessList;
  query: AnalyticsAccessQuery;
  asOf: string;
}) {
  const firstPage = { status: query.status, limit: query.limit };
  return (
    <section
      className="mt-6 overflow-hidden rounded-xl border border-border bg-surface"
      aria-label="Analytics access requests"
    >
      <div className="flex flex-col gap-4 border-b border-border p-4 xl:flex-row xl:items-center xl:justify-between">
        <nav
          aria-label="Filter by request status"
          className="grid grid-cols-2 gap-1 sm:flex sm:flex-wrap"
        >
          {ACCESS_FILTERS.map((filter) => (
            <Link
              key={filter.value}
              href={analyticsAccessHref({ ...firstPage, status: filter.value })}
              aria-current={query.status === filter.value ? "page" : undefined}
              className={`inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong ${query.status === filter.value ? "bg-brand-soft text-brand-strong" : "text-ink-soft hover:bg-canvas"}`}
            >
              {filter.label}
            </Link>
          ))}
        </nav>
        <form
          action="/admin/analytics-access"
          method="get"
          className="flex flex-wrap items-end gap-2"
        >
          <input type="hidden" name="status" value={query.status} />
          <label
            className="min-w-0 flex-1 text-xs font-medium text-ink-soft"
            htmlFor="analytics-access-limit"
          >
            Page size
            <select
              id="analytics-access-limit"
              name="limit"
              defaultValue={query.limit}
              className={`mt-1 ${adminFieldClass}`}
            >
              <option value="24">24 requests</option>
              <option value="50">50 requests</option>
            </select>
          </label>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="min-h-12 cursor-pointer focus-visible:outline-brand-strong"
          >
            Apply
          </Button>
        </form>
      </div>
      {list.data.length ? (
        <ul className="divide-y divide-border">
          {list.data.map((request) => (
            <AccessRequestRow
              key={`${request.id}:${asOf}`}
              request={request}
              endpointBase="/api/admin/analytics/access-requests"
              queueHref={analyticsAccessHref(query)}
              featureLabel="premium analytics"
              asOf={asOf}
              canRevise
              accountDetails={
                <p className="mt-1 text-xs leading-5 text-ink-soft [overflow-wrap:anywhere]">
                  {[
                    request.displayName,
                    request.username ? `@${request.username}` : null,
                    `${tiers[request.creatorTier]} creator`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              }
            />
          ))}
        </ul>
      ) : (
        <div className="px-5 py-12 text-center">
          <h2 className="text-base font-semibold text-ink">
            {query.cursor
              ? "No requests on this page"
              : query.status === "ALL"
                ? "No requests yet"
                : `No ${query.status.toLowerCase()} requests`}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-soft">
            {query.cursor
              ? "Return to the first page to see the latest results."
              : "Creator requests for premium reports will appear here for review."}
          </p>
          {query.cursor ? (
            <Link
              href={analyticsAccessHref(firstPage)}
              className={`mt-4 ${adminLinkClass}`}
            >
              Back to first page
            </Link>
          ) : query.status !== "ALL" ? (
            <Link
              href={analyticsAccessHref({ ...firstPage, status: "ALL" })}
              className={`mt-4 ${adminLinkClass}`}
            >
              View all requests
            </Link>
          ) : null}
        </div>
      )}
      <footer className="border-t border-border px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs leading-5 text-ink-soft">
            {list.data.length} {list.data.length === 1 ? "request" : "requests"}{" "}
            on this page, newest first.
          </p>
          <nav aria-label="Request pages" className="flex flex-wrap gap-2">
            {query.cursor && list.data.length > 0 ? (
              <Link
                href={analyticsAccessHref(firstPage)}
                className={adminLinkClass}
              >
                Back to first page
              </Link>
            ) : null}
            {list.page.hasMore && list.page.nextCursor ? (
              <Link
                href={analyticsAccessHref({
                  ...query,
                  cursor: list.page.nextCursor,
                })}
                className={adminLinkClass}
              >
                Older requests
              </Link>
            ) : null}
          </nav>
        </div>
        <p className="mt-2 text-xs leading-5 text-ink-soft">
          Changes affect premium reports. Billing and AI access are managed
          separately.
        </p>
      </footer>
    </section>
  );
}
