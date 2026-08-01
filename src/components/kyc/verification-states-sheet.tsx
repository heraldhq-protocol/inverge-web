'use client';

import React from 'react';
import { VerificationCard, type VerificationState } from './verification-card';

const STATES: { label: string; state: VerificationState }[] = [
  { label: 'CHECKING', state: 'CHECKING' },
  { label: 'IN REVIEW', state: 'IN_REVIEW' },
  { label: 'VERIFIED', state: 'VERIFIED' },
  { label: 'DECLINED', state: 'DECLINED' },
  { label: 'FLAGGED', state: 'FLAGGED' },
];

/**
 * Verification States Sheet.
 *
 * Implements Screen 8b from app-screen-prompts.md:
 * A developer annotations sheet stacking the verification card across all 5 possible states.
 */
export function VerificationStatesSheet() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-10 py-6">
      {STATES.map(({ label, state }) => (
        <div key={state} className="space-y-2">
          {/* Monospace state annotation label */}
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-muted/80 block pl-1">
            {label}
          </span>
          <VerificationCard state={state} />
        </div>
      ))}
    </div>
  );
}
