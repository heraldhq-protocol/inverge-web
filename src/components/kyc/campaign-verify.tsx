'use client';

import { useState } from 'react';
import { VerifyBusiness } from './verify-business';
import { VerifyIdentity } from './verify-identity';

const tab = (active: boolean) =>
  `rounded-full px-4 py-1 transition ${
    active ? 'bg-foreground text-background' : 'text-foreground/60 hover:text-foreground'
  }`;

// Creators can verify as an individual (KYC + AML) or as a business (KYB + AML). Either path,
// once cleared, makes the account eligible to create and back campaigns.
export function CampaignVerify() {
  const [mode, setMode] = useState<'individual' | 'business'>('individual');
  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-full border border-foreground/15 p-0.5 text-sm">
        <button onClick={() => setMode('individual')} className={tab(mode === 'individual')}>
          As an individual
        </button>
        <button onClick={() => setMode('business')} className={tab(mode === 'business')}>
          As a business
        </button>
      </div>
      {mode === 'individual' ? <VerifyIdentity purpose="CAMPAIGN_CREATOR" /> : <VerifyBusiness />}
    </div>
  );
}
