'use client';

import { useKyc } from '@/lib/kyc/use-kyc';
import type { KycPurpose } from '@/lib/kyc/kyc-api';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';

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
      'Creators receive funds, so campaign submission requires identity verification and AML screening.',
    cta: 'Start creator verification',
  },
  BACKER_THRESHOLD: {
    title: 'Verify to keep funding',
    blurb:
      'You’ve reached the funding threshold that requires verification before contributing further.',
    cta: 'Verify to continue',
  },
};

/**
 * Purpose-aware verification card. Renders current state and, when needed, a button that
 * starts the hosted flow and redirects. Drop it into any surface that gates on KYC/AML.
 */
export function VerifyIdentity({ purpose }: { purpose: KycPurpose }) {
  const { signedIn, eligibility, loading, starting, error, start } = useKyc(purpose);
  const copy = COPY[purpose];

  if (!signedIn) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-ink-muted">
        Sign in to verify your identity.
      </div>
    );
  }

  if (loading || !eligibility) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-ink-muted">
        Checking verification status…
      </div>
    );
  }

  if (eligibility.eligible) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-2">
        <div className="flex items-center justify-between gap-4">
          <span className="font-semibold text-ink">Verified</span>
          <Pill tone="accent" size="sm">Verified</Pill>
        </div>
        <p className="text-sm text-ink-muted">
          {purpose === 'IDEA_VALIDATION'
            ? 'Your pledges now carry full weight.'
            : 'You’re cleared to proceed.'}
        </p>
      </div>
    );
  }

  const rejected = eligibility.kycStatus === 'REJECTED';
  const flagged = eligibility.amlStatus === 'FLAGGED';
  const pending =
    eligibility.kycStatus === 'PENDING' || eligibility.amlStatus === 'IN_REVIEW';

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-ink text-lg">{copy.title}</h3>
          <p className="mt-1 text-sm text-ink-muted">{copy.blurb}</p>
        </div>
        <Pill tone={flagged || rejected ? 'danger' : pending ? 'neutral' : 'accent'} size="sm">
          {flagged ? 'On hold' : rejected ? 'Declined' : pending ? 'In review' : 'Action needed'}
        </Pill>
      </div>

      {eligibility.reasons.length > 0 && (
        <ul className="space-y-1 text-xs text-ink-muted">
          {eligibility.reasons.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      )}

      {flagged ? (
        <p className="text-sm text-danger font-medium">
          This account was flagged during screening. Email support@inverge.africa to review.
        </p>
      ) : (
        <Button variant="primary" size="md" onClick={start} disabled={starting}>
          {starting
            ? 'Starting…'
            : pending || rejected
              ? 'Continue verification'
              : copy.cta}
        </Button>
      )}

      {pending && (
        <p className="text-xs text-ink-muted">
          A verification is in progress. Finish it in the provider window, then return here.
        </p>
      )}
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}
