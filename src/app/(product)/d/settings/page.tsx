import type { Metadata } from "next";
import Link from "next/link";

import { SettingsDashboard } from "@/features/settings/components/settings-dashboard";
import { verificationBadge } from "@/features/settings/lib/verification";
import { getSettingsData } from "@/features/settings/server/settings";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Manage your Inverge profile, sign-in methods, email, verification, wallet, feed, notifications and account.",
};

export default async function SettingsPage() {
  const [access, data] = await Promise.all([
    getProgrammeAdminAccess(),
    getSettingsData(),
  ]);

  // The entry only appears when the server gate allows it, so a signed-out or
  // non-admin visitor never sees a link to a workspace they cannot open.
  const adminEntry = access.allowed ? (
    <section
      aria-labelledby="admin-access"
      className="rounded-2xl border border-border bg-surface p-4"
    >
      <div>
        <h2 id="admin-access" className="text-sm font-bold text-ink">
          Programme administration
        </h2>
        <p className="mt-1 text-xs leading-5 text-muted">{access.reason}</p>
      </div>
      <Link
        href="/admin/programmes"
        className="mt-3 inline-flex min-h-10 items-center rounded-xl border border-border px-3.5 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Open workspace
      </Link>
    </section>
  ) : null;

  return (
    <SettingsDashboard
      adminEntry={adminEntry}
      data={data}
      verification={verificationBadge(data.verification)}
    />
  );
}
