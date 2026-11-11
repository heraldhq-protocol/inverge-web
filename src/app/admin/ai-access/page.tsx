import type { Metadata } from "next";

import {
  AdminPageHeader,
  AdminUnavailable,
} from "@/features/admin/components/admin-workspace-ui";
import { AiAccessQueue } from "@/features/admin/components/ai-access-queue";
import { RefreshAdminData } from "@/features/admin/components/refresh-admin-data";
import { parseAiAccessQuery } from "@/features/admin/lib/ai-access";
import { listAiAccessRequests } from "@/features/admin/server/ai-access";

export const metadata: Metadata = {
  title: "AI access requests",
  description: "Review requests for the Creator Studio assistant.",
  robots: { index: false, follow: false },
};

export default async function AiAccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseAiAccessQuery(await searchParams);
  const result = await listAiAccessRequests(query);
  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdminPageHeader
        title="AI access requests"
        description="Review who can use the Creator Studio assistant and set an optional access expiry."
      >
        <RefreshAdminData label="Refresh requests" />
      </AdminPageHeader>
      {result.status === "ready" ? (
        <AiAccessQueue
          requests={result.data}
          query={query}
          asOf={new Date().toISOString()}
        />
      ) : (
        <AdminUnavailable message={result.message} />
      )}
    </div>
  );
}
