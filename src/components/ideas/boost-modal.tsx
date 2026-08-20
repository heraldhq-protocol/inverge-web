'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { getSessionToken } from '@/lib/api/client';
import { env } from '@/lib/env';

interface BoostModalProps {
  isOpen: boolean;
  ideaId: string;
  ideaTitle: string;
  discoverabilityTier?: 'LINK_ONLY' | 'DISCOVERABLE' | 'FEATURED';
  onClose: () => void;
}

export function BoostModal({
  isOpen,
  ideaId,
  ideaTitle,
  discoverabilityTier = 'DISCOVERABLE',
  onClose,
}: BoostModalProps) {
  const [tier, setTier] = useState<'BASIC' | 'FEATURED'>('BASIC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const isLinkOnly = discoverabilityTier === 'LINK_ONLY';

  const handlePurchase = async () => {
    if (isLinkOnly) return;
    setLoading(true);
    setError(null);

    try {
      if (!env.useFixtures) {
        const token = getSessionToken();
        const res = await fetch(`${env.apiUrl}/ideas/${ideaId}/boosts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ tier }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Boost purchase failed');
        }
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to complete boost purchase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-paper p-6 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              FR-206 Placement Upgrade
            </span>
            <h2 className="font-display text-xl font-bold text-ink">
              Boost Placement: &ldquo;{ideaTitle}&rdquo;
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:text-ink text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* FR-274 Quality Floor Precondition Check */}
        {isLinkOnly ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-700">⚠️ Quality Floor Precondition (FR-274)</span>
            </div>
            <p className="text-xs leading-relaxed">
              Paid boosts cannot be purchased while an idea is at the <strong>LINK_ONLY</strong> discoverability tier. This ensures paid visibility cannot launder low-effort content.
            </p>
            <p className="text-xs font-medium text-amber-800">
              Coaching Tip: Add specific target user details and complete at least 2 dated roadmap steps to elevate your idea to the Discoverable tier.
            </p>
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={onClose} className="w-full">
                Close & Edit Pitch
              </Button>
            </div>
          </div>
        ) : success ? (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 text-center space-y-3">
            <span className="text-3xl">🎉</span>
            <h3 className="font-bold text-lg">Boost Active!</h3>
            <p className="text-xs text-emerald-900">
              Your idea placement has been upgraded to <strong>{tier}</strong>. Promoted placement affects discovery ranking only and never alters your behavioural validation metrics (FR-206a).
            </p>
            <Button variant="primary" size="sm" onClick={onClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-xs text-ink-muted leading-relaxed">
              Paid visibility applies a flat placement upgrade in category browse surfaces. Boosted placement is clearly labeled as promoted and does not alter public supporter or pledge metrics.
            </p>

            {/* Tier Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTier('BASIC')}
                className={`rounded-xl border p-4 text-left transition-all ${
                  tier === 'BASIC'
                    ? 'border-accent-500 bg-accent-50/60 ring-2 ring-accent-500/20'
                    : 'border-border bg-surface hover:bg-paper'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-ink">Basic Boost</span>
                  <Pill tone={tier === 'BASIC' ? 'accent' : 'neutral'} size="sm">
                    7 Days
                  </Pill>
                </div>
                <p className="mt-2 text-xs text-ink-muted">Category feed rotation boost.</p>
                <div className="mt-3 font-display font-bold text-base text-ink">₦10,000 / $15</div>
              </button>

              <button
                type="button"
                onClick={() => setTier('FEATURED')}
                className={`rounded-xl border p-4 text-left transition-all ${
                  tier === 'FEATURED'
                    ? 'border-accent-500 bg-accent-50/60 ring-2 ring-accent-500/20'
                    : 'border-border bg-surface hover:bg-paper'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-ink">Featured Boost</span>
                  <Pill tone={tier === 'FEATURED' ? 'accent' : 'neutral'} size="sm">
                    14 Days
                  </Pill>
                </div>
                <p className="mt-2 text-xs text-ink-muted">Homepage + top category placement.</p>
                <div className="mt-3 font-display font-bold text-base text-ink">₦25,000 / $35</div>
              </button>
            </div>

            {error && (
              <p className="rounded-lg border border-danger-300 bg-danger-50 p-3 text-xs text-danger-800">
                {error}
              </p>
            )}

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handlePurchase}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Confirm ${tier} Boost`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
