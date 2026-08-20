'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Amount, Count } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { Pill, type PillTone } from '@/components/ui/pill';
import { listMyIdeas } from '@/lib/campaigns/my-ideas';
import { WalletModal, type WalletTab } from '@/components/wallets/wallet-modal';
import { BoostModal } from '@/components/ideas/boost-modal';
import { detectAfricanCurrency } from '@/lib/currency/african-currencies';

export interface DashboardIdeaRow {
  id: string;
  title: string;
  summary: string;
  status: 'Draft' | 'Validating' | 'Threshold met' | 'Campaign live';
  tone: PillTone;
  supporters: number;
  prePledgeTotal: number;
  updatedAt: string;
}

const DEMO_IDEAS: DashboardIdeaRow[] = [
  {
    id: 'payflex-lagos',
    title: 'PayFlex Lagos',
    summary: 'Offline USSD micro-payments for informal market vendors in Yaba.',
    status: 'Threshold met',
    tone: 'accent',
    supporters: 842,
    prePledgeTotal: 48500,
    updatedAt: '2 hours ago',
  },
  {
    id: 'campuskonekt',
    title: 'CampusKonekt Technologies',
    summary: 'Student marketplace and verified room matching across Nigerian universities.',
    status: 'Campaign live',
    tone: 'accent',
    supporters: 610,
    prePledgeTotal: 32400,
    updatedAt: 'Yesterday',
  },
  {
    id: 'agrisolar-ibadan',
    title: 'AgriSolar Cold Storage',
    summary: 'Solar-powered cold storage pods for tomato farmers in Ibadan.',
    status: 'Validating',
    tone: 'neutral',
    supporters: 352,
    prePledgeTotal: 18500,
    updatedAt: '3 days ago',
  },
];

const CAMPAIGN_MILESTONES = [
  {
    id: 'm1',
    title: 'Milestone 1: Core USSD Infrastructure & Security Audit',
    share: '30%',
    amount: 24270,
    status: 'Released',
    releasedDate: 'Aug 2, 2026',
    verified: true,
  },
  {
    id: 'm2',
    title: 'Milestone 2: Pilot Merchant Onboarding (500 Vendors in Yaba)',
    share: '40%',
    amount: 32360,
    status: 'Locked in USDC Escrow',
    releasedDate: 'Pending Verification',
    verified: false,
  },
  {
    id: 'm3',
    title: 'Milestone 3: Scale & Multi-City Expansion',
    share: '30%',
    amount: 24270,
    status: 'Locked in USDC Escrow',
    releasedDate: 'Q4 2026',
    verified: false,
  },
];

