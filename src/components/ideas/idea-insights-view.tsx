'use client';

import React from 'react';
import Link from 'next/link';
import { Amount, Count } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { Meter } from '@/components/ui/meter';
import { Pill } from '@/components/ui/pill';

export interface IdeaInsightsProps {
  ideaId: string;
}

export function IdeaInsightsView({ ideaId }: IdeaInsightsProps) {
  // Demo insights data for the idea
  const ideaTitle = ideaId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const gates = [
    {
      title: 'Problem Validation',
      description: 'Backers who confirmed experiencing this problem first-hand.',
      have: 450,
      need: 300,
      unit: 'supporters',
      met: true,
      ratio: 1.0,
    },
    {
      title: 'Monetary Pre-pledge Target',
      description: 'Weighted financial commitment threshold across supporters.',
      have: 1850000,
      need: 1500000,
      unit: 'NGN',
      isCurrency: true,
      met: true,
      ratio: 1.0,
    },
    {
      title: 'Structured Survey Responses',
      description: 'Detailed feedback forms completed by verified community members.',
      have: 352,
      need: 250,
      unit: 'responses',
      met: true,
      ratio: 1.0,
    },
    {
      title: 'Diaspora Supporter Ratio',
      description: 'Proportion of backing coming from diaspora in UK, US, and Canada.',
      have: '62%',
      need: '50%',
      met: true,
      ratio: 0.88,
    },
  ];

  const locations = [
    { region: 'Lagos, Nigeria', percentage: 42, count: 353 },
    { region: 'London, UK', percentage: 28, count: 235 },
    { region: 'Toronto, Canada', percentage: 18, count: 151 },
    { region: 'Houston, USA', percentage: 12, count: 103 },
  ];

  const surveyBreakdown = [
    {
      question: 'How urgent is this problem in your daily workflow?',
      options: [
        { label: 'Critical / High urgency', percent: 68 },
        { label: 'Moderate urgency', percent: 24 },
        { label: 'Low urgency', percent: 8 },
      ],
    },
    {
      question: 'Would you pre-order or back this solution?',
      options: [
        { label: 'Yes, ready to pledge', percent: 82 },
        { label: 'Maybe, with more details', percent: 12 },
        { label: 'Unlikely', percent: 6 },
      ],
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 pb-24">
      {/* Header & Sub-nav */}
      <div>
        <nav aria-label="Breadcrumbs" className="mb-2 flex items-center gap-1.5 text-xs text-ink-muted">
          <Link href="/feed" className="hover:text-ink transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/dashboard" className="hover:text-ink transition-colors">
            My ideas
          </Link>
          <span>/</span>
          <span className="font-medium text-ink">{ideaTitle}</span>
          <span>/</span>
          <span className="font-medium text-ink">Insights</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {ideaTitle}
              </h1>
              <Pill tone="accent" size="sm">
                Threshold met
              </Pill>
            </div>
            <p className="text-sm text-ink-muted">
              Private creator validation analytics and survey response breakdown.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            href={`/ideas/${ideaId}`}
            className="self-start sm:self-auto shrink-0"
          >
            View public page →
          </Button>
        </div>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block mb-1">
            Estimated interest
          </span>
          <div className="font-display text-2xl font-bold text-ink">
            <Amount value={1850000} currency="NGN" />
          </div>
          <span className="text-xs text-accent-700 mt-1 block">Weighted pre-pledges</span>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block mb-1">
            Supporters
          </span>
          <div className="font-display text-2xl font-bold text-ink">
            <Count value={842} />
          </div>
          <span className="text-xs text-ink-muted mt-1 block">Unique backers</span>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block mb-1">
            Survey Responses
          </span>
          <div className="font-display text-2xl font-bold text-ink">
            <Count value={352} />
          </div>
          <span className="text-xs text-ink-muted mt-1 block">Completed feedback</span>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block mb-1">
            Validation Progress
          </span>
          <div className="font-display text-2xl font-bold text-accent-700">
            88%
          </div>
          <span className="text-xs text-accent-700 mt-1 block font-medium">Ready for campaign</span>
        </div>
      </div>

      {/* Section 1: Validation Gate Breakdown (FR-204) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-ink">Validation Gate Breakdown</h2>
          <p className="text-sm text-ink-muted">
            All four criteria must be satisfied before campaign conversion unlocks.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
          {gates.map((gate, index) => (
            <div key={gate.title} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-ink text-base">{gate.title}</h3>
                  <p className="text-xs text-ink-muted">{gate.description}</p>
                </div>
                <Pill tone={gate.met ? 'accent' : 'neutral'} size="sm">
                  {gate.met ? 'Met' : 'In Progress'}
                </Pill>
              </div>

              <Meter
                ratio={gate.ratio}
                srLabel={gate.title}
                tone={gate.met ? 'accent' : 'neutral'}
                size="md"
              />

              <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
                <span>
                  Target:{' '}
                  {gate.isCurrency ? (
                    <Amount value={gate.need} currency="NGN" />
                  ) : typeof gate.need === 'number' ? (
                    <Count value={gate.need} />
                  ) : (
                    gate.need
                  )}{' '}
                  {gate.unit && !gate.isCurrency ? gate.unit : ''}
                </span>
                <span className="text-ink font-semibold">
                  Achieved:{' '}
                  {gate.isCurrency ? (
                    <Amount value={gate.have} currency="NGN" />
                  ) : typeof gate.have === 'number' ? (
                    <Count value={gate.have} />
                  ) : (
                    gate.have
                  )}
                </span>
              </div>

              {index < gates.length - 1 && <div className="h-px bg-border/60 pt-4" />}
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Supporter Demographics */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-ink">Supporter Demographics</h2>
          <p className="text-sm text-ink-muted">
            Geographic distribution of your backing community.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
          {locations.map((loc) => (
            <div key={loc.region} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-ink">{loc.region}</span>
                <span className="font-medium text-ink-muted tabular-nums">
                  {loc.percentage}% (<Count value={loc.count} /> backers)
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-paper overflow-hidden border border-border/40">
                <div
                  className="h-full rounded-full bg-accent-500 transition-all duration-300"
                  style={{ width: `${loc.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Structured Survey Feedback */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-ink">Structured Survey Results</h2>
          <p className="text-sm text-ink-muted">
            Aggregated responses from 352 verified community survey submissions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {surveyBreakdown.map((item) => (
            <div
              key={item.question}
              className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4"
            >
              <h3 className="font-semibold text-ink text-sm leading-snug">
                {item.question}
              </h3>
              <div className="space-y-3">
                {item.options.map((opt) => (
                  <div key={opt.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-ink">{opt.label}</span>
                      <span className="text-accent-700 font-semibold">{opt.percent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-paper overflow-hidden border border-border/40">
                      <div
                        className="h-full rounded-full bg-accent-500"
                        style={{ width: `${opt.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
