import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AccessRequestRow } from "@/features/admin/components/access-request-row";
import {
  adminFieldClass,
  adminLinkClass,
} from "@/features/admin/components/admin-workspace-ui";
import {
  ACCESS_FILTERS,
  type AdminAccessRequest,
} from "@/features/admin/lib/access-requests";
import {
  aiAccessHref,
  type AiAccessQuery,
} from "@/features/admin/lib/ai-access";

export function AiAccessQueue({
  requests,
  query,
  asOf,
}: {
  requests: AdminAccessRequest[];
  query: AiAccessQuery;
  asOf: string;
}) {
  return (
    <section
      className="mt-6 overflow-hidden rounded-xl border border-border bg-surface"
      aria-label="AI access requests"
    >
      <div className="flex flex-col gap-4 border-b border-border p-4 xl:flex-row xl:items-center xl:justify-between">
        <nav
          aria-label="Filter by request status"
          className="grid grid-cols-2 gap-1 sm:flex sm:flex-wrap"
        >
          {ACCESS_FILTERS.map((filter) => (
            <Link
              key={filter.value}
              href={aiAccessHref({ ...query, status: filter.value })}
              aria-current={query.status === filter.value ? "page" : undefined}
              className={`inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong ${query.status === filter.value ? "bg-brand-soft text-brand-strong" : "text-ink-soft hover:bg-canvas"}`}
            >
              {filter.label}
            </Link>
          ))}
        </nav>
        <form
          action="/admin/ai-access"
          method="get"
          className="flex flex-wrap items-end gap-2"
        >
          <input type="hidden" name="status" value={query.status} />
          <label
            className="min-w-0 flex-1 text-xs font-medium text-ink-soft"
            htmlFor="ai-access-limit"
          >
            Requests to show
            <select
              id="ai-access-limit"
              name="limit"
              defaultValue={query.limit}
              className={`mt-1 ${adminFieldClass}`}
            >
              <option value="50">50 requests</option>
              <option value="100">100 requests</option>
              <option value="200">200 requests</option>
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
      {requests.length ? (
        <ul className="divide-y divide-border">
          {requests.map((request) => (
            <AccessRequestRow
              key={`${request.id}:${asOf}`}
              request={request}
              endpointBase="/api/admin/ai/access-requests"
              queueHref={aiAccessHref(query)}
              featureLabel="AI assistant"
              asOf={asOf}
            />
          ))}
        </ul>
      ) : (
        <div className="px-5 py-12 text-center">
          <h2 className="text-base font-semibold text-ink">
            {query.status === "ALL"
              ? "No requests yet"
              : `No ${query.status.toLowerCase()} requests`}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-soft">
            {query.status === "PENDING"
              ? "New requests from Creator Studio will appear here for review."
              : "Requests appear here when they match this status."}
          </p>
          {query.status !== "ALL" ? (
            <Link
              href={aiAccessHref({ ...query, status: "ALL" })}
              className={`mt-4 ${adminLinkClass}`}
            >
              View all requests
            </Link>
          ) : null}
        </div>
      )}
      <footer className="border-t border-border px-4 py-3 text-xs leading-5 text-ink-soft sm:px-5">
        <p>
          {requests.length} {requests.length === 1 ? "request" : "requests"}{" "}
          shown, oldest first.
        </p>
        {requests.length === query.limit ? (
          <p className="mt-1">
            More requests may exist. Increase the list size or review pending
            requests, then refresh.
          </p>
        ) : null}
        <p className="mt-1">
          AI access is separate from analytics access. Assistant usage limits
          still apply after approval.
        </p>
      </footer>
    </section>
  );
}
