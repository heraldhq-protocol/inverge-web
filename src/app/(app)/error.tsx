'use client';

import { Button } from '@/components/ui/button';

/**
 * Group-level recovery.
 *
 * `unstable_retry` is a **prop** on the error component (verified against next 16.2.10:
 * `dist/client/components/builtin/global-error.d.ts` types it alongside `error` and `reset`), not an
 * import. Prefer it over `reset()`: reset only clears error state and re-renders children, which
 * does nothing when the failure came from a fetch. retry refreshes the route inside a transition, so
 * the data is actually re-read.
 *
 * Never render the error message or a stack trace to a user (conventions §7).
 */
export default function AppError({
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
}) {
  const recover = unstable_retry ?? reset;

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
        We could not load this just now
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        Nothing is lost. Try again, and if it keeps happening it is on our side, not yours.
      </p>
      <div className="mt-6 flex justify-center">
        <Button variant="primary" size="md" onClick={() => recover()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
