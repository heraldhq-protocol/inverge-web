import type { ReactNode } from "react";
import Link from "next/link";

import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { RefreshAdminData } from "@/features/admin/components/refresh-admin-data";

export const adminLinkClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong";
export const adminFieldClass =
  "min-h-12 w-full min-w-0 rounded-lg border border-border-strong bg-surface px-3 text-base text-ink outline-none transition-colors focus:border-brand-strong focus:ring-2 focus:ring-brand-strong/15 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm";

export function AdminPageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          {description}
        </p>
      </div>
      {children}
    </header>
  );
}

export function AdminUnavailable({
  message,
  resetHref,
}: {
  message: string;
  resetHref?: string;
}) {
  return (
    <section className="mt-6 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <div role="alert">
        <h2 className="text-lg font-semibold text-ink">
          This view is unavailable
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">
          {message}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <RefreshAdminData label="Try again" />
        {resetHref ? (
          <Link href={resetHref} className={adminLinkClass}>
            Back to first page
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export function AdminRequestsLoading({ label }: { label: string }) {
  return (
    <LoadingRegion label={label}>
      <div className="mx-auto w-full max-w-7xl">
        <Skeleton className="h-8 w-64 max-w-full sm:h-9" />
        <Skeleton className="mt-2 h-6 w-full max-w-xl" />
        <div className="mt-6 rounded-xl border border-border bg-surface">
          <div className="grid grid-cols-2 gap-2 p-4 sm:flex">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-11 sm:w-24" />
            ))}
          </div>
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="flex flex-wrap items-center justify-between gap-4 border-t border-border p-5"
            >
              <div className="min-w-0 flex-1">
                <Skeleton className="h-5 w-52 max-w-full" />
                <Skeleton className="mt-3 h-4 w-72 max-w-full" />
              </div>
              <Skeleton className="h-11 w-28" />
            </div>
          ))}
        </div>
      </div>
    </LoadingRegion>
  );
}
