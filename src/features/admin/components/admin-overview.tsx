import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MetricCard } from "@/components/ui/metric-card";
import { RefreshOverview } from "@/features/admin/components/refresh-overview";
import {
  formatEscrowUsd,
  overviewTimestamp,
  OVERVIEW_PERIODS,
  type AdminOverviewData,
} from "@/features/admin/lib/overview";

const resourceLabels = {
  IDEA: "Ideas",
  CAMPAIGN: "Campaigns",
  PAGE: "Pages",
} as const;
const linkClasses =
  "inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

function UnavailableReport({ reason }: { reason: string }) {
  return (
    <div
      className="mt-3 rounded-xl border border-warning/30 bg-warning/5 px-4 py-4"
      role="status"
    >
      <p className="text-sm font-semibold text-ink">Report unavailable</p>
      <p className="mt-1 text-sm leading-6 text-muted">{reason}</p>
    </div>
  );
}

function SnapshotTime({ asOf, readAt }: { asOf: string; readAt: string }) {
  const stale = Date.parse(readAt) - Date.parse(asOf) > 5 * 60_000;
  return (
    <p className="mt-3 text-xs leading-5 text-muted">
      Snapshot: <time dateTime={asOf}>{overviewTimestamp(asOf)}</time>.
      {stale ? (
        <span className="ml-1 font-semibold text-warning-strong">
          This snapshot is more than five minutes old.
        </span>
      ) : (
        " May be cached for up to 60 seconds."
      )}
    </p>
  );
}

