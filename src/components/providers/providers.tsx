'use client';

import { useEffect } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { api, setSessionToken, clearSessionToken } from '@/lib/api/client';
import { env, isPrivyConfigured } from '@/lib/env';
import { QueryProvider } from './query-provider';

// Watches Privy auth state and exchanges the provider token for an Inverge session
// (POST /auth/session). Centralised here so pages never touch the exchange directly.
function SessionSync() {
  const { ready, authenticated, getAccessToken } = usePrivy();
  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      clearSessionToken();
      return;
    }
    let cancelled = false;
    void (async () => {
      const token = await getAccessToken();
      if (!token || cancelled) return;
      const { data } = await api.POST('/auth/session', {
        body: { accessToken: token },
      });
      const sessionToken = (data as { sessionToken?: string } | undefined)?.sessionToken;
      if (sessionToken && !cancelled) setSessionToken(sessionToken);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, authenticated, getAccessToken]);
  return null;
}

// Single confinement point for the Privy SDK. When Privy isn't configured, the app
// still renders (public browsing works); only auth-gated actions are unavailable.
export function Providers({ children }: { children: React.ReactNode }) {
  // Query sits outside the auth check: discovery pages page client-side and have no login wall, so the
  // feed must keep working when Privy is not configured.
  if (!isPrivyConfigured) return <QueryProvider>{children}</QueryProvider>;
  return (
    <QueryProvider>
      <PrivyProvider
        appId={env.privyAppId}
        config={{
          loginMethods: ['email', 'google', 'twitter'],
          embeddedWallets: { solana: { createOnLogin: 'all-users' } },
          appearance: { walletChainType: 'solana-only' },
        }}
      >
        <SessionSync />
        {children}
      </PrivyProvider>
    </QueryProvider>
  );
}
