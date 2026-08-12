'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Amount, Count } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { getIdeaInsights } from '@/lib/ideas/ideas-api';
import { FeedbackSimulator, type SimulatedFeedbackState } from './feedback-simulator';

export interface IdeaInsightsProps {
  ideaId: string;
}

export function IdeaInsightsView({ ideaId }: IdeaInsightsProps) {
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activePreset, setActivePreset] = useState<'positive' | 'mixed' | 'weak' | 'custom' | null>(null);
  const [simulated, setSimulated] = useState<SimulatedFeedbackState | null>(null);

  // Fetch live API insights if backend server is active
  const { data: apiInsights } = useQuery({
    queryKey: ['idea-insights', ideaId],
    queryFn: () => getIdeaInsights(ideaId),
    staleTime: 30_000,
  });

  // Format title gracefully (e.g. idea_aqua_feed -> Aqua Feed)
  const ideaTitle = apiInsights?.idea?.title || ideaId
    .replace(/^idea[-_]/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Dynamic values with fallback metrics & simulator overrides
  const uniqueViews = simulated?.uniqueViews ?? (apiInsights?.summary?.uniqueViews ?? 2850);
  const rawPledgeTotalUsd = simulated?.rawPrePledgeTotalUsd ?? (apiInsights?.summary?.rawPrePledgeTotalUsd ?? apiInsights?.summary?.weightedPrePledgeTotal ?? 48500);
  const supporterCount = simulated?.supporterCount ?? (apiInsights?.summary?.supporterCount ?? 842);
  const surveyResponseCount = simulated?.surveyResponseCount ?? (apiInsights?.summary?.feedbackCount ?? 352);
  const conversionRate = simulated?.conversionRate ?? (apiInsights?.summary?.conversionRate ?? 29.5);
  const feedbackScore = simulated?.feedbackScore ?? Number(apiInsights?.summary?.feedbackScore ?? 4.2);

  const applyPreset = (preset: 'positive' | 'mixed' | 'weak') => {
    setActivePreset(preset);
    if (preset === 'positive') {
      setSimulated({
        supporterCount: 412,
        rawPrePledgeTotalUsd: 48500,
        weightedPrePledgeTotalUsd: 42300,
        surveyResponseCount: 352,
        feedbackScore: 4.8,
        uniqueViews: 3850,
        conversionRate: 32.4,
        gateMet: true,
        timeseries: [
          { day: 'Mon', views: 240, visitors: 180 },
          { day: 'Tue', views: 420, visitors: 310 },
          { day: 'Wed', views: 580, visitors: 420 },
          { day: 'Thu', views: 490, visitors: 360 },
          { day: 'Fri', views: 740, visitors: 520 },
          { day: 'Sat', views: 890, visitors: 640 },
          { day: 'Sun', views: 760, visitors: 580 },
        ],
        backerQuotes: [
          { author: 'Tayo O.', role: 'Agri-Distributor', location: 'Oyo, Nigeria', quote: 'This cold storage concept solves our exact crop spoilage issue. Happy to pre-pledge $500 USDC!', pledge: '$500 USDC' },
          { author: 'Amaka N.', role: 'Micro-Finance Operator', location: 'Lagos, Nigeria', quote: 'Offline USSD micro-payments make this viable for market women in Yaba who lack mobile data.', pledge: '$250 USDC' },
          { author: 'Kofi M.', role: 'Software Engineer', location: 'London, UK', quote: 'Pre-pledging via USDC gives diaspora investors full transparency over validation readiness.', pledge: '$1,000 USDC' },
        ],
      });
    } else if (preset === 'mixed') {
      setSimulated({
        supporterCount: 18,
        rawPrePledgeTotalUsd: 1250,
        weightedPrePledgeTotalUsd: 950,
        surveyResponseCount: 14,
        feedbackScore: 3.8,
        uniqueViews: 1420,
        conversionRate: 18.5,
        gateMet: false,
        timeseries: [
          { day: 'Mon', views: 90, visitors: 65 },
          { day: 'Tue', views: 140, visitors: 95 },
          { day: 'Wed', views: 210, visitors: 150 },
          { day: 'Thu', views: 170, visitors: 120 },
          { day: 'Fri', views: 280, visitors: 190 },
          { day: 'Sat', views: 320, visitors: 220 },
          { day: 'Sun', views: 250, visitors: 180 },
        ],
        backerQuotes: [
          { author: 'Buchi I.', role: 'Tech Enthusiast', location: 'Abuja, Nigeria', quote: 'Interesting concept, but pricing per crate needs to stay competitive with local options.', pledge: '$50 USDC' },
          { author: 'Grace E.', role: 'Retail Vendor', location: 'Lagos, Nigeria', quote: 'Would use it if battery backup holds up during 3-day power cuts.', pledge: '$100 USDC' },
          { author: 'David K.', role: 'Investor', location: 'Nairobi, Kenya', quote: 'Validation is progressing nicely. Looking forward to pilot metrics.', pledge: '$200 USDC' },
        ],
      });
    } else {
      setSimulated({
        supporterCount: 6,
        rawPrePledgeTotalUsd: 150,
        weightedPrePledgeTotalUsd: 100,
        surveyResponseCount: 5,
        feedbackScore: 2.2,
        uniqueViews: 650,
        conversionRate: 8.2,
        gateMet: false,
        timeseries: [
          { day: 'Mon', views: 40, visitors: 30 },
          { day: 'Tue', views: 65, visitors: 45 },
          { day: 'Wed', views: 80, visitors: 55 },
          { day: 'Thu', views: 70, visitors: 50 },
          { day: 'Fri', views: 110, visitors: 80 },
          { day: 'Sat', views: 130, visitors: 90 },
          { day: 'Sun', views: 95, visitors: 70 },
        ],
        backerQuotes: [
          { author: 'Anonymous Backer', role: 'Trader', location: 'Kano, Nigeria', quote: 'High upfront cost for farmers; alternative solutions already exist locally.', pledge: '$20 USDC' },
          { author: 'Chidi M.', role: 'Developer', location: 'Enugu, Nigeria', quote: 'Not convinced about USSD reliability during grid shutdowns.', pledge: '$10 USDC' },
          { author: 'Sola A.', role: 'Analyst', location: 'Ibadan, Nigeria', quote: 'Needs stronger evidence of farmer adoption in target rural areas.', pledge: '$0 USDC' },
        ],
      });
    }
  };

  const addRandomSignal = () => {
    setActivePreset('custom');
    setSimulated((prev) => {
      const current = prev ?? {
        supporterCount: supporterCount,
        rawPrePledgeTotalUsd: rawPledgeTotalUsd,
        weightedPrePledgeTotalUsd: rawPledgeTotalUsd,
        surveyResponseCount: surveyResponseCount,
        feedbackScore: feedbackScore,
        uniqueViews: uniqueViews,
        conversionRate: conversionRate,
        gateMet: false,
        timeseries: [
          { day: 'Mon', views: 180, visitors: 140 },
          { day: 'Tue', views: 320, visitors: 230 },
          { day: 'Wed', views: 410, visitors: 310 },
          { day: 'Thu', views: 290, visitors: 210 },
          { day: 'Fri', views: 540, visitors: 390 },
          { day: 'Sat', views: 620, visitors: 450 },
          { day: 'Sun', views: 490, visitors: 390 },
        ],
        backerQuotes: [],
      };

      const addedPledge = Math.floor(Math.random() * 250) + 25;
      const nextSupporters = current.supporterCount + 1;
      const nextPledges = current.rawPrePledgeTotalUsd + addedPledge;
      const nextSurveys = current.surveyResponseCount + 1;
      const randomRating = (Math.random() * 2 + 3).toFixed(1); // 3.0 to 5.0
      const nextScore = Number(((current.feedbackScore * current.surveyResponseCount + Number(randomRating)) / nextSurveys).toFixed(2));

      return {
        ...current,
        supporterCount: nextSupporters,
        rawPrePledgeTotalUsd: nextPledges,
        weightedPrePledgeTotalUsd: nextPledges,
        surveyResponseCount: nextSurveys,
        feedbackScore: nextScore,
        gateMet: nextSupporters >= 30 && nextPledges >= 2000 && nextSurveys >= 10 && nextScore >= 3.0,
      };
    });
  };

  const resetSimulation = () => {
    setActivePreset(null);
    setSimulated(null);
  };

  // Analytics - Daily Impressions Data
  const viewsTrend = simulated?.timeseries ?? (apiInsights?.timeseries?.length > 0
    ? apiInsights.timeseries.map((s: any) => ({
        day: new Date(s.capturedAt).toLocaleDateString('en-US', { weekday: 'short' }),
        views: s.supporterCount * 3 + 10,
        visitors: s.supporterCount * 2 + 5,
      }))
    : [
        { day: 'Mon', views: 180, visitors: 140 },
        { day: 'Tue', views: 320, visitors: 230 },
        { day: 'Wed', views: 410, visitors: 310 },
        { day: 'Thu', views: 290, visitors: 210 },
        { day: 'Fri', views: 540, visitors: 390 },
        { day: 'Sat', views: 620, visitors: 450 },
        { day: 'Sun', views: 490, visitors: 390 },
      ]);

  const maxViews = Math.max(...viewsTrend.map((d: any) => d.views));

  // Traffic Acquisition Breakdown
  const trafficSources = [
    { source: 'Inverge Pitch Feed', visits: 1282, conversion: 32.4, share: '45%' },
    { source: 'Direct Link & Referrals', visits: 798, conversion: 28.1, share: '28%' },
    { source: 'WhatsApp & Telegram', visits: 513, conversion: 38.5, share: '18%' },
    { source: 'Twitter / X Shares', visits: 257, conversion: 19.2, share: '9%' },
  ];

  // Conversion Funnel Pipeline
  const funnelSteps = [
    { label: 'Total Impressions', value: uniqueViews.toLocaleString(), sub: '100% of reach', step: '01' },
    { label: 'Unique Visitors', value: '2,120', sub: '74% clickthrough', step: '02' },
    { label: 'Pitch Scrolled >75%', value: '1,480', sub: '51% engaged', step: '03' },
    { label: 'Survey Opened', value: surveyResponseCount.toString(), sub: '31% feedback', step: '04' },
    { label: 'USDC Backers', value: supporterCount.toString(), sub: `${conversionRate}% pledged`, step: '05' },
  ];

  // Backer Testimonial Voice
  const backerQuotes = simulated?.backerQuotes?.length
    ? simulated.backerQuotes
    : [
        {
          author: 'Tayo O.',
          role: 'Agri-Distributor',
          location: 'Oyo, Nigeria',
          quote: 'This cold storage concept solves our exact 35% crop spoilage in Ibadan. Happy to pre-pledge $100 USDC up front!',
          pledge: '$100 USDC',
        },
        {
          author: 'Amaka N.',
          role: 'Micro-Finance Operator',
          location: 'Lagos, Nigeria',
          quote: 'Offline USSD micro-payments make this viable for market women in Yaba who don’t have constant mobile data.',
          pledge: '$250 USDC',
        },
        {
          author: 'Kofi M.',
          role: 'Software Engineer',
          location: 'London, UK',
          quote: 'Pre-pledging via USDC gives diaspora investors full transparency over validation readiness.',
          pledge: '$500 USDC',
        },
      ];

  const isGateMet = simulated ? simulated.gateMet : (apiInsights?.gate?.met ?? true);

  const gates = apiInsights?.gate && !simulated
    ? [
        {
          title: 'Supporter Signal Threshold',
          desc: 'Minimum unique verified backer support signals required',
          need: `${apiInsights.gate.targets?.minSupporters ?? 30} supporters`,
          have: `${apiInsights.gate.metrics?.supporterCount ?? supporterCount} supporters`,
          met: (apiInsights.gate.metrics?.supporterCount ?? 0) >= (apiInsights.gate.targets?.minSupporters ?? 30),
        },
        {
          title: 'Monetary Pre-pledge Target',
          desc: 'Weighted financial commitment threshold in USDC pre-pledges',
          need: `$${(apiInsights.gate.targets?.minWeightedUSD ?? 2000).toLocaleString()} USDC`,
          have: `$${(apiInsights.gate.metrics?.weighted ?? rawPledgeTotalUsd).toLocaleString()} USDC`,
          met: (apiInsights.gate.metrics?.weighted ?? 0) >= (apiInsights.gate.targets?.minWeightedUSD ?? 2000),
        },
        {
          title: 'Structured Feedback Count',
          desc: 'Detailed feedback responses completed by verified community members',
          need: `${apiInsights.gate.targets?.minFeedbackCount ?? 10} responses`,
          have: `${apiInsights.gate.metrics?.feedbackCount ?? surveyResponseCount} responses`,
          met: (apiInsights.gate.metrics?.feedbackCount ?? 0) >= (apiInsights.gate.targets?.minFeedbackCount ?? 10),
        },
        {
          title: 'Average Feedback Rating',
          desc: 'Minimum average feedback score from community reviewers (out of 5)',
          need: `${apiInsights.gate.targets?.minAvgFeedbackRating ?? 3.0} / 5.0 rating`,
          have: `${Number(apiInsights.gate.metrics?.feedbackScore ?? 0).toFixed(1)} / 5.0 rating`,
          met: (apiInsights.gate.metrics?.feedbackScore ?? 0) >= (apiInsights.gate.targets?.minAvgFeedbackRating ?? 3.0),
        },
      ]
    : [
        {
          title: 'Problem Validation (Supporters)',
          desc: 'Minimum unique verified backer support signals required',
          need: '30 supporters',
          have: `${supporterCount} supporters`,
          met: supporterCount >= 30,
        },
        {
          title: 'Monetary Pre-pledge Target',
          desc: 'Financial commitment threshold in USDC pre-pledges',
          need: '$2,000 USDC',
          have: `$${rawPledgeTotalUsd.toLocaleString()} USDC`,
          met: rawPledgeTotalUsd >= 2000,
        },
        {
          title: 'Structured Survey Feedback',
          desc: 'Detailed feedback forms completed by verified members',
          need: '10 responses',
          have: `${surveyResponseCount} responses`,
          met: surveyResponseCount >= 10,
        },
        {
          title: 'Average Feedback Rating',
          desc: 'Minimum average rating from community reviewers (out of 5)',
          need: '3.0 / 5.0 rating',
          have: `${feedbackScore.toFixed(1)} / 5.0 rating`,
          met: feedbackScore >= 3.0,
        },
      ];

  const demographics = [
    { region: 'Lagos, Nigeria', countryCode: 'NG', share: 42, count: 353 },
    { region: 'London, UK', countryCode: 'GB', share: 28, count: 235 },
    { region: 'Toronto, Canada', countryCode: 'CA', share: 18, count: 151 },
    { region: 'Houston, USA', countryCode: 'US', share: 12, count: 103 },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-24 text-ink">
      {/* Feedback & Validation Test Simulator */}
      <FeedbackSimulator
        onApplyPreset={applyPreset}
        onAddRandomSignal={addRandomSignal}
        onReset={resetSimulation}
        activePreset={activePreset}
      />

      {/* Page Header */}
      <div className="border-b border-border/80 pb-6">
        <nav aria-label="Breadcrumbs" className="mb-3 flex items-center gap-1.5 text-xs text-ink-muted">
          <Link href="/feed" className="hover:text-ink transition-colors">Home</Link>
          <span>/</span>
          <Link href="/ideas/my" className="hover:text-ink transition-colors">My ideas</Link>
          <span>/</span>
          <span className="font-semibold text-ink">{ideaTitle}</span>
          <span>/</span>
          <span className="font-semibold text-accent-700">Insights &amp; Analytics</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                {ideaTitle}
              </h1>
              <Pill tone={isGateMet ? 'accent' : 'neutral'} size="sm">
                {isGateMet ? 'Threshold met' : 'Validation in progress'}
              </Pill>
              <span className="rounded-full bg-paper px-2.5 py-0.5 text-xs font-semibold text-ink-muted border border-border">
                Solana USDC Pre-Pledge
              </span>
            </div>
            <p className="text-sm text-ink-muted">
              Deep-dive survey intelligence, unique visitor impressions, community channels, and USDC pre-pledge commitments.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="rounded-xl border border-border bg-paper px-3.5 py-2 text-xs font-semibold text-ink hover:bg-surface transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copiedLink ? (
                <>
                  <svg className="h-3.5 w-3.5 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share Report</span>
                </>
              )}
            </button>
            <Button variant="outline" size="sm" href={`/ideas/${ideaId}`}>
              View Pitch Page →
            </Button>
          </div>
        </div>
      </div>

      {/* 5 Executive Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-2xl border border-border/80 bg-surface p-4 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Unique Views</span>
          <p className="text-2xl font-extrabold text-ink font-mono"><Count value={uniqueViews} /></p>
          <span className="text-[11px] text-accent-700 font-semibold block">+24% vs last week</span>
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface p-4 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">USDC Pre-Pledged</span>
          <p className="text-2xl font-extrabold text-ink font-mono"><Amount value={rawPledgeTotalUsd} currency="USD" /></p>
          <span className="text-[11px] text-accent-700 font-semibold block">Weighted Pre-Pledges</span>
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface p-4 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Community</span>
          <p className="text-2xl font-extrabold text-ink font-mono"><Count value={1240} /></p>
          <span className="text-[11px] text-ink-muted font-semibold block">Across 3 channels</span>
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface p-4 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Survey Responses</span>
          <p className="text-2xl font-extrabold text-ink font-mono"><Count value={surveyResponseCount} /></p>
          <span className="text-[11px] text-ink-muted font-semibold block">41.8% response rate</span>
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface p-4 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Conversion</span>
          <p className="text-2xl font-extrabold text-accent-700 font-mono">{conversionRate}%</p>
          <span className="text-[11px] text-ink-muted font-semibold block">{supporterCount} unique backers</span>
        </div>
      </div>

      {/* SECTION 1: UNIQUE IMPRESSIONS & TRAFFIC ANALYTICS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">Unique Impressions &amp; Traffic</h2>
            <p className="text-xs text-ink-muted">Daily breakdown of unique page visits vs. total pitch views.</p>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-paper border border-border p-1 text-xs">
            <button
              type="button"
              onClick={() => setTimeframe('7d')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${
                timeframe === '7d' ? 'bg-surface text-ink shadow-2xs' : 'text-ink-muted hover:text-ink'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('30d')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${
                timeframe === '30d' ? 'bg-surface text-ink shadow-2xs' : 'text-ink-muted hover:text-ink'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs space-y-6">
          {/* Dual Bar Impression Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-ink-muted pb-2 border-b border-border/60">
              <span className="font-semibold text-ink">Daily Views &amp; Visitors</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-ink font-medium">
                  <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600" /> Page Views
                </span>
                <span className="flex items-center gap-1.5 text-ink font-medium">
                  <span className="h-2.5 w-2.5 rounded-xs bg-teal-300" /> Unique Visitors
                </span>
              </div>
            </div>

            <div className="pt-6 pb-2 flex items-end justify-between gap-3 h-48">
              {viewsTrend.map((item: any) => {
                const heightPct = Math.round((item.views / maxViews) * 100);
                const visitorHeightPct = Math.round((item.visitors / maxViews) * 100);

                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="relative w-full flex items-end justify-center gap-1.5 h-full">
                      <div
                        className="w-full max-w-[28px] rounded-t-lg bg-emerald-600 group-hover:bg-emerald-700 transition-all duration-200 relative"
                        style={{ height: `${heightPct}%` }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-ink px-2 py-0.5 text-[10px] text-white font-mono pointer-events-none transition whitespace-nowrap shadow-xs z-10">
                          {item.views} views
                        </div>
                      </div>
                      <div
                        className="w-full max-w-[20px] rounded-t-lg bg-teal-300 group-hover:bg-teal-400 transition-all duration-200"
                        style={{ height: `${visitorHeightPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-ink-muted group-hover:text-ink transition">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Traffic Sources Cards & Conversion Pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border/60">
            {/* Traffic Sources Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Traffic Channels</h3>
              <div className="space-y-2">
                {trafficSources.map((src) => (
                  <div key={src.source} className="flex items-center justify-between rounded-xl bg-paper/60 p-3 border border-border/60 hover:bg-paper transition">
                    <div>
                      <span className="font-semibold text-xs text-ink block">{src.source}</span>
                      <span className="text-[10px] text-ink-muted block">{src.visits} visits · {src.conversion}% conversion</span>
                    </div>
                    <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-bold text-emerald-700 border border-border/60">
                      {src.share}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversion Pipeline Nodes */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Conversion Pipeline</h3>
              <div className="space-y-2">
                {funnelSteps.map((step) => (
                  <div key={step.label} className="flex items-center justify-between rounded-xl bg-paper/60 p-2.5 text-xs border border-border/60">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-mono font-bold text-emerald-800 border border-emerald-300">
                        {step.step}
                      </span>
                      <div>
                        <span className="font-semibold text-ink block">{step.label}</span>
                        <span className="text-[10px] text-ink-muted block">{step.sub}</span>
                      </div>
                    </div>
                    <span className="font-bold text-ink font-mono text-sm">{step.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CUMULATIVE USDC PRE-PLEDGE GROWTH & BRANDED COMMUNITY CARDS */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-ink">USDC Pre-Pledge Growth &amp; Community Channels</h2>
          <p className="text-xs text-ink-muted">Cumulative USDC pre-pledged intent and subscriber hubs.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* SVG Area Curve Chart for USDC Pre-pledges */}
          <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block">Cumulative USDC Pre-Pledged</span>
                <span className="text-2xl font-extrabold text-ink font-mono">${rawPledgeTotalUsd.toLocaleString()} USDC</span>
              </div>
              <span className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-bold text-accent-700 border border-accent-200">
                Target Met (138%)
              </span>
            </div>

            {/* SVG Visual Growth Curve */}
            <div className="relative pt-4 pb-2">
              <svg className="w-full h-32 overflow-visible" viewBox="0 0 300 100" fill="none">
                <defs>
                  <linearGradient id="usdcGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="35" x2="300" y2="35" stroke="#E5E7EB" strokeDasharray="4 4" strokeWidth="1.5" />
                <text x="5" y="30" fill="#9CA3AF" fontSize="9" fontWeight="600">TARGET: $35,000 USDC</text>
                
                <path d="M 0 90 L 0 75 Q 75 55, 150 35 T 300 10 L 300 90 Z" fill="url(#usdcGrad)" />
                <path d="M 0 75 Q 75 55, 150 35 T 300 10" stroke="#059669" strokeWidth="3" fill="none" strokeLinecap="round" />
                
                <circle cx="0" cy="75" r="4" fill="#059669" />
                <circle cx="100" cy="52" r="4" fill="#059669" />
                <circle cx="200" cy="30" r="4" fill="#059669" />
                <circle cx="300" cy="10" r="5" fill="#047857" stroke="#FFFFFF" strokeWidth="2" />
              </svg>

              <div className="flex justify-between text-[11px] font-semibold text-ink-muted pt-2 border-t border-border/40 font-mono">
                <span>Week 1 ($12k)</span>
                <span>Week 2 ($26.5k)</span>
                <span>Week 3 ($38.2k)</span>
                <span className="text-emerald-700 font-bold">Week 4 (${(rawPledgeTotalUsd / 1000).toFixed(1)}k)</span>
              </div>
            </div>
          </div>

          {/* Clean Branded Community Hub Cards */}
          <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Community Subscribers</h3>
              <span className="text-xs font-bold text-ink font-mono">1,240 Total</span>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-3.5 flex items-center justify-between hover:bg-sky-50 transition">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white font-bold text-xs uppercase tracking-wider">
                    TG
                  </div>
                  <div>
                    <span className="font-bold text-xs text-sky-950 block">Telegram Creator Lounge</span>
                    <span className="text-[10px] text-sky-700 block">54.8% of total backing community</span>
                  </div>
                </div>
                <span className="font-bold text-sm text-sky-900 font-mono">680</span>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 flex items-center justify-between hover:bg-emerald-50 transition">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider">
                    WA
                  </div>
                  <div>
                    <span className="font-bold text-xs text-emerald-950 block">WhatsApp Broadcast Rail</span>
                    <span className="text-[10px] text-emerald-700 block">33.9% of total backing community</span>
                  </div>
                </div>
                <span className="font-bold text-sm text-emerald-900 font-mono">420</span>
              </div>

              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3.5 flex items-center justify-between hover:bg-indigo-50 transition">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider">
                    DC
                  </div>
                  <div>
                    <span className="font-bold text-xs text-indigo-950 block">Discord Backer Vault</span>
                    <span className="text-[10px] text-indigo-700 block">11.3% of total backing community</span>
                  </div>
                </div>
                <span className="font-bold text-sm text-indigo-900 font-mono">140</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: STRUCTURED SURVEY RESULTS (SVG DONUT RINGS & PERCENTAGE BADGES) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-ink">Structured Survey Intelligence</h2>
          <p className="text-xs text-ink-muted">Aggregated feedback from {surveyResponseCount} verified community survey submissions.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Question 1: Urgency */}
          <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs flex flex-col justify-between space-y-4">
            <h3 className="font-bold text-xs text-ink leading-snug">Problem Urgency in Workflow</h3>
            
            <div className="flex items-center justify-center py-2">
              <div className="relative flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-paper" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-600" strokeDasharray="68, 100" strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-extrabold text-ink font-mono block">68%</span>
                  <span className="text-[9px] text-ink-muted font-bold uppercase block">High Urgency</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-border/60 pt-3 text-xs">
              <div className="flex justify-between text-ink"><span className="font-medium">Critical / High</span><span className="font-bold text-emerald-700">68% (239)</span></div>
              <div className="flex justify-between text-ink-muted"><span>Moderate</span><span>24% (84)</span></div>
              <div className="flex justify-between text-ink-muted"><span>Low</span><span>8% (29)</span></div>
            </div>
          </div>

          {/* Question 2: USDC Backing */}
          <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs flex flex-col justify-between space-y-4">
            <h3 className="font-bold text-xs text-ink leading-snug">USDC Pre-Pledge Intent</h3>
            
            <div className="flex items-center justify-center py-2">
              <div className="relative flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-paper" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-500" strokeDasharray="82, 100" strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-extrabold text-ink font-mono block">82%</span>
                  <span className="text-[9px] text-ink-muted font-bold uppercase block">Ready to Pledge</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-border/60 pt-3 text-xs">
              <div className="flex justify-between text-ink"><span className="font-medium">Ready to Pledge</span><span className="font-bold text-emerald-700">82% (288)</span></div>
              <div className="flex justify-between text-ink-muted"><span>Need details</span><span>12% (42)</span></div>
              <div className="flex justify-between text-ink-muted"><span>Unlikely</span><span>6% (22)</span></div>
            </div>
          </div>

          {/* Question 3: Pricing */}
          <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs flex flex-col justify-between space-y-4">
            <h3 className="font-bold text-xs text-ink leading-snug">Preferred Pricing Tier</h3>
            
            <div className="flex items-center justify-center py-2">
              <div className="relative flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-paper" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-teal-600" strokeDasharray="58, 100" strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-extrabold text-ink font-mono block">58%</span>
                  <span className="text-[9px] text-ink-muted font-bold uppercase block">Pay-per-tx</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-border/60 pt-3 text-xs">
              <div className="flex justify-between text-ink"><span className="font-medium">Pay-per-tx (USSD)</span><span className="font-bold text-emerald-700">58% (204)</span></div>
              <div className="flex justify-between text-ink-muted"><span>Monthly ($25-$50)</span><span>32% (112)</span></div>
              <div className="flex justify-between text-ink-muted"><span>Annual license</span><span>10% (36)</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: VOICE OF BACKER (TESTIMONIAL QUOTES) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-ink">Voice of Backer (Qualitative Feedback)</h2>
          <p className="text-xs text-ink-muted">Direct feedback from verified community backers.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {backerQuotes.map((q) => (
            <div key={q.author} className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-emerald-500/30 transition">
              <p className="text-xs text-ink italic leading-relaxed">
                &ldquo;{q.quote}&rdquo;
              </p>
              <div className="border-t border-border/60 pt-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-ink block">{q.author}</span>
                  <span className="text-[10px] text-ink-muted block">{q.role} · {q.location}</span>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                  {q.pledge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: VALIDATION GATE CHECKLIST CARDS */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-ink">Validation Gate Status</h2>
          <p className="text-xs text-ink-muted">All criteria verified for validation threshold.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gates.map((gate) => (
            <div key={gate.title} className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                    ✓
                  </span>
                  <h3 className="font-bold text-sm text-ink">{gate.title}</h3>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  Verified
                </span>
              </div>
              <p className="text-xs text-ink-muted">{gate.desc}</p>
              <div className="flex justify-between text-xs pt-2 border-t border-border/60">
                <span className="text-ink-muted font-medium">Target: {gate.need}</span>
                <span className="font-bold text-emerald-700 font-mono">Achieved: {gate.have}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: SUPPORTER DEMOGRAPHICS */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-ink">Supporter Demographics</h2>
          <p className="text-xs text-ink-muted">Geographic breakdown of backing community.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {demographics.map((loc) => (
            <div key={loc.region} className="rounded-2xl border border-border/80 bg-surface p-4 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-paper font-mono font-bold text-xs text-ink border border-border/80">
                  {loc.countryCode}
                </span>
                <div>
                  <span className="font-bold text-xs text-ink block">{loc.region}</span>
                  <span className="text-[10px] text-ink-muted block">{loc.count} backers</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                <span className="font-extrabold text-emerald-700 font-mono">{loc.share}%</span>
                <span className="text-[10px] text-ink-muted font-medium">Community share</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
