import { getSessionToken } from '@/lib/api/client';

// Small dedicated KYC/AML client. Uses the shared session token + API base URL. Responses are
// hand-typed here (same convention as lib/api/types.ts) so we don't depend on regenerating the
// OpenAPI schema for these routes.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// Why the user is verifying — picks the provider workflow on the backend:
//   IDEA_VALIDATION  → identity only (unlocks the VERIFIED pre-pledge tier)
//   CAMPAIGN_CREATOR → identity + AML (required to submit a campaign, FR-103)
//   BACKER_THRESHOLD → identity + AML (required past the funding threshold, FR-104)
export type KycPurpose = 'IDEA_VALIDATION' | 'CAMPAIGN_CREATOR' | 'BACKER_THRESHOLD';

export type KycStatusValue = 'NOT_REQUIRED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type AmlStatusValue = 'NOT_SCREENED' | 'CLEAR' | 'IN_REVIEW' | 'FLAGGED';

export type KycStatus = {
  kycStatus: KycStatusValue;
  amlStatus: AmlStatusValue;
  amlScreenedAt: string | null;
};

export type KycEligibility = {
  purpose: KycPurpose;
  eligible: boolean;
  kycStatus: KycStatusValue;
  amlStatus: AmlStatusValue;
  reasons: string[];
};

export type StartSessionResult = {
  providerRef: string;
  verificationUrl: string;
  purpose: KycPurpose;
};

async function authed<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getSessionToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`KYC request failed (${res.status}): ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export function getKycStatus(): Promise<KycStatus> {
  return authed<KycStatus>('/kyc/status');
}

export function getKycEligibility(purpose: KycPurpose): Promise<KycEligibility> {
  return authed<KycEligibility>(`/kyc/eligibility?purpose=${encodeURIComponent(purpose)}`);
}

export function startKycSession(purpose: KycPurpose): Promise<StartSessionResult> {
  return authed<StartSessionResult>('/kyc/session', {
    method: 'POST',
    body: JSON.stringify({ purpose }),
  });
}
