import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <LoadingRegion label="Loading admin workspace">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-6 w-96 max-w-full" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-36" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    </LoadingRegion>
  );
}
