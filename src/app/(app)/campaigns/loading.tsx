import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';
import { CampaignCardSkeleton } from '@/components/campaigns/campaign-card';

/** Dimensions match the real page so nothing shifts when data lands (conventions §7, §10). */
export default function CampaignsLoading() {
  return (
    <LoadingRegion label="Loading campaigns">
      <div className="space-y-10">
        <div className="max-w-2xl space-y-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-full" />
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-border pt-4">
            <Skeleton className="h-3 w-80 max-w-full" />
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-6 w-64" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CampaignCardSkeleton key={i} />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-full" />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CampaignCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </LoadingRegion>
  );
}
