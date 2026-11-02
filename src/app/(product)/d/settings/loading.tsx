function Skeleton({ className }: { className: string }) {
  return <div className={`rounded-xl bg-border/70 ${className}`} />;
}

export default function SettingsLoading() {
  return (
    <div
      className="mx-auto w-full max-w-7xl px-4 py-5 motion-safe:animate-pulse sm:px-6 sm:py-6 lg:px-8 lg:py-7 xl:px-10"
      aria-label="Loading settings"
      role="status"
    >
      <span className="sr-only">Loading settings</span>
      <Skeleton className="h-44 w-full rounded-2xl sm:h-48" />
      <Skeleton className="mt-4 h-32 w-full rounded-2xl" />
      <div className="mt-4 flex gap-2 overflow-hidden rounded-xl border border-border/70 px-2 py-2.5">
        <Skeleton className="h-10 w-24 shrink-0" />
        <Skeleton className="h-10 w-24 shrink-0" />
        <Skeleton className="h-10 w-20 shrink-0" />
        <Skeleton className="h-10 w-28 shrink-0" />
        <Skeleton className="h-10 w-24 shrink-0" />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="mt-5 h-40 w-full" />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="mt-5 h-44 w-full" />
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="mt-5 h-44 w-full" />
            </div>
          </div>
        </div>
        <div className="hidden rounded-2xl border border-border bg-surface p-5 xl:block">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-4 h-32 w-full" />
          <Skeleton className="mt-4 h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
