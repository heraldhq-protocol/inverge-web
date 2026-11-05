import type { Metadata } from "next";

import {
  AdminPageHeader,
  AdminUnavailable,
} from "@/features/admin/components/admin-workspace-ui";
import { AnalyticsAccessQueue } from "@/features/admin/components/analytics-access-queue";
import { RefreshAdminData } from "@/features/admin/components/refresh-admin-data";
import {
  analyticsAccessHref,
  parseAnalyticsAccessQuery,
} from "@/features/admin/lib/analytics-access";
import { listAnalyticsAccessRequests } from "@/features/admin/server/analytics-access";

export const metadata: Metadata = {
  title: "Analytics access requests",
  description: "Review and manage access to premium creator reports.",
  robots: { index: false, follow: false },
};

export default async function AnalyticsAccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseAnalyticsAccessQuery(await searchParams);
  const result = await listAnalyticsAccessRequests(query);
  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdminPageHeader
        title="Analytics access requests"
        description="Review creator requests for premium reports, update an expiry, or revoke an existing grant."
      >
        <RefreshAdminData label="Refresh requests" />
      </AdminPageHeader>
      {result.status === "ready" ? (
        <AnalyticsAccessQueue
          list={result.data}
          query={query}
          asOf={new Date().toISOString()}
        />
      ) : (
        <AdminUnavailable
          message={result.message}
          resetHref={analyticsAccessHref({
            status: query.status,
            limit: query.limit,
          })}
        />
      )}
    </div>
  );
}
