function Skeleton({ className }: { className: string }) {
  return <div className={`rounded-xl bg-border/70 ${className}`} />;
}

export default function PrePledgesLoading() {
  return (
    <div
      className="mx-auto w-full max-w-[90rem] px-4 py-5 motion-safe:animate-pulse sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10"
      aria-label="Loading your pre-pledges"
      role="status"
    >
      <span className="sr-only">Loading your pre-pledges</span>
      <Skeleton className="h-12 max-w-2xl" />
      <div className="mt-10 border-b border-border pb-8">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-4 h-9 w-72 max-w-full" />
        <Skeleton className="mt-3 h-4 w-[32rem] max-w-full" />
        <div className="mt-8 grid max-w-2xl grid-cols-3 gap-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
        <Skeleton className="mt-7 h-16 w-full" />
      </div>
      <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <Skeleton className="mt-9 h-6 w-48" />
      <div className="mt-4 space-y-px overflow-hidden rounded-2xl border border-border bg-border">
        <Skeleton className="h-40 rounded-none sm:h-32" />
        <Skeleton className="h-40 rounded-none sm:h-32" />
        <Skeleton className="h-40 rounded-none sm:h-32" />
      </div>
    </div>
  );
}
