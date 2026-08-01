'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VerificationCard, type VerificationState } from '@/components/kyc/verification-card';
import { VerificationStatesSheet } from '@/components/kyc/verification-states-sheet';
import { VerifyIdentity } from '@/components/kyc/verify-identity';

export default function VerifyPage() {
  const [viewMode, setViewMode] = useState<'single' | 'sheet'>('sheet');
  const [activeState, setActiveState] = useState<VerificationState>('IN_REVIEW');

  return (
    <div className="mx-auto w-full max-w-3xl pb-24">
      {/* Header & Sub-navigation bar */}
      <div className="mb-8">
        <nav aria-label="Breadcrumbs" className="mb-2 flex items-center gap-1.5 text-xs text-ink-muted">
          <Link href="/feed" className="hover:text-ink transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/settings" className="hover:text-ink transition-colors">
            Settings
          </Link>
          <span>/</span>
          <span className="font-medium text-ink">Verification</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Account Verification
            </h1>
            <p className="mt-1.5 text-sm text-ink-muted">
              Verifying your business is a one-time check required to launch campaigns and receive money.
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-surface border border-border/80 rounded-full p-1 self-start shrink-0 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode('sheet')}
              className={`rounded-full px-3 py-1 transition-colors ${
                viewMode === 'sheet'
                  ? 'bg-ink text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              All States Sheet
            </button>
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`rounded-full px-3 py-1 transition-colors ${
                viewMode === 'single'
                  ? 'bg-ink text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Interactive State
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'single' ? (
        <div className="space-y-6">
          {/* Interactive State Selector */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted mr-2">
              State:
            </span>
            {(['CHECKING', 'IN_REVIEW', 'VERIFIED', 'DECLINED', 'FLAGGED'] as VerificationState[]).map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setActiveState(st)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeState === st
                      ? 'bg-accent-100/90 text-accent-900 border border-accent-500 shadow-2xs'
                      : 'bg-paper/40 text-ink border border-border hover:bg-surface'
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-muted/80 block pl-1">
              CURRENT STATE PREVIEW
            </span>
            <VerificationCard state={activeState} />
          </div>

          <div className="mt-8 pt-6 border-t border-border/80">
            <VerifyIdentity purpose="CAMPAIGN_CREATOR" />
          </div>
        </div>
      ) : (
        /* Full States Sheet View */
        <div className="space-y-6">
          <p className="text-xs text-ink-muted bg-paper/60 p-3.5 rounded-xl border border-border/50">
            Below is the full verification states sheet displaying all 5 status cards (Checking, In Review, Verified, Declined, and On Hold).
          </p>
          <VerificationStatesSheet />
        </div>
      )}

      {/* Trust Footnote */}
      <div className="mt-12 pt-6 border-t border-border/60 text-center">
        <p className="text-xs text-ink-muted">
          We never store your ID documents — only a verification reference and status.
        </p>
      </div>
    </div>
  );
}