export function DashboardView() {
  const activeCurrency = detectAfricanCurrency();
  const { data: liveIdeas } = useQuery({
    queryKey: ['my-ideas'],
    queryFn: () => listMyIdeas(),
    staleTime: 15_000,
  });

  const [activePhase, setActivePhase] = useState<'VALIDATION' | 'CAMPAIGN'>('VALIDATION');
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletTab, setWalletTab] = useState<WalletTab>('overview');
  const [boostTarget, setBoostTarget] = useState<{ id: string; title: string; discoverabilityTier?: 'LINK_ONLY' | 'DISCOVERABLE' | 'FEATURED' } | null>(null);

  const ideas: DashboardIdeaRow[] = (liveIdeas && liveIdeas.length > 0)
    ? liveIdeas.map((i) => ({
        id: i.id,
        title: i.title,
        summary: i.problem,
        status: i.ready ? ('Threshold met' as const) : ('Validating' as const),
        tone: i.ready ? ('accent' as const) : ('neutral' as const),
        supporters: i.supporterCount,
        prePledgeTotal: Number(i.askAmount),
        updatedAt: 'Recently',
      }))
    : DEMO_IDEAS;

  const totalIdeas = ideas.length;
  const totalSupporters = ideas.reduce((acc, i) => acc + i.supporters, 0);
  const totalPrePledge = ideas.reduce((acc, i) => acc + i.prePledgeTotal, 0);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-20">
      {/* Top Verification Status Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-paper/80 px-4 py-3.5 shadow-2xs">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-ink">
          <span className="h-2 w-2 shrink-0 rounded-full bg-accent-500 animate-pulse" />
          <span>
            <strong className="font-semibold text-ink">Verification: In review</strong> — We&apos;ll email you within 2 working days. You can keep building meanwhile.
          </span>
        </div>
        <Link
          href="/verify"
          className="text-xs font-semibold text-accent-700 hover:text-accent-900 hover:underline shrink-0 pl-4 sm:pl-0"
        >
          View status →
        </Link>
      </div>

      {/* Header & Dashboard Phase Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-semibold text-accent-700 border border-accent-200">
              Creator Hub
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Creator Dashboard
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            High-level performance metrics, USDC smart contract escrow, and live campaign analytics.
          </p>
        </div>

        {/* Interactive Phase Toggle (Validation Phase vs Active Campaign Escrow Phase) */}
        <div className="flex items-center gap-1.5 rounded-full bg-paper/90 border border-border p-1 text-xs font-semibold shadow-2xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActivePhase('VALIDATION')}
            className={`rounded-full px-3.5 py-1.5 transition cursor-pointer ${
              activePhase === 'VALIDATION'
                ? 'bg-accent-500 text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Validation Phase
          </button>
          <button
            type="button"
            onClick={() => setActivePhase('CAMPAIGN')}
            className={`rounded-full px-3.5 py-1.5 transition cursor-pointer ${
              activePhase === 'CAMPAIGN'
                ? 'bg-accent-500 text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Active Campaign Phase
          </button>
        </div>
      </div>

      {/* Web3 Wallet Banner - USDC Escrow Emphasis */}
      <div className="rounded-2xl border border-emerald-900/30 bg-gradient-to-br from-[#052617] via-[#083823] to-[#041f13] p-6 shadow-xs text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Privy Web3 Wallet Connected</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display">USDC On-Chain Escrow &amp; Balance</h2>
          <p className="text-xs text-emerald-100/70">
            Escrow deposits &amp; milestone payouts are executed exclusively in USDC on Solana smart contracts.
          </p>
          <div className="flex flex-wrap items-center gap-5 pt-2 text-sm font-mono">
            <div>
              <span className="text-xs text-emerald-100/70 block font-sans">USDC Escrow Balance</span>
              <span className="font-extrabold text-white text-base">$450.00 USDC</span>
            </div>
            <div className="h-7 w-px bg-white/15 hidden sm:block" />
            <div>
              <span className="text-xs text-emerald-100/70 block font-sans">{activeCurrency.tokenSymbol} ({activeCurrency.code} Rail) {activeCurrency.flag}</span>
              <span className="font-extrabold text-emerald-300 text-base">$166.67 <span className="text-xs font-normal text-emerald-100/60 font-sans">({activeCurrency.symbol}{Math.round(166.67 * activeCurrency.ratePerUsd).toLocaleString()})</span></span>
            </div>
            <div className="h-7 w-px bg-white/15 hidden sm:block" />
            <div>
              <span className="text-xs text-emerald-100/70 block font-sans">SOL Gas</span>
              <span className="font-semibold text-emerald-100/90 text-base">0.45 SOL</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setWalletTab('onramp');
              setWalletModalOpen(true);
            }}
            className="flex-1 sm:flex-none"
          >
            Deposit / On-Ramp
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setWalletTab('offramp');
              setWalletModalOpen(true);
            }}
            className="flex-1 sm:flex-none text-white border-white/25 hover:bg-white/10"
          >
            Cash Out
          </Button>
        </div>
      </div>

      {/* PHASE 1: VALIDATION OVERVIEW */}
      {activePhase === 'VALIDATION' && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block mb-1">
                Active Ideas
              </span>
              <div className="font-display text-3xl font-bold text-ink">
                <Count value={totalIdeas} />
              </div>
              <span className="text-xs text-accent-700 font-medium block mt-1">
                2 Threshold met
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block mb-1">
                USDC Pre-Pledged Intent
              </span>
              <div className="font-display text-3xl font-bold text-ink">
                <Amount value={totalPrePledge} currency="USD" />
              </div>
              <span className="text-xs text-ink-muted block mt-1">
                Across {totalSupporters} backers (USDC Escrow target)
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block mb-1">
                Validation Success
              </span>
              <div className="font-display text-3xl font-bold text-accent-700">
                84.2%
              </div>
              <span className="text-xs text-ink-muted block mt-1">
                Above 75% threshold
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-ink">Pre-Pledge Intent Growth</h3>
                <span className="text-xs text-accent-700 font-semibold">+18.4% this month</span>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                Validation momentum is tracking ahead of threshold deadlines. Backers pledge intent in USDC or local currency rails.
              </p>
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-ink">Fintech &amp; USSD Micro-Payments</span>
                    <span className="font-semibold text-accent-700">$48,500 USDC</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-paper">
                    <div className="h-full bg-accent-500 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-ink">Student Marketplaces</span>
                    <span className="font-semibold text-accent-700">$32,400 USDC</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-paper">
                    <div className="h-full bg-accent-500 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-ink">USDC Escrow Contract Readiness</h3>
                <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[11px] font-semibold text-accent-700 border border-accent-200">
                  Escrow Verified
                </span>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                When validation threshold is met, pre-pledged funds convert into milestone-escrowed USDC smart contracts on Solana.
              </p>
              <div className="rounded-xl bg-paper/60 border border-border p-3.5 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Settlement Asset:</span>
                  <span className="font-semibold text-accent-700">USDC (SPL Token)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Verification Gate:</span>
                  <span className="font-semibold text-ink">Met (4/4 gates verified)</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* PHASE 2: OPTIMIZED ACTIVE CAMPAIGN ESCROW PHASE */}
      {activePhase === 'CAMPAIGN' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-accent-200 bg-accent-50/50 p-5 text-accent-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Pill tone="accent" size="xs">Active Crowdfunding</Pill>
                <span className="text-xs font-semibold">PayFlex Lagos Campaign</span>
              </div>
              <p className="text-xs text-accent-800">
                Campaign is live! Pre-pledged intent has converted into active USDC escrow commitments.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="font-extrabold text-lg text-accent-900">$80,900 Raised</span>
              <span className="text-accent-700">/ $85,000 USDC Goal (95.1%)</span>
            </div>
          </div>

          {/* Active Campaign Escrow Milestone Release Schedule */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">USDC Escrow Milestone Release Schedule</h3>
                <p className="text-xs text-ink-muted">Funds are released progressively as deliverables are verified by backers.</p>
              </div>
              <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-bold text-accent-700 border border-accent-200">
                Solana Smart Escrow Active
              </span>
            </div>

            <div className="space-y-4">
              {CAMPAIGN_MILESTONES.map((m) => (
                <div key={m.id} className="rounded-xl border border-border bg-paper/60 p-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${m.verified ? 'bg-accent-500' : 'bg-ink-muted/40'}`} />
                      <span className="font-bold text-sm text-ink">{m.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-bold text-ink">${m.amount.toLocaleString()} USDC ({m.share})</span>
                      <Pill tone={m.verified ? 'accent' : 'neutral'} size="xs">
                        {m.status}
                      </Pill>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-ink-muted pt-1">
                    <span>Release Condition: Backer Verification Vote</span>
                    <span>Status: {m.releasedDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Ideas Overview Region */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">Recent Projects Overview</h2>
            <p className="text-xs text-ink-muted">Quick preview of your top active pitches and campaigns.</p>
          </div>
          <Link
            href="/ideas/my"
            className="text-xs font-semibold text-accent-700 hover:text-accent-900 hover:underline"
          >
            View all my ideas ({ideas.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {ideas.slice(0, 3).map((idea) => (
            <div
              key={idea.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-4 hover:border-accent-500/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Pill tone={idea.tone} size="xs">
                    {idea.status}
                  </Pill>
                  <span className="text-xs text-ink-muted">{idea.updatedAt}</span>
                </div>
                <Link
                  href={`/ideas/${idea.id}`}
                  className="font-bold text-ink hover:text-accent-700 hover:underline block text-base"
                >
                  {idea.title}
                </Link>
                <p className="text-xs text-ink-muted line-clamp-2 mt-1">
                  {idea.summary}
                </p>
              </div>

              <div className="border-t border-border/60 pt-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-ink-muted block">Supporters</span>
                  <span className="font-semibold text-ink">{idea.supporters}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-ink-muted block">USDC Pledged</span>
                  <span className="font-bold text-accent-700">${idea.prePledgeTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        initialTab={walletTab}
      />

      <BoostModal
        isOpen={boostTarget !== null}
        ideaId={boostTarget?.id ?? ''}
        ideaTitle={boostTarget?.title ?? ''}
        discoverabilityTier={boostTarget?.discoverabilityTier}
        onClose={() => setBoostTarget(null)}
      />
    </div>
  );
}
