'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';

export interface QualityCheckItem {
  id: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  kind?: 'deterministic' | 'ai';
}

export interface QualityReportData {
  score: number; // 0..1
  discoverabilityTier: 'LINK_ONLY' | 'DISCOVERABLE' | 'FEATURED';
  checks: QualityCheckItem[];
}

interface QualityReportModalProps {
  isOpen: boolean;
  report: QualityReportData | null;
  ideaTitle: string;
  onClose: () => void;
}

export function QualityReportModal({
  isOpen,
  report,
  ideaTitle,
  onClose,
}: QualityReportModalProps) {
  if (!isOpen || !report) return null;

  const scorePct = Math.round((report.score ?? 0.75) * 100);
  const isDiscoverable = report.discoverabilityTier !== 'LINK_ONLY';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-paper p-6 shadow-xl space-y-6">
        {/* Header */}
        <div className="space-y-1.5 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              FR-271 Quality & Discoverability Report
            </span>
            <Pill
              tone={isDiscoverable ? 'accent' : 'neutral'}
              size="sm"
            >
              {report.discoverabilityTier}
            </Pill>
          </div>
          <h2 className="font-display text-xl font-bold text-ink">
            Coaching Feedback: &ldquo;{ideaTitle}&rdquo;
          </h2>
          <p className="text-xs text-ink-muted">
            Automated quality checks guide you to maximize backer discovery. Your idea is always published via direct URL.
          </p>
        </div>

        {/* Score & Tier Status */}
        <div className="flex items-center justify-between rounded-xl bg-accent-50/50 p-4 border border-accent-200/60">
          <div>
            <span className="text-xs font-medium text-ink-muted">Quality Score</span>
            <div className="font-display text-3xl font-extrabold text-accent-700">
              {scorePct}<span className="text-base font-normal text-ink-muted">/100</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-ink-muted">Browse Visibility</span>
            <p className="text-sm font-semibold text-ink">
              {isDiscoverable
                ? 'Visible in search & category feeds'
                : 'Direct URL only (link-only tier)'}
            </p>
          </div>
        </div>

        {/* Quality Checks / Coaching Suggestions */}
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          <h3 className="text-xs font-semibold uppercase text-ink-muted tracking-wider">
            Automated Checks ({report.checks.filter((c) => c.passed).length}/{report.checks.length} passed)
          </h3>
          <div className="space-y-2">
            {report.checks.map((check, idx) => (
              <div
                key={check.id || idx}
                className={`flex items-start gap-3 rounded-lg p-3 text-xs border ${
                  check.passed
                    ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
                    : 'border-amber-200 bg-amber-50/50 text-amber-950'
                }`}
              >
                <span
                  className={`mt-0.5 shrink-0 font-bold ${
                    check.passed ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {check.passed ? '✓' : '▲'}
                </span>
                <div className="space-y-0.5">
                  <p className="font-medium">{check.message}</p>
                  {!check.passed && (
                    <p className="text-[11px] opacity-80">
                      Coaching tip: Expand this section to improve your score and elevate discoverability.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Continue to Idea Page →
          </Button>
        </div>
      </div>
    </div>
  );
}
