'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { getSessionToken } from '@/lib/api/client';
import {
  BusinessEligibility,
  getBusinessEligibility,
  startBusinessSession,
} from '@/lib/kyc/kyb-api';

const btn =
  'rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-40';
const field =
  'w-full rounded-lg border border-foreground/15 bg-transparent px-3 py-1.5 text-sm';

// Business verification: register the company + run Didit KYB (registry, documents,
// directors/UBOs, AML). Funds-eligible on KYB VERIFIED + AML CLEAR — no separate personal KYC.
export function VerifyBusiness() {
  const [signedIn, setSignedIn] = useState(false);
  const [elig, setElig] = useState<BusinessEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [legalName, setLegalName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [country, setCountry] = useState('');

  const refresh = useCallback(async () => {
    if (!getSessionToken()) {
      setSignedIn(false);
      setLoading(false);
      return;
    }
    setSignedIn(true);
    setLoading(true);
    try {
      setElig(await getBusinessEligibility());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { verificationUrl } = await startBusinessSession({
        legalName: legalName.trim(),
        registrationNumber: registrationNumber.trim() || undefined,
        country: country.trim() || undefined,
      });
      window.location.href = verificationUrl;
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  if (!signedIn) {
    return (
      <div className="rounded-xl border border-foreground/10 p-4 text-sm text-foreground/60">
        Sign in to verify a business.
      </div>
    );
  }
  if (loading || !elig) {
    return (
      <div className="rounded-xl border border-foreground/10 p-4 text-sm text-foreground/50">
        Checking business verification…
      </div>
    );
  }
  if (elig.registered && elig.eligible) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
        <span className="font-medium text-emerald-600">Business verified.</span>{' '}
        <span className="text-foreground/60">Your business can create and back campaigns.</span>
      </div>
    );
  }

  const flagged = elig.registered && elig.amlStatus === 'FLAGGED';
  const pending =
    elig.registered && (elig.kybStatus === 'PENDING' || elig.amlStatus === 'IN_REVIEW');

  return (
    <div className="space-y-3 rounded-xl border border-foreground/10 p-4">
      <div>
        <h3 className="text-sm font-semibold">Verify your business</h3>
        <p className="mt-1 text-sm text-foreground/60">
          We verify the company’s registry, documents, directors/UBOs and run AML screening.
          No separate personal ID check is needed.
        </p>
      </div>

      {elig.reasons.length > 0 && !flagged && (
        <ul className="space-y-1 text-xs text-foreground/50">
          {elig.reasons.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      )}

      {flagged ? (
        <p className="text-sm text-red-600">
          This business was flagged during screening. Contact support to review.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-2">
          <input
            className={field}
            placeholder="Registered legal name *"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            required
            minLength={2}
            aria-label="Legal name"
          />
          <div className="flex gap-2">
            <input
              className={field}
              placeholder="Registration number"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              aria-label="Registration number"
            />
            <input
              className={`${field} max-w-28`}
              placeholder="Country (ISO)"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              maxLength={3}
              aria-label="Country"
            />
          </div>
          <button type="submit" disabled={busy || legalName.trim().length < 2} className={btn}>
            {busy ? 'Starting…' : pending ? 'Continue business verification' : 'Start business verification'}
          </button>
        </form>
      )}

      {pending && (
        <p className="text-xs text-foreground/40">
          A verification is in progress. Finish it in the provider window, then return here.
        </p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
