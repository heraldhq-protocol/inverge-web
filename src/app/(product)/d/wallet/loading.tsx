function Skeleton({ className }: { className: string }) {
  return <div className={`rounded-xl bg-border/70 ${className}`} />;
}

export default function WalletLoading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-5 motion-safe:animate-pulse sm:px-6 sm:py-7 lg:px-8 xl:px-10"
      aria-label="Loading your wallet"
      role="status"
    >
      <span className="sr-only">Loading your wallet</span>
      <div className="flex gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="mt-3 h-10 w-44" />
      <Skeleton className="mt-3 h-4 w-[32rem] max-w-full" />
      <Skeleton className="mt-2 h-3 w-[26rem] max-w-full" />
      <div className="mt-6 flex gap-2 overflow-hidden border-b border-border py-2">
        <Skeleton className="h-10 w-24 shrink-0" />
        <Skeleton className="h-10 w-24 shrink-0" />
        <Skeleton className="h-10 w-24 shrink-0" />
        <Skeleton className="h-10 w-24 shrink-0" />
        <Skeleton className="h-10 w-24 shrink-0" />
        <Skeleton className="h-10 w-24 shrink-0" />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
      <Skeleton className="mt-6 h-52 w-full" />
    </div>
  );
}
