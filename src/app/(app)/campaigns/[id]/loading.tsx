import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';

/** Dimensions match the real page so nothing shifts when data lands (conventions §7, §10). */
export default function CampaignDetailLoading() {
  return (
    <LoadingRegion label="Loading campaign">
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="h-10 w-3/4 max-w-xl" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="min-w-0 space-y-6">
            <Skeleton className="aspect-[16/9] w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-11 w-full" />
            <div className="grid gap-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-xl" />
              ))}
            </div>
          </div>

          <Skeleton className="hidden h-96 rounded-xl lg:block" />
        </div>
      </div>
    </LoadingRegion>
  );
}
