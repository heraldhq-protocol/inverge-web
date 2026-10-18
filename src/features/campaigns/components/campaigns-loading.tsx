import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export function CampaignsLoading() {
  return (
    <Container
      className="py-8 sm:py-10"
      role="status"
      aria-label="Loading campaigns"
    >
      <Skeleton className="h-3 w-40 rounded-full" />
      <Skeleton className="mt-4 h-12 w-full max-w-xl rounded-xl" />
      <Skeleton className="mt-3 h-5 w-full max-w-lg rounded-lg" />

      <Skeleton className="mt-7 h-56 rounded-3xl sm:h-64" />

      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl lg:w-48" />
        <Skeleton className="h-12 w-full rounded-xl lg:w-52" />
      </div>
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-28 rounded-full" />
        ))}
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <Skeleton className="aspect-video rounded-none" />
            <div className="space-y-2 p-5">
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="h-5 w-4/5 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-9 w-2/3 rounded-full" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading campaigns</span>
    </Container>
  );
}
