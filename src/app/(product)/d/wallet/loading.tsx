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
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-3 h-4 w-[28rem] max-w-full" />
      <div className="mt-5 flex gap-2 overflow-hidden border-b border-border py-2">
        <Skeleton className="h-9 w-24 shrink-0" />
        <Skeleton className="h-9 w-24 shrink-0" />
        <Skeleton className="h-9 w-24 shrink-0" />
      </div>
      <Skeleton className="mt-6 h-52 w-full rounded-3xl" />
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    </div>
  );
}
