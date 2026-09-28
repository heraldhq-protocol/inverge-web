function Skeleton({ className }: { className: string }) {
  return <div className={`rounded-xl bg-border/70 ${className}`} />;
}

export default function SettingsLoading() {
  return (
    <div
      className="mx-auto w-full max-w-[90rem] px-4 py-5 motion-safe:animate-pulse sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10"
      aria-label="Loading settings"
      role="status"
    >
      <span className="sr-only">Loading settings</span>
      <Skeleton className="h-12 max-w-2xl" />
      <div className="mt-10">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-4 h-9 w-56" />
        <Skeleton className="mt-3 h-4 w-[32rem] max-w-full" />
      </div>
      <div className="mt-8 flex gap-2 overflow-hidden border-y border-border py-2">
        <Skeleton className="h-10 w-24 shrink-0" />
        <Skeleton className="h-10 w-24 shrink-0" />
        <Skeleton className="h-10 w-28 shrink-0" />
        <Skeleton className="h-10 w-24 shrink-0" />
      </div>
      <div className="mt-10 max-w-5xl space-y-10">
        <div>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-3 h-72 w-full" />
        </div>
        <div>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="mt-3 h-52 w-full" />
        </div>
      </div>
    </div>
  );
}
