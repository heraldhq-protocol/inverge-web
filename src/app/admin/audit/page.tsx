import { HugeiconsIcon } from "@hugeicons/react";
import { Shield01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { AdminAuditLog } from "@/features/campaigns/components/admin-audit-log";
import { previewAuditEntries } from "@/features/programmes/content/preview-programmes";
import { ROLE_PERMISSIONS } from "@/features/programmes/types";

export default function AdminAuditPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdminAuditLog previewEntries={previewAuditEntries} />

      <section className="mt-4 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={Shield01Icon}
            size={16}
            strokeWidth={1.8}
            aria-hidden="true"
            className="text-brand-strong"
          />
          <h2 className="text-sm font-bold text-ink">Role permissions</h2>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => (
            <div key={role} className="rounded-xl border border-border p-3">
              <p className="text-xs font-semibold capitalize text-ink">
                {role.replace("_", " ")}
              </p>
              <ul className="mt-1 space-y-0.5">
                {permissions.map((permission) => (
                  <li key={permission} className="text-[0.625rem] text-muted">
                    {permission}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[0.625rem] leading-4 text-muted">
          A hidden UI control is not authorization. The API AdminGuard and
          per-programme checks decide every privileged action.
        </p>
      </section>

      <div className="mt-4">
        <Link
          href="/admin/programmes"
          className="inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-4 text-xs font-semibold text-ink hover:border-brand/35 focus-visible:outline-2 focus-visible:outline-brand"
        >
          Back to programmes
        </Link>
      </div>
    </div>
  );
}
