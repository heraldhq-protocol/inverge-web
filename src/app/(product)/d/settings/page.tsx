import type { Metadata } from "next";
import Link from "next/link";

import { SettingsDashboard } from "@/features/settings/components/settings-dashboard";
import { settingsPreviewData } from "@/features/settings/content/preview-data";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your Inverge profile and account preferences.",
};

export default function SettingsPage() {
  const access = getProgrammeAdminAccess();

  // The entry only appears when the server gate allows it, so a signed-out or
  // non-admin visitor never sees a link to a workspace they cannot open.
  const adminEntry = access.allowed ? (
    <section
      aria-labelledby="admin-access"
      className="mt-7 rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="admin-access" className="text-sm font-bold text-ink">
            Programme administration
          </h2>
          <p className="mt-1 max-w-xl text-xs leading-5 text-muted">
            {access.reason}
          </p>
        </div>
        <Link
          href="/admin/programmes"
          className="inline-flex min-h-10 items-center rounded-xl border border-border px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Open workspace
        </Link>
      </div>
    </section>
  ) : null;

  return (
    <SettingsDashboard adminEntry={adminEntry} data={settingsPreviewData} />
  );
}
