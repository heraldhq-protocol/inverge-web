import { Skeleton } from "@/components/ui/skeleton";

/**
 * Home skeleton.
 *
 * Mirrors the live layout — header, featured band, action row, momentum grid,
 * and right rail — so the greeting and banner do not jump when data resolves.
 * `d/loading.tsx` covers the other dashboard routes; this one exists only
 * because home has a richer first screen.
 */
export default function HomeLoading() {
  return (
    <div
      className="mx-auto w-full max-w-[92rem] px-4 py-5 motion-safe:animate-pulse sm:px-6 sm:py-6 lg:px-8 xl:px-10"
      role="status"
      aria-label="Loading your Inverge home"
    >
      <span className="sr-only">Loading your Inverge home</span>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem] xl:gap-7">
        <div className="min-w-0 space-y-5">
          <div>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-3 h-9 w-80 max-w-full" />
            <Skeleton className="mt-2 h-4 w-[28rem] max-w-full" />
          </div>
          <Skeleton className="h-64 rounded-3xl" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
          <Skeleton className="h-6 w-56" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
        <div className="hidden space-y-4 xl:block">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
