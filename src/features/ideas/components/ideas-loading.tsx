import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export function IdeasLoading() {
  return (
    <Container
      className="py-8 sm:py-10"
      role="status"
      aria-label="Loading ideas"
    >
      <div className="mb-7 grid items-center gap-7 lg:grid-cols-2">
        <div>
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="mt-4 h-12 w-full max-w-lg rounded-xl" />
          <Skeleton className="mt-3 h-5 w-full max-w-md rounded-lg" />
          <div className="mt-6 grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-12 rounded-xl" />
            ))}
          </div>
        </div>
        <Skeleton className="h-72 rounded-2xl sm:h-80" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
        <Skeleton className="hidden h-[34rem] rounded-2xl lg:block" />
        <div>
          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <Skeleton className="h-10 w-full max-w-xs rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
          <div className="mt-4 flex gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-8 w-24 rounded-lg" />
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-border bg-surface"
              >
                <Skeleton className="aspect-[16/10] rounded-none" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-3 w-20 rounded-full" />
                  <Skeleton className="h-5 w-4/5 rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-8 w-2/3 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">Loading ideas</span>
    </Container>
  );
}
