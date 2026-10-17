import { HugeiconsIcon } from "@hugeicons/react";
import { Note01Icon, Shield01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Eyebrow } from "@/components/ui/eyebrow";
import { Pill } from "@/components/ui/pill";
import { previewAuditEntries } from "@/features/programmes/content/preview-programmes";
import { ROLE_PERMISSIONS } from "@/features/programmes/types";
import { formatProgrammeDate } from "@/features/programmes/lib/programme";

export default function AdminAuditPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <header>
        <Eyebrow>Audit</Eyebrow>
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
          Audit history
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted">
          Sensitive changes record the actor, time, action, target, and
          before/after state. The API must append these records; a client-side
          toggle is not an audit trail.
        </p>
      </header>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand-strong">
            <HugeiconsIcon icon={Note01Icon} size={17} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-ink">Preview records</h2>
            <p className="text-[0.6875rem] text-muted">
              Workspace edits in this browser are not shown here because they are
              local. Preview entries below are sample data.
            </p>
          </div>
        </div>
        <ul className="mt-3 divide-y divide-border">
          {previewAuditEntries.map((entry) => (
            <li key={entry.id} className="py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{entry.action}</p>
                <time className="text-[0.625rem] tabular-nums text-muted" dateTime={entry.at}>
                  {formatProgrammeDate(entry.at, true)}
                </time>
              </div>
              <p className="mt-0.5 text-[0.6875rem] text-muted">
                {entry.actor} · {entry.actorRole.replace("_", " ")} · {entry.target}
              </p>
              {entry.before || entry.after ? (
                <p className="mt-1 rounded-lg bg-canvas px-2.5 py-1.5 text-[0.625rem] text-muted">
                  {entry.before ?? "—"} → {entry.after ?? "—"}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

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

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/programmes"
          className="inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-4 text-xs font-semibold text-ink hover:border-brand/35 focus-visible:outline-2 focus-visible:outline-brand"
        >
          Back to programmes
        </Link>
        <Pill size="xs" tone="neutral">Preview environment</Pill>
      </div>
    </div>
  );
}
