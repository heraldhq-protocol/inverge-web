'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';

interface QueueItem {
  id: string;
  type: 'campaign' | 'idea';
  title: string;
  creatorName: string;
  submittedAt: string;
  riskScore: number; // 0..1
  l1Status: 'PASSED' | 'FLAGGED';
  suggestedCodes: string[];
  excerpt: string;
  workingCapitalPct: number;
  milestone1Budget: number;
}

const DEMO_QUEUE: QueueItem[] = [
  {
    id: 'camp_payflex',
    type: 'campaign',
    title: 'PayFlex USSD Payment Rail',
    creatorName: 'Adebayo Anuoluwa',
    submittedAt: '10 mins ago',
    riskScore: 0.12,
    l1Status: 'PASSED',
    suggestedCodes: ['POL-FRD'],
    excerpt: 'Milestone 1 asks $15k for initial security audit and USSD gateway sandbox access.',
    workingCapitalPct: 20,
    milestone1Budget: 15000,
  },
  {
    id: 'camp_tokenized_yield',
    type: 'campaign',
    title: 'Solar Yield Return Fund',
    creatorName: 'Kamsi Okafor',
    submittedAt: '45 mins ago',
    riskScore: 0.88,
    l1Status: 'FLAGGED',
    suggestedCodes: ['POL-SEC', 'POL-AML'],
    excerpt: 'Earn 15% guaranteed annual ROI from solar panel token yields.',
    workingCapitalPct: 25,
    milestone1Budget: 25000,
  },
];

const POLICY_TAXONOMY = [
  { code: 'POL-SEC', label: 'Securities / Returns Language', desc: 'Financial return promises or ROI framing (NFR-14 / SEC Rules 2021)' },
  { code: 'POL-AML', label: 'Financial-Crime / AML Signals', desc: 'Sanctions, structuring, or suspicious wallet patterns (FR-1007)' },
  { code: 'POL-FRD', label: 'Fraud & Milestone Implausibility', desc: 'Milestone padding or un-reachable milestone-1 budget (FR-304a)' },
  { code: 'POL-CAT', label: 'Prohibited Category', desc: 'Weapons, gambling, adult content, or token launches' },
  { code: 'POL-IP', label: 'Impersonation / IP Infringement', desc: 'Unauthorized brand or identity usage' },
  { code: 'POL-MIS', label: 'Misleading Claims', desc: 'Un-evidenced traction or partnership statements' },
];

const GENERIC_AML_EXTERNAL_REASON =
  'Your submission is currently under standard security and compliance verification. Our team will contact you if additional details are required.';

