'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { getSessionToken } from '@/lib/api/client';
import { env } from '@/lib/env';

export interface UserProfile {
  id: string;
  privyDid: string;
  email: string | null;
  requiresOnboarding?: boolean;
  wallets?: Array<{
    id: string;
    address: string;
    provider: string;
    isEmbedded: boolean;
    role: string;
  }>;
  creatorProfile?: {
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
  } | null;
  creator?: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    bio: string | null;
  };
}

export async function fetchMe(): Promise<UserProfile | null> {
  const token = getSessionToken();
  if (!token) return null;

  try {
    const res = await fetch(`${env.apiUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[use-user] Failed to fetch current user profile:', err);
    return null;
  }
}

export function useCurrentUser() {
  const { authenticated } = useAuth();
  return useQuery({
    queryKey: ['me', authenticated],
    queryFn: fetchMe,
    enabled: authenticated,
    staleTime: 30_000,
  });
}
