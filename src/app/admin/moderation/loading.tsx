import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

export default function LoadingModeration() {
  return (
    <LoadingRegion label="Loading moderation screening">
      <div className="mx-auto w-full max-w-7xl">
        <Skeleton className="h-8 w-72 max-w-full sm:h-9" />
        <Skeleton className="mt-2 h-6 w-full max-w-xl" />
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
            <Skeleton className="h-6 w-48 max-w-full" />
            <Skeleton className="mt-6 h-12 w-full" />
            <Skeleton className="mt-5 h-12 w-full" />
            <Skeleton className="mt-5 h-60 w-full" />
            <Skeleton className="mt-5 h-12 w-40 max-w-full" />
          </div>
          <Skeleton className="h-36 w-full rounded-xl" />
        </div>
      </div>
    </LoadingRegion>
  );
}
