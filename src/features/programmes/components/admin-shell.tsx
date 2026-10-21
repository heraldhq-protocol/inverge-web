import Link from "next/link";

import { BrandMark } from "@/components/shared/brand-mark";
import { IconTile } from "@/components/ui/icon-tile";
import { HugeiconsIcon } from "@hugeicons/react";
import { SecurityCheckIcon } from "@hugeicons/core-free-icons";
import {
  AdminBackLink,
  AdminMobileNavigation,
  AdminNavigation,
} from "@/features/programmes/components/admin-navigation";
import type { ProgrammeAdminAccess } from "@/features/programmes/server/access";

/**
 * Admin chrome. It is deliberately narrower than the product shell so the
 * workspace reads as an operating surface, not a second product. The preview
 * banner states the persistence boundary on every page.
 */
export function AdminShell({
  access,
  children,
}: {
  access: Extract<ProgrammeAdminAccess, { allowed: true }>;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col bg-contrast px-4 py-6 text-white lg:flex">
        <div className="px-1">
          <BrandMark href="/admin" inverted />
        </div>
        <div className="mt-7 flex items-center gap-2 px-2">
          <span className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-white/45">
            Admin workspace
          </span>
        </div>
        <div className="mt-3">
          <AdminNavigation />
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={SecurityCheckIcon}
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
              className="text-brand"
            />
            <p className="text-[0.6875rem] font-semibold text-white">
              {access.preview ? "Preview access" : "Authorised admin"}
            </p>
          </div>
          <p className="mt-1 text-[0.625rem] leading-4 text-white/55">
            {access.preview
              ? "Server writes are not connected. Actions update this browser only."
              : "Privileged actions are authorised again by the API."}
          </p>
        </div>

        <div className="mt-auto space-y-3">
          <AdminBackLink />
          <div className="flex items-center gap-2 rounded-xl px-2 py-1.5">
            <span className="grid size-9 place-items-center rounded-full bg-brand/20 text-xs font-bold text-white">
              {access.actor.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">
                {access.actor.name}
              </p>
              <p className="truncate text-[0.625rem] text-white/50">
                {access.actor.role.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/75 bg-canvas/92 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <BrandMark href="/admin" />
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              <IconTile icon={SecurityCheckIcon} size="sm" tone="soft" />
              <p className="text-xs text-muted">
                Campaign curation, programmes, and platform operations
              </p>
            </div>
            <span className="rounded-full bg-warning/10 px-2.5 py-1 text-[0.625rem] font-semibold text-warning-strong">
              {access.preview ? "Preview · not persisted" : "Authorised"}
            </span>
          </div>
          <AdminMobileNavigation />
        </header>
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 xl:px-10">
          {children}
        </main>
        <footer className="border-t border-border px-4 py-4 text-[0.6875rem] text-muted sm:px-6 lg:px-8">
          Inverge admin workspace. Campaign decisions and programme figures are
          preview data until the API is connected. No money moves from this
          workspace.
        </footer>
      </div>
    </div>
  );
}

export function AdminAccessDenied({ reason }: { reason: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-warning/10 text-warning-strong">
          <HugeiconsIcon
            icon={SecurityCheckIcon}
            size={22}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <h1 className="mt-3 text-xl font-bold tracking-[-0.03em] text-ink">
          Admin access required
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">{reason}</p>
        <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-[0.6875rem] leading-4 text-muted">
          Authorization is enforced by the API AdminGuard. Hiding a link is not
          authorization.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link
            href="/auth"
            className="inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Sign in
          </Link>
          <Link
            href="/ideas"
            className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-brand/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Back to ideas
          </Link>
        </div>
      </div>
    </div>
  );
}
