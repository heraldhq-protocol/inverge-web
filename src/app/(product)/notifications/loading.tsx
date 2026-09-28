function Skeleton({ className }: { className: string }) {
  return <div className={`rounded-xl bg-border/70 ${className}`} />;
}

export default function NotificationsLoading() {
  return (
    <div
      className="mx-auto w-full max-w-[90rem] px-4 py-5 motion-safe:animate-pulse sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10"
      aria-label="Loading notifications"
      role="status"
    >
      <span className="sr-only">Loading notifications</span>
      <Skeleton className="h-12 max-w-2xl" />
      <div className="mt-10">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-4 h-9 w-64 max-w-full" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      </div>
      <div className="mt-8 border-b border-border pb-3">
        <Skeleton className="ml-auto h-10 w-36" />
        <div className="mt-2 flex gap-6">
          <Skeleton className="h-10 w-12" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <Skeleton className="mt-8 h-4 w-20" />
      <div className="mt-3 space-y-px overflow-hidden rounded-2xl border border-border bg-border">
        <Skeleton className="h-40 rounded-none sm:h-32" />
        <Skeleton className="h-40 rounded-none sm:h-32" />
        <Skeleton className="h-40 rounded-none sm:h-32" />
      </div>
    </div>
  );
}
