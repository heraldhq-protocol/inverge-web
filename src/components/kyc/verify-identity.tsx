'use client';

import { useKyc } from '@/lib/kyc/use-kyc';
import type { KycPurpose } from '@/lib/kyc/kyc-api';

const btn =
  'rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-40';

const COPY: Record<KycPurpose, { title: string; blurb: string; cta: string }> = {
  IDEA_VALIDATION: {
    title: 'Verify your identity',
    blurb:
      'A one-time ID + selfie check. Verified backers carry full weight in an idea’s estimated interest.',
    cta: 'Verify identity',
  },
  CAMPAIGN_CREATOR: {
    title: 'Verify to launch a campaign',
    blurb:
      'Creators receive funds, so campaign submission requires identity verification and AML screening (FR-103).',
    cta: 'Start creator verification',
  },
  BACKER_THRESHOLD: {
    title: 'Verify to keep funding',
    blurb:
      'You’ve reached the funding threshold that requires verification before contributing further (FR-104).',
    cta: 'Verify to continue',
  },
};

// Purpose-aware verification card. Renders current state and, when needed, a button that
// starts the hosted flow and redirects. Drop it into any surface that gates on KYC/AML.
export function VerifyIdentity({ purpose }: { purpose: KycPurpose }) {
  const { signedIn, eligibility, loading, starting, error, start } = useKyc(purpose);
  const copy = COPY[purpose];

  if (!signedIn) {
    return (
      <div className="rounded-xl border border-foreground/10 p-4 text-sm text-foreground/60">
        Sign in to verify your identity.
      </div>
    );
  }

  if (loading || !eligibility) {
    return (
      <div className="rounded-xl border border-foreground/10 p-4 text-sm text-foreground/50">
        Checking verification status…
      </div>
    );
  }

  if (eligibility.eligible) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
        <span className="font-medium text-emerald-600">Verified.</span>{' '}
        <span className="text-foreground/60">
          {purpose === 'IDEA_VALIDATION'
            ? 'Your pledges now carry full weight.'
            : 'You’re cleared to proceed.'}
        </span>
      </div>
    );
  }

  const rejected = eligibility.kycStatus === 'REJECTED';
  const flagged = eligibility.amlStatus === 'FLAGGED';
  const pending =
    eligibility.kycStatus === 'PENDING' || eligibility.amlStatus === 'IN_REVIEW';

  return (
    <div className="space-y-3 rounded-xl border border-foreground/10 p-4">
      <div>
        <h3 className="text-sm font-semibold">{copy.title}</h3>
        <p className="mt-1 text-sm text-foreground/60">{copy.blurb}</p>
      </div>

      {eligibility.reasons.length > 0 && (
        <ul className="space-y-1 text-xs text-foreground/50">
          {eligibility.reasons.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      )}

      {flagged ? (
        <p className="text-sm text-red-600">
          This account was flagged during screening. Contact support to review.
        </p>
      ) : (
        <button onClick={start} disabled={starting} className={btn}>
          {starting
            ? 'Starting…'
            : pending || rejected
              ? 'Continue verification'
              : copy.cta}
        </button>
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