export default function ReviewPage() {
  const [selectedId, setSelectedId] = useState<string>(DEMO_QUEUE[0].id);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [internalReason, setInternalReason] = useState('');
  const [externalReason, setExternalReason] = useState('');
  const [decision, setDecision] = useState<'APPROVE' | 'HOLD' | 'REJECT'>('APPROVE');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeItem = DEMO_QUEUE.find((q) => q.id === selectedId) ?? DEMO_QUEUE[0];
  const hasAmlFlag = selectedCodes.includes('POL-AML');

  const toggleCode = (code: string) => {
    setSelectedCodes((prev) => {
      const next = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code];
      if (next.includes('POL-AML')) {
        setExternalReason(GENERIC_AML_EXTERNAL_REASON);
      }
      return next;
    });
  };

  const handleDecisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCodes.length === 0 && decision !== 'APPROVE') {
      setFeedback('Error: At least one policy reason code is required (FR-1006).');
      return;
    }
    if (!internalReason.trim()) {
      setFeedback('Error: Internal audit reason is required (FR-1006).');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setFeedback(`Decision "${decision}" saved for ${activeItem.title} with policy version 2026.1 (FR-1001).`);
      setInternalReason('');
      setExternalReason('');
      setSelectedCodes([]);
    }, 500);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      <header className="border-b border-border pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Pill tone="accent" size="xs">FR-1005 Curation Queue</Pill>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Admin Moderation &amp; Curation Review
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Screen submissions against versioned policy taxonomy (POL-SEC, POL-AML, POL-FRD). No moderation component holds spending authority over escrowed funds (NFR-17).
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Queue List */}
        <div className="space-y-3 lg:col-span-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Pending Queue ({DEMO_QUEUE.length})
          </h2>
          <div className="space-y-2">
            {DEMO_QUEUE.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedId(item.id);
                  setSelectedCodes(item.suggestedCodes);
                  setFeedback(null);
                }}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  item.id === selectedId
                    ? 'border-accent-500 bg-accent-50/50 ring-2 ring-accent-500/20'
                    : 'border-border bg-surface hover:bg-paper'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-sm text-ink line-clamp-1">{item.title}</span>
                  <Pill
                    tone={item.riskScore > 0.5 ? 'neutral' : 'accent'}
                    size="xs"
                  >
                    Risk {(item.riskScore * 100).toFixed(0)}%
                  </Pill>
                </div>
                <p className="text-xs text-ink-muted">{item.creatorName} • {item.submittedAt}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Pre-Review Brief & Decision Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* FR-1005 Pre-Review Brief */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-xs font-semibold text-accent-700">FR-1005 Pre-Review Brief</span>
                <h3 className="font-display text-lg font-bold text-ink">{activeItem.title}</h3>
              </div>
              <Pill tone={activeItem.l1Status === 'PASSED' ? 'accent' : 'neutral'} size="sm">
                L1 Gate: {activeItem.l1Status}
              </Pill>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-muted">Submitting Creator:</span>
                <span className="font-medium text-ink">{activeItem.creatorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Milestone 1 Budget / Working Capital:</span>
                <span className="font-medium text-ink">
                  ${activeItem.milestone1Budget.toLocaleString()} ({activeItem.workingCapitalPct}% cap)
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-paper p-3 border border-border text-xs space-y-1">
              <span className="font-semibold text-ink-muted block text-[11px]">Flagged Excerpt:</span>
              <blockquote className="italic text-ink">&ldquo;{activeItem.excerpt}&rdquo;</blockquote>
            </div>
          </Card>

          {/* Decision & Policy Form */}
          <form onSubmit={handleDecisionSubmit} className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
            <h3 className="font-display text-base font-bold text-ink border-b border-border pb-3">
              Curator Moderation Outcome (FR-1006)
            </h3>

            {/* Decision Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Decision
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['APPROVE', 'HOLD', 'REJECT'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDecision(d)}
                    className={`rounded-lg border py-2.5 px-3 text-xs font-bold transition-all ${
                      decision === d
                        ? 'border-accent-500 bg-accent-50 text-accent-900 ring-2 ring-accent-500/20'
                        : 'border-border bg-paper text-ink hover:bg-surface'
                    }`}
                  >
                    {d === 'APPROVE' ? '✓ Approve' : d === 'HOLD' ? '⏳ Hold' : '✕ Reject'}
                  </button>
                ))}
              </div>
            </div>

            {/* Policy Code Checkboxes */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Policy Reason Codes (FR-1001 / FR-1006)
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {POLICY_TAXONOMY.map((item) => {
                  const selected = selectedCodes.includes(item.code);
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => toggleCode(item.code)}
                      className={`flex items-start gap-2.5 rounded-lg border p-3 text-left transition-all ${
                        selected
                          ? 'border-accent-500 bg-accent-50/70 text-accent-950'
                          : 'border-border bg-paper text-ink hover:bg-surface'
                      }`}
                    >
                      <span className={`mt-0.5 text-xs font-bold ${selected ? 'text-accent-700' : 'text-ink-muted'}`}>
                        {selected ? '☑' : '☐'}
                      </span>
                      <div>
                        <span className="font-semibold text-xs text-ink block">{item.code}: {item.label}</span>
                        <span className="text-[11px] text-ink-muted leading-tight block">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dual Reason Fields */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Internal Audit Reason (FR-1006 — full rationale, compliance log)
                </label>
                <textarea
                  rows={2}
                  value={internalReason}
                  onChange={(e) => setInternalReason(e.target.value)}
                  placeholder="Document specific rationale for compliance audit..."
                  className="w-full rounded-lg border border-border bg-paper p-3 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-ink">
                    External Creator-Facing Reason (FR-1006 / FR-1007)
                  </label>
                  {hasAmlFlag && (
                    <span className="text-[11px] font-bold text-amber-700">
                      🔒 Generic AML Protection Active (FR-1007)
                    </span>
                  )}
                </div>
                <textarea
                  rows={2}
                  disabled={hasAmlFlag}
                  value={hasAmlFlag ? GENERIC_AML_EXTERNAL_REASON : externalReason}
                  onChange={(e) => setExternalReason(e.target.value)}
                  placeholder="Creator-facing explanation..."
                  className={`w-full rounded-lg border border-border p-3 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
                    hasAmlFlag ? 'bg-amber-50/40 text-amber-900 border-amber-200 cursor-not-allowed' : 'bg-paper'
                  }`}
                />
                {hasAmlFlag && (
                  <p className="mt-1 text-[11px] text-amber-800">
                    FR-1007: When POL-AML is a factor, external reason uses pre-approved generic text to avoid tipping-off.
                  </p>
                )}
              </div>
            </div>

            {feedback && (
              <p className={`rounded-lg p-3 text-xs ${
                feedback.startsWith('Error')
                  ? 'border border-danger-300 bg-danger-50 text-danger-800'
                  : 'border border-emerald-300 bg-emerald-50 text-emerald-900'
              }`}>
                {feedback}
              </p>
            )}

            <div className="flex justify-end pt-2 border-t border-border">
              <Button variant="primary" size="md" type="submit" disabled={submitting}>
                {submitting ? 'Saving decision...' : 'Save Curation Decision'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
