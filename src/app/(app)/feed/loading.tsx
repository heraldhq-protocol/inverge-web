import { IdeaCardSkeleton } from '@/components/ideas/idea-card';
import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';

/** Dimensions match the real page so nothing shifts when data lands (conventions §7, §10). */
export default function FeedLoading() {
  return (
    <LoadingRegion label="Loading ideas">
      <div className="space-y-10">
        <div className="max-w-2xl space-y-3">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-full" />
        </div>

        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <IdeaCardSkeleton size="featured" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <IdeaCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-6 w-56" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <IdeaCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </LoadingRegion>
  );
}
