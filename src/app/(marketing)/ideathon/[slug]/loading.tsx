import { Container } from "@/components/ui/container";
import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

/** Detail skeleton matching the two-column hero and section rhythm. */
export default function ProgrammeDetailLoading() {
  return (
    <LoadingRegion label="Loading programme">
      <section className="border-b border-border bg-surface">
        <Container className="py-8 sm:py-10 lg:py-12">
          <Skeleton className="h-3 w-28" />
          <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div>
              <Skeleton className="h-5 w-40 rounded-full" />
              <Skeleton className="mt-4 h-12 w-full max-w-xl" />
              <Skeleton className="mt-2 h-12 w-3/4 max-w-lg" />
              <Skeleton className="mt-4 h-5 w-full max-w-2xl" />
              <Skeleton className="mt-2 h-5 w-2/3 max-w-xl" />
              <div className="mt-6 grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
                {[0, 1, 2].map((item) => (
                  <div key={item}>
                    <Skeleton className="h-2.5 w-16" />
                    <Skeleton className="mt-2 h-4 w-28" />
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-border bg-canvas p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-4 w-48" />
              <Skeleton className="mt-4 h-11 w-full" />
              <Skeleton className="mt-4 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-2/3" />
            </div>
          </div>
        </Container>
      </section>
      <Container>
        <div className="flex gap-6 border-b border-border py-4">
          {[0, 1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-4 w-20" />
          ))}
        </div>
        <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-14">
          <div className="space-y-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-8 h-3 w-24" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="border border-border p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-3/4" />
            <Skeleton className="mt-2 h-3 w-2/3" />
          </div>
        </div>
      </Container>
    </LoadingRegion>
  );
}
