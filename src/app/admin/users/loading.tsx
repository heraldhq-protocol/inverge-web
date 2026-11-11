import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

export default function AdminUsersLoading() {
  return (
    <LoadingRegion label="Loading users and roles">
      <div className="mx-auto w-full max-w-7xl">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-8 w-52 sm:h-9" />
        <Skeleton className="mt-2 h-5 w-96 max-w-full" />
        <div className="mt-6 rounded-2xl border border-border bg-surface">
          <div className="flex flex-col gap-3 p-4 sm:px-5 xl:flex-row xl:justify-between">
            <Skeleton className="h-12 w-full xl:order-2 xl:w-80" />
            <div className="grid grid-cols-2 gap-1 sm:flex sm:flex-wrap xl:order-1">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-11 sm:w-24" />
              ))}
            </div>
          </div>
          <div className="hidden h-9 border-t border-border bg-canvas/60 md:block" />
          <div className="divide-y divide-border border-t border-border">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="grid gap-3 px-4 py-4 sm:px-5 md:grid-cols-[minmax(0,1fr)_11rem_8.5rem] md:items-center md:gap-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Skeleton className="size-10 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <Skeleton
                      className={`h-4 max-w-full ${index % 2 === 0 ? "w-52" : "w-44"}`}
                    />
                    <Skeleton className="mt-2 h-3 w-56 max-w-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 md:contents">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-11 w-32 md:justify-self-end" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-11 w-44" />
          </div>
        </div>
      </div>
    </LoadingRegion>
  );
}
