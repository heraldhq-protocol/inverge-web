import React from 'react';
import { Logo } from '@/components/ui/logo';
import { AuthForm } from '@/components/auth/auth-form';

interface AuthSplitLayoutProps {
  initialMode?: 'signin' | 'signup';
}

export function AuthSplitLayout({ initialMode = 'signup' }: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-paper overflow-x-hidden">
      {/* Left Panel - Premium Brand Panel (~45% width on desktop) */}
      <div className="w-full lg:w-[45%] bg-gradient-to-br from-[#052617] via-[#083823] to-[#03180e] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative shrink-0 overflow-hidden">
        {/* Subtle background ambient mesh glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Logo variant="dark" />
        </div>

        {/* Hero Copy, Milestone Proof Card & Stats Group */}
        <div className="my-10 lg:my-0 max-w-lg space-y-8 relative z-10">
          {/* Main Headline & Subtitle */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-emerald-200 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Milestone-Gated Crowdfunding</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold text-white tracking-tight leading-[1.15]">
              Back money that <span className="text-emerald-400">has to deliver.</span>
            </h2>
            <p className="text-base text-emerald-100/75 leading-relaxed font-normal">
              Funds are held in on-chain Solana escrow. Every milestone is approved by backers before money pays out.
            </p>
          </div>

          {/* Mini Live Escrow Proof Widget */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-emerald-300">Live Escrow Guarantee</span>
              <span className="flex items-center gap-1.5 text-white/80 font-mono text-[11px]">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Solana Mainnet
              </span>
            </div>

            <div className="flex items-center justify-between text-sm pt-1">
              <span className="font-medium text-white">Milestone 2: Production Pilot</span>
              <span className="font-bold text-emerald-400 font-mono">$12,500 USDC</span>
            </div>

            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-3/4 rounded-full bg-emerald-400" />
            </div>

            <p className="text-[11px] text-emerald-100/60 leading-tight">
              ✓ Backers vote to release funds upon verified proof. Undelivered stages auto-refund.
            </p>
          </div>

          {/* Stats Group */}
          <div className="grid grid-cols-2 gap-4 border-t border-white/15 pt-6">
            <div className="space-y-1">
              <span className="font-sans text-2xl sm:text-[30px] font-extrabold text-white tabular-nums tracking-tight block">
                $48,200
              </span>
              <span className="text-xs text-emerald-100/70 block">
                released across 61 milestones
              </span>
            </div>

            <div className="space-y-1 border-l border-white/15 pl-4">
              <span className="font-sans text-2xl sm:text-[30px] font-extrabold text-emerald-400 tabular-nums tracking-tight block">
                $3,100
              </span>
              <span className="text-xs text-emerald-100/70 block">
                refunded automatically
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 hidden lg:block text-xs text-emerald-100/50">
          Inverge Escrow System &bull; Powered by Solana PDAs
        </div>
      </div>

      {/* Right Panel - Auth Form Column (~55% width on desktop) */}
      <div className="w-full lg:w-[55%] bg-paper flex items-center justify-center py-12 px-6 sm:px-12 lg:py-16">
        <AuthForm initialMode={initialMode} />
      </div>
    </div>
  );
}
