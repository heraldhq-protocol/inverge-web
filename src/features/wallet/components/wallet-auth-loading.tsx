import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

/**
 * The shape the sign-in card settles into, so loading does not shift the page.
 * The browser-only SDK is loaded after this renders and never during SSR.
 */
export function WalletAuthLoading() {
  return (
    <section
      aria-labelledby="wallet-signin-title"
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <h2
        id="wallet-signin-title"
        className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
      >
        Your account
      </h2>
      <LoadingRegion label="Preparing sign-in">
        <div className="mt-3 space-y-2">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-11 w-full max-w-64" />
        </div>
      </LoadingRegion>
    </section>
  );
}
