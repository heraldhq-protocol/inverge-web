import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

export default function LoadingBoostPrices() {
  return (
    <LoadingRegion label="Loading boost pricing">
      <div className="mx-auto w-full max-w-7xl">
        <Skeleton className="h-8 w-60 max-w-full sm:h-9" />
        <Skeleton className="mt-2 h-6 w-full max-w-xl" />
        <div className="mt-6 rounded-xl border border-border bg-surface">
          <div className="grid divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
            {[0, 1].map((tier) => (
              <div key={tier} className="p-5 sm:p-6">
                <Skeleton className="h-6 w-32 max-w-full" />
                <Skeleton className="mt-3 h-5 w-60 max-w-full" />
                <Skeleton className="mt-7 h-12 w-full" />
                <Skeleton className="mt-7 h-12 w-full" />
              </div>
            ))}
          </div>
          <div className="border-t border-border p-5 sm:p-6">
            <Skeleton className="h-5 w-full max-w-xl" />
            <Skeleton className="mt-5 h-12 w-48 max-w-full" />
          </div>
        </div>
      </div>
    </LoadingRegion>
  );
}