/** API-backed reporting. No local campaign overrides or sample financial data. */
export function AdminOverview({
  name,
  view,
}: {
  name: string;
  view: AdminOverviewData;
}) {
  const { summary, escrow, analytics } = view;
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Admin</Eyebrow>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
            Operating overview
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
            Platform activity and reported escrow figures. Signed in as{" "}
            <span className="font-semibold text-ink">{name}</span>.
          </p>
        </div>
        <RefreshOverview />
      </header>

      <nav aria-label="Operational queues" className="flex flex-wrap gap-2">
        <Link href="/admin/campaigns" className={linkClasses}>
          Open review queue
        </Link>
        <Link href="/admin/verification" className={linkClasses}>
          Verification cases
        </Link>
        <Link href="/admin/audit" className={linkClasses}>
          Audit log
        </Link>
      </nav>

      <section aria-labelledby="platform-summary">
        <h2 id="platform-summary" className="text-lg font-bold text-ink">
          Public platform activity
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Published ideas and public campaigns. Drafts and the review queue are
          excluded.
        </p>
        {summary.status === "unavailable" ? (
          <UnavailableReport reason={summary.reason} />
        ) : (
          <>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Published ideas"
                value={summary.data.publishedIdeas.toLocaleString("en-US")}
              />
              <MetricCard
                label="Active campaigns"
                value={summary.data.activeCampaigns.toLocaleString("en-US")}
              />
              <MetricCard
                label="Completed campaigns"
                value={summary.data.completedCampaigns.toLocaleString("en-US")}
              />
              <MetricCard
                label="Public campaigns"
                value={summary.data.totalCampaigns.toLocaleString("en-US")}
                hint="All public campaign states."
              />
            </div>
            {summary.data.publishedIdeas === 0 &&
            summary.data.totalCampaigns === 0 ? (
              <p className="mt-3 text-sm text-muted">
                No ideas or campaigns have been published yet.
              </p>
            ) : null}
            <SnapshotTime asOf={summary.data.asOf} readAt={view.readAt} />
          </>
        )}
      </section>

      <section aria-labelledby="platform-escrow">
        <h2 id="platform-escrow" className="text-lg font-bold text-ink">
          Reported escrow
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
          USD figures reported by the service. Released and refunded totals come
          from indexed events. The held estimate combines campaign totals and
          releases; reconciliation status and network are not supplied.
        </p>
        {escrow.status === "unavailable" ? (
          <UnavailableReport reason={escrow.reason} />
        ) : (
          <>
            <div className="mt-3 grid gap-3 lg:grid-cols-3 [&_p]:break-words">
              <MetricCard
                label="Held estimate (USD)"
                value={formatEscrowUsd(escrow.data.heldUsd)}
                hint="An estimate, not a verified escrow balance."
              />
              <MetricCard
                label="Released (USD)"
                value={formatEscrowUsd(escrow.data.releasedUsd)}
              />
              <MetricCard
                label="Refunded (USD)"
                value={formatEscrowUsd(escrow.data.refundedUsd)}
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              {escrow.data.counts.active.toLocaleString("en-US")} active
              campaigns · {escrow.data.counts.completed.toLocaleString("en-US")}{" "}
              completed · {escrow.data.counts.refunded.toLocaleString("en-US")}{" "}
              failed
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Failed campaigns are counted by campaign status; this does not
              confirm that backers have claimed refunds.
            </p>
            <SnapshotTime asOf={escrow.data.asOf} readAt={view.readAt} />
          </>
        )}
      </section>

      <section
        aria-labelledby="platform-analytics"
        className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="platform-analytics" className="text-lg font-bold text-ink">
              Platform analytics
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              {view.range.from} to {view.range.to}, inclusive UTC dates.
            </p>
          </div>
          <form
            action="/admin"
            method="get"
            className="flex flex-wrap items-end gap-2"
          >
            <div>
              <label
                htmlFor="overview-period"
                className="mb-1 block text-xs font-medium text-muted"
              >
                Activity period
              </label>
              <select
                id="overview-period"
                name="period"
                defaultValue={view.period}
                className="min-h-11 rounded-xl border border-border bg-surface px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {OVERVIEW_PERIODS.map((period) => (
                  <option key={period} value={period}>
                    Last {period} days
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Apply period
            </Button>
          </form>
        </div>
        {analytics.status === "unavailable" ? (
          <UnavailableReport reason={analytics.reason} />
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <MetricCard
                label="Page views"
                value={analytics.data.totals.views.toLocaleString("en-US")}
              />
              <MetricCard
                label={
                  analytics.data.totals.uniqueSessionsExact
                    ? "Unique sessions"
                    : "Daily sessions (summed)"
                }
                value={analytics.data.totals.uniqueSessions.toLocaleString(
                  "en-US",
                )}
                hint={
                  analytics.data.totals.uniqueSessionsExact
                    ? "Distinct sessions across this date range."
                    : "A session seen on multiple days can be counted more than once."
                }
              />
            </div>
            {analytics.data.resources.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="mb-2 text-left text-sm font-semibold text-ink">
                    Activity by resource
                  </caption>
                  <thead className="border-b border-border text-xs text-muted">
                    <tr>
                      <th scope="col" className="py-2 pr-3 font-medium">
                        Resource
                      </th>
                      <th
                        scope="col"
                        className="px-2 py-2 text-right font-medium"
                      >
                        Views
                      </th>
                      <th
                        scope="col"
                        className="py-2 pl-2 text-right font-medium"
                      >
                        Daily sessions (summed)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {analytics.data.resources.map((row) => (
                      <tr key={row.resourceType}>
                        <th
                          scope="row"
                          className="py-3 pr-3 font-medium text-ink"
                        >
                          {resourceLabels[row.resourceType]}
                        </th>
                        <td className="px-2 py-3 text-right tabular-nums text-ink">
                          {row.views.toLocaleString("en-US")}
                        </td>
                        <td className="py-3 pl-2 text-right tabular-nums text-ink">
                          {row.uniqueSessions.toLocaleString("en-US")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Resource session counts sum daily uniques and can count the
                  same session on more than one day.
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-muted">
                No resource activity was reported for this period.
              </p>
            )}
            <p className="mt-4 text-xs leading-5 text-muted">
              Report generated:{" "}
              <time dateTime={analytics.data.generatedAt}>
                {overviewTimestamp(analytics.data.generatedAt)}
              </time>
              .
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">
              {analytics.data.lastAggregatedDay
                ? `Latest aggregated day: ${analytics.data.lastAggregatedDay} UTC. More recent activity may not be included.`
                : "No daily aggregation has been reported yet. Activity totals may be incomplete."}
            </p>
          </>
        )}
      </section>
    </div>
  );
}
