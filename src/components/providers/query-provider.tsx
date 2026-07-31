'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * TanStack Query, for the surfaces that page client-side.
 *
 * The client is created inside `useState` rather than at module scope: a module-level client is shared
 * across every request on the server, which leaks one user's cached feed into another's render.
 *
 * Defaults are tuned for a ranked feed. `staleTime` of a minute stops a tab-back from re-fetching a page
 * the reader is still looking at, and retries are capped at one because a failed feed read should surface
 * quickly rather than spin — the reader is on a metered connection.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
