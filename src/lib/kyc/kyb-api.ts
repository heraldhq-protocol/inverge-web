import { getSessionToken } from '@/lib/api/client';
import type { AmlStatusValue, KycStatusValue } from './kyc-api';

// Business (KYB) client — the company analogue of kyc-api.ts. A business registers once and is
// funds-eligible (create + back campaigns) on KYB VERIFIED + AML CLEAR.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export type BusinessStatus =
  | { registered: false }
  | {
      registered: true;
      legalName: string;
      registrationNumber: string | null;
      country: string | null;
      kybStatus: KycStatusValue;
      amlStatus: AmlStatusValue;
      amlScreenedAt: string | null;
    };

export type BusinessEligibility =
  | { registered: false; eligible: false; reasons: string[] }
  | {
      registered: true;
      eligible: boolean;
      kybStatus: KycStatusValue;
      amlStatus: AmlStatusValue;
      reasons: string[];
    };

export type StartBusinessInput = {
  legalName: string;
  registrationNumber?: string;
  country?: string;
};

export type StartBusinessResult = {
  providerRef: string;
  verificationUrl: string;
  purpose: 'BUSINESS_VERIFICATION';
  businessId: string;
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
    throw new Error(`KYB request failed (${res.status}): ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export function getBusinessEligibility(): Promise<BusinessEligibility> {
  return authed<BusinessEligibility>('/kyb/eligibility');
}

export function startBusinessSession(input: StartBusinessInput): Promise<StartBusinessResult> {
  return authed<StartBusinessResult>('/kyb/session', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
