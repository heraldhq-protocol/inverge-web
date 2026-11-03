import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

export default function CampaignReviewLoading() {
  return (
    <LoadingRegion label="Loading campaign review">
      <div className="mx-auto max-w-7xl space-y-4">
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-12 w-80 max-w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </LoadingRegion>
  );
}
