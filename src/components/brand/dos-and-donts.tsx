'use client';
import React from 'react';

export function DosAndDonts() {
  const messagingPairs = [
    {
      good: 'Funds are released programmatically when the milestone is verified.',
      avoid: 'Your funds are locked until the magic happens.',
      reason: 'Focus on verifiable programmatic escrow rather than informal promises.',
    },
    {
      good: 'Validate market demand before committing capital.',
      avoid: 'Find the next 100x crypto gem project.',
      reason: 'Communicate evidence-based validation instead of speculative hype.',
    },
    {
      good: 'Verified Founder with milestone-escrowed backing on Solana.',
      avoid: 'Doxxed dev launching a moonshot token.',
      reason: 'Professional institutional phrasing inspires trust among serious backers.',
    },
    {
      good: 'Signal Score 92/100 based on weighted backer feedback.',
      avoid: 'Massive hype and viral moon score.',
      reason: 'Analytical signal metrics convey rigorous data-driven assessment.',
    },
  ];

  const brandRules = [
    {
      category: 'Color System',
      doText: 'Use Emerald Green #1FA85C as the dominant brand accent & CTA color.',
      dontText: 'Do not turn the brand neon or let Solana purple overpower Emerald green.',
    },
    {
      category: 'Logo Usage',
      doText: 'Keep wordmark strictly lowercase "inverge" with 1.5x clear space.',
      dontText: 'Never capitalize as "INVERGE", skew, rotate, or distort logo mark.',
    },
    {
      category: 'Typography',
      doText: 'Use Geist Sans for UI & Geist Mono for all financial values/timers.',
      dontText: 'Never use standard sans font for SOL amounts or transaction hashes.',
    },
    {
      category: 'Page Background',
      doText: 'Use Warm Paper #FBF9F5 canvas background for a humanistic aesthetic.',
      dontText: 'Avoid stark cold grey or pitch-black pure #000000 backgrounds.',
    },
    {
      category: 'Touch Accessibility',
      doText: 'Ensure interactive buttons maintain minimum 44px touch target height.',
      dontText: 'Do not create tiny 24px icon buttons without tap area padding.',
    },
    {
      category: 'Photography & Imagery',
      doText: 'Use authentic photos of creators building, designing, and launching.',
      dontText: 'Avoid generic stock handshakes, laptop photos, or cyberpunk tropes.',
    },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Voice & Messaging Say This vs Avoid This */}
      <div className="rounded-2xl bg-surface border border-border p-8 space-y-6">
        <div>
          <h3 className="font-bold text-lg text-ink">Voice & Messaging: "Say This / Avoid This"</h3>
          <p className="text-xs text-ink-muted">
            Inverge speaks with precision, confidence, and transparency—avoiding Web3 meme hype.
          </p>
        </div>

        <div className="space-y-4">
          {messagingPairs.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* GOOD / SAY THIS */}
              <div className="rounded-xl bg-paper p-5 border border-accent-500/40 space-y-2 relative">
                <div className="flex items-center justify-between text-xs font-bold text-accent-700 uppercase tracking-wider">
                  <span>SAY THIS (APPROVED)</span>
                  <span className="text-[10px] bg-accent-100 text-accent-700 px-2 py-0.5 rounded">Precise</span>
                </div>
                <p className="text-sm font-semibold text-ink">"{item.good}"</p>
                <p className="text-[11px] text-ink-muted pt-1 border-t border-border">{item.reason}</p>
              </div>

              {/* AVOID / DON'T SAY THIS */}
              <div className="rounded-xl bg-paper p-5 border border-danger/40 space-y-2 relative">
                <div className="flex items-center justify-between text-xs font-bold text-danger uppercase tracking-wider">
                  <span>AVOID THIS (PROHIBITED)</span>
                  <span className="text-[10px] bg-danger-50 text-danger-700 px-2 py-0.5 rounded">Speculative Hype</span>
                </div>
                <p className="text-sm font-semibold text-ink line-through opacity-75">"{item.avoid}"</p>
                <p className="text-[11px] text-danger/80 pt-1 border-t border-border">Removes professional trust and clarity.</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Visual Brand Do's & Don'ts Matrix */}
      <div className="rounded-2xl bg-surface border border-border p-8 space-y-6">
        <div>
          <h3 className="font-bold text-lg text-ink">Visual Brand Execution Matrix</h3>
          <p className="text-xs text-ink-muted">
            Quick rule check across colors, logo, typography, layout, and photography.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {brandRules.map((rule, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-paper p-5 space-y-3">
              <span className="text-xs font-bold text-accent-700 bg-accent-50 px-2.5 py-1 rounded-md border border-accent-100 uppercase tracking-wider">
                {rule.category}
              </span>

              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-2 text-xs">
                  <span className="text-accent-500 font-bold shrink-0">DO:</span>
                  <span className="text-ink font-medium leading-snug">{rule.doText}</span>
                </div>
                <div className="flex items-start gap-2 text-xs border-t border-border/60 pt-2">
                  <span className="text-danger font-bold shrink-0">DON'T:</span>
                  <span className="text-ink-muted leading-snug">{rule.dontText}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
