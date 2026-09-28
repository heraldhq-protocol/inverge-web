function Skeleton({ className }: { className: string }) {
  return <div className={`rounded-xl bg-border/70 ${className}`} />;
}

export default function HomeLoading() {
  return (
    <div
      className="mx-auto w-full max-w-[90rem] animate-none px-4 py-5 motion-safe:animate-pulse sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10"
      aria-label="Loading your Inverge home"
      role="status"
    >
      <span className="sr-only">Loading your Inverge home</span>
      <Skeleton className="h-12 max-w-2xl" />
      <div className="mt-10 border-b border-border pb-8">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-4 h-9 w-72 max-w-full" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        <div className="mt-8 grid max-w-2xl grid-cols-3 gap-5">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      </div>
      <Skeleton className="mt-8 h-6 w-56" />
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-96 xl:col-span-2" />
        <Skeleton className="h-96" />
      </div>
      <Skeleton className="mt-8 h-52" />
    </div>
  );
}
