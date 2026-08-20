'use client';
import React, { useState } from 'react';

export function TypeSpecimen() {
  const [sampleText, setSampleText] = useState(
    'Milestone-Escrowed Crowdfunding & Idea Validation on Solana'
  );
  const [monoSample, setMonoSample] = useState(
    'Pledged: $45,820 USD (312.50 SOL) • Escrow #08492'
  );
  const [activeFont, setActiveFont] = useState<'sans' | 'mono'>('sans');

  const typeScale = [
    {
      name: 'Display XL',
      size: '56px / 3.5rem',
      lineHeight: '1.10',
      weight: '700 (Bold)',
      tracking: '-0.03em',
      family: 'Geist Sans / Display',
      className: 'text-4xl sm:text-5xl md:text-[56px] font-bold tracking-tight leading-[1.1]',
      usage: 'Hero title, primary landing header, splash statement',
    },
    {
      name: 'Display Large',
      size: '40px / 2.5rem',
      lineHeight: '1.15',
      weight: '700 (Bold)',
      tracking: '-0.025em',
      family: 'Geist Sans / Display',
      className: 'text-3xl sm:text-4xl font-bold tracking-tight leading-[1.15]',
      usage: 'Section hero, pitch campaign title, milestone banner',
    },
    {
      name: 'Heading 1',
      size: '32px / 2.0rem',
      lineHeight: '1.20',
      weight: '600 (SemiBold)',
      tracking: '-0.02em',
      family: 'Geist Sans',
      className: 'text-2xl sm:text-3xl font-semibold tracking-tight leading-tight',
      usage: 'Major card section header, page title, modal header',
    },
    {
      name: 'Heading 2',
      size: '24px / 1.5rem',
      lineHeight: '1.25',
      weight: '600 (SemiBold)',
      tracking: '-0.015em',
      family: 'Geist Sans',
      className: 'text-xl sm:text-2xl font-semibold tracking-tight leading-snug',
      usage: 'Card titles, feature headers, tab section names',
    },
    {
      name: 'Heading 3',
      size: '20px / 1.25rem',
      lineHeight: '1.30',
      weight: '600 (SemiBold)',
      tracking: '-0.01em',
      family: 'Geist Sans',
      className: 'text-lg sm:text-xl font-semibold leading-snug',
      usage: 'Subsection headers, widget titles, list item title',
    },
    {
      name: 'Body Large',
      size: '18px / 1.125rem',
      lineHeight: '1.55',
      weight: '400 (Regular)',
      tracking: 'normal',
      family: 'Geist Sans',
      className: 'text-lg leading-relaxed text-ink/90 font-normal',
      usage: 'Lead paragraphs, campaign summaries, hero subtitles',
    },
    {
      name: 'Body Base',
      size: '16px / 1.0rem',
      lineHeight: '1.50',
      weight: '400 (Regular)',
      tracking: 'normal',
      family: 'Geist Sans',
      className: 'text-base leading-normal text-ink font-normal',
      usage: 'Standard body text, descriptions, comments, form field text',
    },
    {
      name: 'Body Small',
      size: '14px / 0.875rem',
      lineHeight: '1.45',
      weight: '400 / 500',
      tracking: 'normal',
      family: 'Geist Sans',
      className: 'text-sm leading-normal text-ink-muted font-normal',
      usage: 'Labels, helper text, timestamps, table cells, secondary info',
    },
    {
      name: 'Numeric Metric',
      size: '16-24px / tabular',
      lineHeight: '1.20',
      weight: '600 (SemiBold)',
      tracking: '0em',
      family: 'Geist Mono',
      isMono: true,
      className: 'font-mono text-xl sm:text-2xl font-semibold tracking-tight text-accent-700 tabular-nums',
      usage: 'Pledge amounts, SOL values, transaction hashes, timers, milestone %',
    },
    {
      name: 'Eyebrow / Label',
      size: '12px / 0.75rem',
      lineHeight: '1.40',
      weight: '600 (SemiBold)',
      tracking: '+0.05em',
      family: 'Geist Sans',
      className: 'text-xs font-semibold uppercase tracking-wider text-accent-700',
      usage: 'Category pills, section eyebrows, status tags, metadata headers',
    },
  ];

  // Character count test for line length meter
  const longFormText =
    'Inverge connects visionary creators with aligned backers through programmatic milestone escrow smart contracts on Solana. By validating demand in Phase 0 pre-pledge rounds before releasing capital, creators gain market validation while backers retain total financial protection.';

  return (
    <div className="space-y-12">
      {/* Type Controls & Interactive Sample Input */}
      <div className="rounded-2xl bg-surface p-6 border border-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="font-bold text-lg text-ink">Interactive Type Specimen</h3>
            <p className="text-xs text-ink-muted">
              Type custom text below to preview across the Inverge typography hierarchy.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-paper p-1 rounded-xl border border-border text-xs font-medium">
            <button
              onClick={() => setActiveFont('sans')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFont === 'sans'
                  ? 'bg-accent-500 text-white font-semibold shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Geist Sans (UI & Body)
            </button>
            <button
              onClick={() => setActiveFont('mono')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFont === 'mono'
                  ? 'bg-accent-500 text-white font-semibold shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Geist Mono (Data & Financials)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1 uppercase tracking-wider">
              Sample Text (Geist Sans)
            </label>
            <input
              type="text"
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              className="w-full rounded-xl border border-border bg-paper px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1 uppercase tracking-wider">
              Financial Metric Sample (Geist Mono)
            </label>
            <input
              type="text"
              value={monoSample}
              onChange={(e) => setMonoSample(e.target.value)}
              className="w-full rounded-xl border border-border bg-paper px-4 py-2.5 text-sm font-mono text-ink focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
        </div>
      </div>

      {/* Type Scale Hierarchy Table */}
      <div className="space-y-6">
        {typeScale.map((item, index) => (
          <div
            key={index}
            className="group rounded-2xl bg-surface border border-border p-6 transition-all hover:border-accent-500/40 hover:shadow-md"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border/60 pb-3 mb-4 text-xs font-mono text-ink-muted">
              <div className="flex items-center gap-3">
                <span className="font-bold text-accent-700 bg-accent-50 px-2 py-0.5 rounded-md">
                  {item.name}
                </span>
                <span>{item.size}</span>
                <span>LH: {item.lineHeight}</span>
                <span>Weight: {item.weight}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-paper px-2 py-0.5 rounded-md border border-border">
                  {item.family}
                </span>
              </div>
            </div>

            <div className="min-h-[44px] flex items-center">
              <div
                className={`${item.className} ${
                  activeFont === 'mono' ? 'font-mono' : ''
                }`}
              >
                {item.isMono ? monoSample : sampleText}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/40 text-xs text-ink-muted flex items-center justify-between">
              <span>
                <strong className="text-ink">Usage:</strong> {item.usage}
              </span>
              <span className="hidden sm:inline opacity-70 font-mono text-[11px]">
                tracking: {item.tracking}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Line Length Limit Demonstration (60 - 75 characters max) */}
      <div className="rounded-2xl bg-surface border border-border p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h4 className="font-bold text-ink">Line Length Control Rule (WCAG Readability)</h4>
            <p className="text-xs text-ink-muted">
              Long-form campaign descriptions and pitches must be constrained to 60–75 characters per line (max-w-prose / ~65ch).
            </p>
          </div>
          <span className="rounded-full bg-accent-100 text-accent-700 px-3 py-1 text-xs font-semibold">
            Max 65–75 chars/line
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Approved Constrained Width */}
          <div className="rounded-xl bg-paper p-5 border border-accent-500/30 space-y-2 relative">
            <div className="flex items-center justify-between text-xs font-bold text-accent-700 uppercase tracking-wider">
              <span>RECOMMENDED LINE LENGTH</span>
              <span className="font-mono">~68 Chars/Line (max-w-prose)</span>
            </div>
            <p className="text-sm leading-relaxed text-ink max-w-prose">
              {longFormText}
            </p>
            <div className="text-[11px] text-ink-muted pt-2 border-t border-border">
              Ideal comfortable measure for human eyes reading campaign updates & pitch details.
            </div>
          </div>

          {/* Overly Wide Unconstrained Lines */}
          <div className="rounded-xl bg-paper p-5 border border-danger/30 space-y-2 opacity-75">
            <div className="flex items-center justify-between text-xs font-bold text-danger uppercase tracking-wider">
              <span>AVOID FULL-WIDTH PARAGRAPHS</span>
              <span className="font-mono">&gt;120 Chars/Line</span>
            </div>
            <p className="text-sm leading-relaxed text-ink w-full">
              {longFormText}
            </p>
            <div className="text-[11px] text-danger/80 pt-2 border-t border-border">
              Full screen width causes reading fatigue and tracking difficulty across long sentences.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
