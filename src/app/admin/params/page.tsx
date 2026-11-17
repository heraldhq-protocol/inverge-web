import type { Metadata } from "next";

import {
  AdminPageHeader,
  AdminUnavailable,
} from "@/features/admin/components/admin-workspace-ui";
import { PlatformParamsEditor } from "@/features/admin/components/platform-params-editor";
import { RefreshAdminData } from "@/features/admin/components/refresh-admin-data";
import {
  getPlatformParams,
  getPlatformParamsAudit,
} from "@/features/admin/server/params";

export const metadata: Metadata = {
  title: "Runtime Parameters",
  description: "Inspect and update live operational parameters across platform services.",
  robots: { index: false, follow: false },
};

export default async function AdminParamsPage() {
  const [paramsResult, auditResult] = await Promise.all([
    getPlatformParams(),
    getPlatformParamsAudit({ limit: 100 }),
  ]);

  if (paramsResult.status !== "ready") {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <AdminPageHeader
          title="Runtime Parameters"
          description="Inspect and update live operational parameters across platform services."
        />
        <AdminUnavailable message={paramsResult.message} />
      </div>
    );
  }

  const auditEntries = auditResult.status === "ready" ? auditResult.data : [];

  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdminPageHeader
        title="Runtime Parameters"
        description="Inspect and update live operational parameters across platform services."
      >
        <RefreshAdminData label="Refresh parameters" />
      </AdminPageHeader>
      <PlatformParamsEditor
        initialParams={paramsResult.data}
        initialAudit={auditEntries}
      />
    </div>
  );
}
