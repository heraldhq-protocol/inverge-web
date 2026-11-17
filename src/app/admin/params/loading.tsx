import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

export default function LoadingAdminParams() {
  return (
    <LoadingRegion label="Loading runtime parameters">
      <div className="mx-auto w-full max-w-7xl">
        <Skeleton className="h-8 w-60 max-w-full sm:h-9" />
        <Skeleton className="mt-2 h-6 w-full max-w-xl" />
        <div className="mt-6 grid items-start gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </LoadingRegion>
  );
}
