'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { Skeleton } from '@/components/ui/skeleton';

export type VerificationState = 'CHECKING' | 'IN_REVIEW' | 'VERIFIED' | 'DECLINED' | 'FLAGGED';

export interface VerificationCardProps {
  state: VerificationState;
  companyName?: string;
  timestamp?: string;
  onContinue?: () => void;
  onSubmitCampaign?: () => void;
  onRetry?: () => void;
  onContactSupport?: () => void;
}

/**
 * Factual Verification State Card.
 *
 * Designed in strict compliance with app-screen-prompts.md Screen 8b:
 * - Pure white card with warm hairline border.
 * - Closed status pill vocabulary (Checking, In review, Verified, Declined, On hold).
 * - No shields, padlocks, warning triangles, or confetti graphics.
 */
export function VerificationCard({
  state,
  companyName = 'CampusKonekt Technologies Ltd',
  timestamp,
  onContinue,
  onSubmitCampaign,
  onRetry,
  onContactSupport,
}: VerificationCardProps) {
  if (state === 'CHECKING') {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Pill tone="neutral" size="sm">
            Checking
          </Pill>
        </div>
        <Skeleton className="h-4 w-full max-w-md rounded-md" />
        <Skeleton className="h-10 w-44 rounded-full mt-2" />
      </div>
    );
  }

  if (state === 'IN_REVIEW') {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
            Verification in progress
          </h3>
          <Pill tone="neutral" size="sm">
            In review
          </Pill>
        </div>
        <p className="text-sm leading-relaxed text-ink-muted max-w-xl">
          You started this with our verification partner but didn&apos;t finish. Pick up where you left off — it takes about 5 minutes.
        </p>
        <div className="pt-2">
          <Button variant="primary" size="md" onClick={onContinue} href="/verify/session">
            Continue business verification
          </Button>
        </div>
        <p className="text-xs text-ink-muted pt-1">
          {timestamp ?? 'Started 2 August, 14:20'}
        </p>
      </div>
    );
  }

  if (state === 'VERIFIED') {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
            Business verified
          </h3>
          <Pill tone="accent" size="sm">
            Verified
          </Pill>
        </div>
        <p className="text-sm leading-relaxed text-ink-muted max-w-xl">
          {companyName} is verified. You can submit a campaign now.
        </p>
        <div className="pt-2">
          <Button variant="primary" size="md" onClick={onSubmitCampaign} href="/ideas/new">
            Submit a campaign
          </Button>
        </div>
        <p className="text-xs text-ink-muted pt-1">
          {timestamp ?? 'Verified 2 August 2026'}
        </p>
      </div>
    );
  }

  if (state === 'DECLINED') {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
            We couldn&apos;t verify this business
          </h3>
          <Pill tone="danger" size="sm">
            Declined
          </Pill>
        </div>
        <p className="text-sm leading-relaxed text-ink-muted max-w-xl">
          The details you gave didn&apos;t match the company register. Check the legal name and registration number against your certificate, then try again.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button variant="primary" size="md" onClick={onRetry}>
            Try again
          </Button>
          <Button variant="outline" size="md" onClick={onContactSupport}>
            Contact support
          </Button>
        </div>
      </div>
    );
  }

  // FLAGGED / On Hold State
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
          This needs a person to look at it
        </h3>
        <Pill tone="danger" size="sm">
          On hold
        </Pill>
      </div>
      <p className="text-sm leading-relaxed text-ink-muted max-w-xl">
        Our screening flagged something we can&apos;t resolve automatically. Email{' '}
        <a href="mailto:support@inverge.africa" className="font-medium text-ink underline hover:text-accent-700">
          support@inverge.africa
        </a>{' '}
        and we&apos;ll sort it out — most cases clear within two working days.
      </p>
      <div className="pt-2">
        <Button variant="outline" size="md" onClick={onContactSupport}>
          Contact support
        </Button>
      </div>
    </div>
  );
}
