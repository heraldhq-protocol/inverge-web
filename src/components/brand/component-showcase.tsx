'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CoinIcon, FlagIcon, LockIcon, SignalIcon, UsersIcon, PaletteIcon } from '@/components/brand/brand-icons';

export function ComponentShowcase() {
  const [buttonState, setButtonState] = useState<'default' | 'loading' | 'success'>('default');
  const [pledgeProgress, setPledgeProgress] = useState(68);
  const [activeTab, setActiveTab] = useState<'all' | 'buttons' | 'meters' | 'badges' | 'cards' | 'forms'>('all');

  const handleSimulateAction = () => {
    setButtonState('loading');
    setTimeout(() => {
      setButtonState('success');
      setTimeout(() => setButtonState('default'), 2000);
    }, 1200);
  };

  return (
    <div className="space-y-12">
      {/* Interactive Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border text-sm">
        {[
          { id: 'all', label: 'All Components' },
          { id: 'buttons', label: 'Buttons (44px Min)' },
          { id: 'meters', label: 'Progress Meters' },
          { id: 'badges', label: 'Escrow Badges' },
          { id: 'cards', label: 'Cards & Receipts' },
          { id: 'forms', label: 'Forms & Inputs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-accent-500 text-white shadow-xs'
                : 'bg-surface text-ink-muted hover:text-ink border border-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. BUTTONS SECTION */}
      {(activeTab === 'all' || activeTab === 'buttons') && (
        <div className="rounded-2xl bg-surface border border-border p-5 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 className="font-bold text-lg text-ink">1. Action Buttons & Touch Target Rule</h3>
              <p className="text-xs text-ink-muted">
                All interactive buttons must maintain a minimum height of <strong>44px</strong> for touch accessibility.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-accent-700 bg-accent-50 px-3 py-1.5 rounded-full border border-accent-100 self-start sm:self-auto">
              Target Height: ≥ 44px
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {/* Primary Button */}
            <div className="p-4 rounded-xl bg-paper border border-border space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">Primary CTA</span>
                <p className="text-[11px] text-ink-muted">Emerald fill (#1FA85C) + White text</p>
              </div>
              <div className="pt-2">
                <Button variant="primary" size="md" className="btn-touch w-full">
                  Pledge Funds (44px)
                </Button>
              </div>
            </div>

            {/* Secondary Button */}
            <div className="p-4 rounded-xl bg-paper border border-border space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">Secondary CTA</span>
                <p className="text-[11px] text-ink-muted">White surface + Warm border</p>
              </div>
              <div className="pt-2">
                <Button variant="outline" size="md" className="btn-touch w-full">
                  View Pitch Details
                </Button>
              </div>
            </div>

            {/* Ghost Button */}
            <div className="p-4 rounded-xl bg-paper border border-border space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">Ghost Action</span>
                <p className="text-[11px] text-ink-muted">Transparent + Muted text</p>
              </div>
              <div className="pt-2">
                <Button variant="ghost" size="md" className="btn-touch w-full">
                  Share Campaign
                </Button>
              </div>
            </div>

            {/* Destructive Button */}
            <div className="p-4 rounded-xl bg-paper border border-border space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-danger">Destructive</span>
                <p className="text-[11px] text-ink-muted">Terracotta (#D94A38) + White</p>
              </div>
              <div className="pt-2">
                <button className="btn-touch w-full rounded-full bg-danger hover:bg-danger-700 text-white font-medium text-sm px-4 py-2.5 transition-all shadow-xs active:scale-[0.98]">
                  Cancel Pre-Pledge
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Action Simulator */}
          <div className="mt-4 p-4 rounded-xl bg-accent-50/50 border border-accent-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs">
              <strong className="text-accent-900 block">Interactive State Simulator:</strong>
              <span className="text-accent-700">Click button to test active loading state transition.</span>
            </div>
            <button
              onClick={handleSimulateAction}
              disabled={buttonState !== 'default'}
              className="w-full sm:w-auto min-h-[44px] px-6 rounded-full bg-accent-500 hover:bg-accent-700 text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2"
            >
              {buttonState === 'default' && 'Simulate Escrow Deposit'}
              {buttonState === 'loading' && (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing Escrow...
                </>
              )}
              {buttonState === 'success' && 'Escrow Deposit Verified!'}
            </button>
          </div>
        </div>
      )}

      {/* 2. PROGRESS METERS SECTION */}
      {(activeTab === 'all' || activeTab === 'meters') && (
        <div className="rounded-2xl bg-surface border border-border p-5 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 className="font-bold text-lg text-ink">2. Funding Progress Meters</h3>
              <p className="text-xs text-ink-muted">
                Meter tracks use Accent 100 background with Accent 500 fill. Percentages MUST use Geist Mono.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <label className="text-xs font-semibold text-ink-muted">Adjust Level:</label>
              <input
                type="range"
                min="0"
                max="100"
                value={pledgeProgress}
                onChange={(e) => setPledgeProgress(Number(e.target.value))}
                className="w-32 accent-accent-500"
              />
            </div>
          </div>

          <div className="space-y-6 pt-2">
            {/* Standard Funding Progress Bar */}
            <div className="p-6 rounded-xl bg-paper border border-border space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-ink">Campaign Target ($50,000 Goal)</span>
                <span className="font-mono font-bold text-accent-700 text-base">{pledgeProgress}% Funded</span>
              </div>
              <div className="w-full h-3 rounded-full bg-accent-100 overflow-hidden">
                <div
                  className="h-full bg-accent-500 transition-all duration-500 rounded-full"
                  style={{ width: `${pledgeProgress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-ink-muted pt-1">
                <span>Raised: ${(pledgeProgress * 500).toLocaleString()} USD</span>
                <span>342 Backers</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ESCROW STATUS BADGES SECTION */}
      {(activeTab === 'all' || activeTab === 'badges') && (
        <div className="rounded-2xl bg-surface border border-border p-5 sm:p-8 space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="font-bold text-lg text-ink">3. Milestone & Escrow Status Badges</h3>
            <p className="text-xs text-ink-muted">
              Pill badges with explicit status color hierarchy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            {/* Verified / Unlocked Badge */}
            <div className="p-5 rounded-xl bg-paper border border-border space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">Verified / Released</span>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-accent-50 text-accent-700 border border-accent-100">
                  <span className="w-2 h-2 rounded-full bg-accent-500"></span>
                  Milestone 1 Verified
                </span>
              </div>
              <p className="text-[11px] text-ink-muted">Funds unlocked to founder smart wallet</p>
            </div>

            {/* In Escrow / Locked Badge */}
            <div className="p-5 rounded-xl bg-paper border border-border space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">In Escrow / Locked</span>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-paper text-ink-muted border border-border">
                  Milestone 2 Escrowed
                </span>
              </div>
              <p className="text-[11px] text-ink-muted">Funds held securely in Solana escrow contract</p>
            </div>

            {/* Phase 0 Validation Badge */}
            <div className="p-5 rounded-xl bg-paper border border-border space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Phase 0 Validation</span>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-warning-50 text-warning-700 border border-amber-200">
                  Signal Score 92/100
                </span>
              </div>
              <p className="text-[11px] text-ink-muted">Idea stage pre-pledge demand validation</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. CARDS & RECEIPTS SECTION */}
      {(activeTab === 'all' || activeTab === 'cards') && (
        <div className="rounded-2xl bg-surface border border-border p-5 sm:p-8 space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="font-bold text-lg text-ink">4. Cards, Receipts & Wallet Identity</h3>
            <p className="text-xs text-ink-muted">
              Production card components displaying campaign overview and transaction receipts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {/* Campaign Card Preview */}
            <div className="rounded-2xl bg-surface border border-border p-4 sm:p-6 shadow-lift space-y-4 hover:border-accent-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-accent-50 text-accent-700 border border-accent-100">
                  ✓ Milestone Escrow Active
                </span>
                <span className="font-mono text-xs text-ink-muted">Phase 1 of 3</span>
              </div>

              <div>
                <h4 className="font-bold text-xl text-ink">Solana Decoupled Indexer SDK</h4>
                <p className="text-xs text-ink-muted pt-1 line-clamp-2">
                  High-throughput zero-copy indexer for Solana accounts with real-time WebSocket streams and audit trail.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink">Pledged: $42,500</span>
                  <span className="font-mono font-bold text-accent-700">85% Goal</span>
                </div>
                <div className="w-full h-2 rounded-full bg-accent-100 overflow-hidden">
                  <div className="h-full bg-accent-500 rounded-full w-[85%]"></div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-forest text-white font-bold flex items-center justify-center text-[10px]">
                    SD
                  </div>
                  <span className="font-medium text-ink">SolanaDevs Guild</span>
                </div>
                <Button variant="primary" size="sm">
                  Support Idea
                </Button>
              </div>
            </div>

            {/* Solana On-Chain Transaction Receipt */}
            <div className="rounded-2xl bg-forest text-white p-4 sm:p-6 shadow-md space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-bold text-accent-100 uppercase tracking-wider text-[11px]">
                  Solana Escrow Receipt
                </span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] text-white">CONFIRMED</span>
              </div>

              <div className="space-y-2 py-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Transaction Hash:</span>
                  <span className="text-white font-semibold">5K9x...b3Zq</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Escrow Contract:</span>
                  <span className="text-accent-100 font-semibold">inv_escrow_v2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Pledge Amount:</span>
                  <span className="text-white font-bold text-sm">25.00 SOL ($3,750 USD)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Milestone Release:</span>
                  <span className="text-white/90">Stage 1 Audit Completion</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-white/70">
                <span>Timestamp: 2026-08-20 10:14:02 UTC</span>
                <span className="text-accent-100 hover:underline cursor-pointer">View on Solscan ↗</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. FORMS & INPUTS SECTION */}
      {(activeTab === 'all' || activeTab === 'forms') && (
        <div className="rounded-2xl bg-surface border border-border p-5 sm:p-8 space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="font-bold text-lg text-ink">5. Form Fields & Interactive Inputs</h3>
            <p className="text-xs text-ink-muted">
              Input fields use a 6px border radius, warm focus rings, and persistent helper text.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Standard Text Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                Project Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Milestone-Escrowed Crowdfunding App"
                className="w-full rounded-md border border-border bg-paper px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-surface transition-all"
              />
              <p className="text-[11px] text-ink-muted">Give your idea a clear, ambitious name.</p>
            </div>

            {/* Numeric Amount Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                Funding Target (USDC / SOL)
              </label>
              <div className="relative">
                <input
                  type="text"
                  defaultValue="25,000"
                  className="w-full rounded-md border border-border bg-paper px-4 py-2.5 text-sm font-mono font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-surface transition-all tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-accent-700 bg-accent-50 px-2 py-1 rounded">
                  USDC
                </span>
              </div>
              <p className="text-[11px] text-ink-muted">Numeric input uses Geist Mono tabular figures.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
