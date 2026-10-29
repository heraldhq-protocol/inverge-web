import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { StatePanel } from "@/components/ui/state-panel";
import { readSessionUser } from "@/features/auth/server/session-user";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";
import { SettingsDashboard } from "@/features/settings/components/settings-dashboard";
import { getSettingsView } from "@/features/settings/server/settings";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your Inverge profile and account preferences.",
};

export default async function SettingsPage() {
  const [access, user, result] = await Promise.all([
    getProgrammeAdminAccess(),
    readSessionUser(),
    getSettingsView(),
  ]);

  if (result.status === "signed_out") {
    redirect(`/auth?next=${encodeURIComponent("/d/settings")}`);
  }

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

  if (result.status === "unavailable") {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <StatePanel
          variant="error"
          eyebrow="Settings unavailable"
          title="We couldn't load your account"
          description={result.reason}
          action={
            <Link
              href="/d/settings"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Try again
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <SettingsDashboard
      adminEntry={adminEntry}
      data={result.view.data}
      dataSource={result.view.dataSource}
      email={user?.email ?? null}
      emailVerified={user?.emailVerified === true}
    />
  );
}
