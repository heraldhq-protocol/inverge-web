import { Container } from "@/components/ui/container";
import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

/**
 * Catalogue skeleton. Dimensions mirror the hero, nav and first card list so a
 * slow API does not cause the page to jump when data arrives.
 */
export default function IdeathonLoading() {
  return (
    <LoadingRegion label="Loading ideathon programmes">
      <div className="border-b border-white/10 bg-contrast">
        <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16 lg:py-20">
          <div>
            <Skeleton className="h-3 w-40 bg-white/20" />
            <Skeleton className="mt-5 h-16 w-full max-w-xl bg-white/20 sm:h-24" />
            <Skeleton className="mt-3 h-16 w-full max-w-lg bg-white/20 sm:h-20" />
            <Skeleton className="mt-6 h-4 w-full max-w-lg bg-white/15" />
            <Skeleton className="mt-2 h-4 w-3/4 max-w-md bg-white/15" />
            <Skeleton className="mt-7 h-12 w-48 bg-white/20" />
          </div>
          <div className="border border-white/15 p-5">
            <Skeleton className="h-3 w-28 bg-white/20" />
            <Skeleton className="mt-4 h-8 w-4/5 bg-white/20" />
            <Skeleton className="mt-2 h-8 w-3/5 bg-white/20" />
            <Skeleton className="mt-3 h-4 w-full bg-white/15" />
            <Skeleton className="mt-5 h-4 w-2/3 bg-white/15" />
          </div>
        </Container>
      </div>
      <Container>
        <div className="flex gap-6 border-b border-border py-4">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-4 w-24" />
          ))}
        </div>
        <div className="py-10 sm:py-12">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-9 w-64" />
          <div className="mt-6 grid gap-x-10 lg:grid-cols-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="border-t border-border py-5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="mt-4 h-7 w-4/5" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-5 h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </LoadingRegion>
  );
}
