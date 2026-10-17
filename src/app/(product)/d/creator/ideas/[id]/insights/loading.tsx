import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <Container className="py-5 sm:py-6" role="status" aria-label="Loading analytics">
      <Skeleton className="h-3 w-64 rounded-full" />
      <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
        <div className="flex gap-4">
          <Skeleton className="hidden h-24 w-32 rounded-xl sm:block" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-7 w-2/3 rounded-lg" />
            <Skeleton className="h-4 w-full max-w-lg rounded-md" />
          </div>
        </div>
        <Skeleton className="mt-4 h-9 w-full rounded-lg" />
      </div>
      <div className="mt-4 flex gap-3 border-b border-border pb-3">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-6 w-20 rounded-md" />
        ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      <span className="sr-only">Loading analytics</span>
    </Container>
  );
}
