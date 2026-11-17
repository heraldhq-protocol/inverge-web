import type { Metadata } from "next";

import {
  AdminPageHeader,
  AdminUnavailable,
} from "@/features/admin/components/admin-workspace-ui";
import { EditorialEmailComposer } from "@/features/admin/components/editorial-email-composer";
import { RefreshAdminData } from "@/features/admin/components/refresh-admin-data";
import { getEmailTemplates } from "@/features/admin/server/editorial-email";

export const metadata: Metadata = {
  title: "Editorial Email Tools",
  description: "Preview and dispatch editorial issues to subscribed accounts.",
  robots: { index: false, follow: false },
};

export default async function AdminEditorialEmailPage() {
  const result = await getEmailTemplates();

  if (result.status !== "ready") {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <AdminPageHeader
          title="Editorial Email Tools"
          description="Preview and dispatch editorial newsletters and community highlights to subscribed builders."
        />
        <AdminUnavailable message={result.message} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdminPageHeader
        title="Editorial Email Tools"
        description="Preview and dispatch editorial newsletters and community highlights to subscribed builders."
      >
        <RefreshAdminData label="Refresh templates" />
      </AdminPageHeader>
      <EditorialEmailComposer templates={result.data} />
    </div>
  );
}
