'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSessionToken } from '@/lib/api/client';
import {
  getKycEligibility,
  KycEligibility,
  KycPurpose,
  startKycSession,
} from './kyc-api';

// Loads eligibility for a purpose and exposes a `start()` that kicks off the hosted flow and
// redirects the browser to the provider. Reused by the idea-validation and campaign surfaces.
export function useKyc(purpose: KycPurpose) {
  const [signedIn, setSignedIn] = useState(false);
  const [eligibility, setEligibility] = useState<KycEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!getSessionToken()) {
      setSignedIn(false);
      setLoading(false);
      return;
    }
    setSignedIn(true);
    setLoading(true);
    try {
      setEligibility(await getKycEligibility(purpose));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [purpose]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const start = useCallback(async () => {
    setStarting(true);
    setError(null);
    try {
      const { verificationUrl } = await startKycSession(purpose);
      window.location.href = verificationUrl; // hand off to the hosted verification flow
    } catch (e) {
      setError((e as Error).message);
      setStarting(false);
    }
  }, [purpose]);

  return { signedIn, eligibility, loading, starting, error, start, refresh };
}
