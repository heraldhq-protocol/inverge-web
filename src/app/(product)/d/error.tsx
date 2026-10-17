"use client";

import { useEffect } from "react";

/**
 * Route-group error boundary for every dashboard screen.
 *
 * Fixtures are read on the server, so a failure here is a render failure rather
 * than a user input problem: the only honest recovery is a retry, and the
 * message never leaks internals to the viewer.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        Something went wrong
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-foreground">
        This screen could not load
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        The dashboard ran into a problem while rendering. Try again, and if it
        keeps failing, come back in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Try again
      </button>
    </div>
  );
}
