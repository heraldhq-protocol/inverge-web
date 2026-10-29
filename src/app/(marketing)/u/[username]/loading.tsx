import { Container } from "@/components/ui/container";

export default function PublicProfileLoading() {
  return (
    <Container className="py-8 sm:py-12">
      <div
        aria-busy="true"
        aria-label="Loading profile"
        className="animate-pulse overflow-hidden rounded-3xl border border-border bg-surface"
      >
        <div className="h-24 bg-border/40 sm:h-32" />
        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-9 flex items-end gap-4 sm:-mt-12">
            <div className="size-16 rounded-full bg-border ring-4 ring-surface" />
            <div className="space-y-2 pb-1">
              <div className="h-7 w-48 rounded bg-border/60" />
              <div className="h-4 w-28 rounded bg-border/40" />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="h-4 w-full max-w-xl rounded bg-border/40" />
            <div className="h-4 w-2/3 max-w-md rounded bg-border/40" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-5 border-t border-border pt-5 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-6 w-16 rounded bg-border/60" />
                <div className="h-3 w-24 rounded bg-border/40" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="h-56 animate-pulse rounded-2xl border border-border bg-surface"
          />
        ))}
      </div>
    </Container>
  );
}
