import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export function CampaignDetailLoading() {
  return (
    <Container
      className="py-6 sm:py-8"
      role="status"
      aria-label="Loading campaign"
    >
      <Skeleton className="h-3 w-64 rounded-full" />

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
        <div>
          <Skeleton className="aspect-video rounded-3xl" />
          <div className="mt-5 flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-10 w-full max-w-2xl rounded-xl" />
          <Skeleton className="mt-3 h-5 w-full max-w-xl rounded-lg" />
          <Skeleton className="mt-6 h-14 w-full rounded-2xl" />
          <div className="mt-8 space-y-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        </div>
        <div className="hidden lg:block">
          <Skeleton className="h-96 rounded-3xl" />
          <Skeleton className="mt-4 h-72 rounded-3xl" />
        </div>
      </div>
      <span className="sr-only">Loading campaign</span>
    </Container>
  );
}
