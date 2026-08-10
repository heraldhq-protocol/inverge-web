'use client';

import React from 'react';
import { Pill } from '@/components/ui/pill';

export interface SimulatedFeedbackState {
  supporterCount: number;
  rawPrePledgeTotalUsd: number;
  weightedPrePledgeTotalUsd: number;
  surveyResponseCount: number;
  feedbackScore: number;
  uniqueViews: number;
  conversionRate: number;
  gateMet: boolean;
  timeseries: Array<{ day: string; views: number; visitors: number }>;
  backerQuotes: Array<{
    author: string;
    role: string;
    location: string;
    quote: string;
    pledge: string;
  }>;
}

export interface FeedbackSimulatorProps {
  onApplyPreset: (preset: 'positive' | 'mixed' | 'weak') => void;
  onAddRandomSignal: () => void;
  onReset: () => void;
  activePreset: 'positive' | 'mixed' | 'weak' | 'custom' | null;
}

export function FeedbackSimulator({
  onApplyPreset,
  onAddRandomSignal,
  onReset,
  activePreset,
}: FeedbackSimulatorProps) {
  return (
    <div className="rounded-2xl border border-accent-500/30 bg-accent-500/5 p-4 shadow-2xs space-y-3 text-ink">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-accent-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-accent-500 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-accent-700">
            Feedback &amp; Validation Test Simulator
          </h3>
          <span className="text-[11px] text-ink-muted hidden sm:inline">
            (Generate test survey feedback &amp; pre-pledges to view dynamic Insights reactions)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddRandomSignal}
            className="rounded-lg bg-surface border border-accent-500/40 px-2.5 py-1 text-xs font-semibold text-accent-900 hover:bg-accent-50 transition cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <span>+ Add 1 Random Backer Signal</span>
          </button>

          {activePreset && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-semibold text-ink-muted hover:text-danger-700 hover:underline transition cursor-pointer"
            >
              Reset baseline
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-3">
        {/* Positive Surge Preset */}
        <button
          type="button"
          onClick={() => onApplyPreset('positive')}
          className={`flex flex-col text-left rounded-xl p-3 border transition-all cursor-pointer ${
            activePreset === 'positive'
              ? 'border-accent-500 bg-surface ring-2 ring-accent-500/20 shadow-xs'
              : 'border-border bg-surface/80 hover:border-accent-500/40 hover:bg-surface'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-ink">🚀 Positive Surge</span>
            <Pill tone="accent" size="xs">
              Threshold Met
            </Pill>
          </div>
          <p className="text-[11px] leading-relaxed text-ink-muted">
            Simulate 45+ verified backers, 4.8 rating, $4,850 USDC pre-pledges. Pass all graduation gates.
          </p>
        </button>

        {/* Mixed Feedback Preset */}
        <button
          type="button"
          onClick={() => onApplyPreset('mixed')}
          className={`flex flex-col text-left rounded-xl p-3 border transition-all cursor-pointer ${
            activePreset === 'mixed'
              ? 'border-accent-500 bg-surface ring-2 ring-accent-500/20 shadow-xs'
              : 'border-border bg-surface/80 hover:border-accent-500/40 hover:bg-surface'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-ink">⚡ Mixed Community</span>
            <Pill tone="neutral" size="xs">
              Mid-Flight
            </Pill>
          </div>
          <p className="text-[11px] leading-relaxed text-ink-muted">
            Simulate 18 supporters, 3.8 rating, $1,250 USDC pre-pledges. Partial gate progress (60%).
          </p>
        </button>

        {/* Critical / Weak Preset */}
        <button
          type="button"
          onClick={() => onApplyPreset('weak')}
          className={`flex flex-col text-left rounded-xl p-3 border transition-all cursor-pointer ${
            activePreset === 'weak'
              ? 'border-accent-500 bg-surface ring-2 ring-accent-500/20 shadow-xs'
              : 'border-border bg-surface/80 hover:border-accent-500/40 hover:bg-surface'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-ink">⚠️ Critical / Low Ratings</span>
            <Pill tone="danger" size="xs">
              Gate Unmet
            </Pill>
          </div>
          <p className="text-[11px] leading-relaxed text-ink-muted">
            Simulate 6 supporters, low 2.2 rating, $150 USDC pre-pledges. High skepticism, gate un-met.
          </p>
        </button>
      </div>
    </div>
  );
}
