'use client';
import React, { useState } from 'react';

interface TokenItem {
  name: string;
  value: string;
  description: string;
  category: 'color' | 'typography' | 'shadow' | 'radius';
}

export function TokenCopyButton() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const tokens: TokenItem[] = [
    { name: '--color-accent-50', value: 'oklch(0.96 0.03 150) / #F2FAF5', description: 'Soft green background wash & hover pill fills', category: 'color' },
    { name: '--color-accent-100', value: 'oklch(0.91 0.06 150) / #DCF3E4', description: 'Active tab background & progress bar track', category: 'color' },
    { name: '--color-accent-500', value: 'oklch(0.58 0.18 152) / #1FA85C', description: 'Primary brand accent & main CTA button fill', category: 'color' },
    { name: '--color-accent-700', value: 'oklch(0.42 0.14 152) / #14723E', description: 'High-contrast green text & badge labels', category: 'color' },
    { name: '--color-accent-900', value: 'oklch(0.26 0.08 152) / #0A3F22', description: 'Deep emerald accent & active pressed states', category: 'color' },
    
    { name: '--color-paper', value: 'oklch(0.975 0.006 95) / #FBF9F5', description: 'Main page canvas background (Warm Paper)', category: 'color' },
    { name: '--color-surface', value: 'oklch(1 0 0) / #FFFFFF', description: 'Pure white surface for cards & modals', category: 'color' },
    { name: '--color-ink', value: 'oklch(0.18 0.01 95) / #1F1F1E', description: 'Primary headings & main body text (14.2:1 contrast)', category: 'color' },
    { name: '--color-ink-muted', value: 'oklch(0.48 0.01 95) / #71716E', description: 'Secondary labels, subtitles, & metadata (4.8:1 contrast)', category: 'color' },
    { name: '--color-border', value: 'oklch(0.91 0.01 95) / #EAE6E1', description: 'Subtle warm card border & section divider', category: 'color' },
    { name: '--color-forest', value: 'oklch(0.18 0.045 155) / #0D1D15', description: 'Deep dark forest band, stat strip, & footer', category: 'color' },

    { name: '--color-danger', value: 'oklch(0.55 0.13 32) / #D94A38', description: 'Failed milestone & refund state terracotta red', category: 'color' },
    { name: '--color-danger-50', value: 'oklch(0.96 0.02 40) / #FDF3F1', description: 'Danger alert wash background', category: 'color' },
    { name: '--color-danger-700', value: 'oklch(0.44 0.13 32) / #9E2D20', description: 'High-contrast small danger text', category: 'color' },
    { name: '--color-warning', value: 'oklch(0.68 0.16 75) / #D97706', description: 'Milestone review pending warm amber badge', category: 'color' },
    { name: '--color-solana', value: 'oklch(0.58 0.24 300) / #9945FF', description: 'Web3 / Solana wallet connection indicator', category: 'color' },

    { name: '--font-sans', value: 'var(--font-geist-sans), system-ui, sans-serif', description: 'Primary UI, body, headings, & buttons', category: 'typography' },
    { name: '--font-mono', value: 'var(--font-geist-mono), monospace', description: 'Pledge amounts, SOL values, wallet hashes, timers', category: 'typography' },

    { name: '--shadow-subtle', value: '0 2px 4px -1px oklch(0.2 0.02 95 / 0.06)', description: 'Subtle card border elevation', category: 'shadow' },
    { name: '--shadow-lift', value: '0 18px 40px -12px oklch(0.2 0.02 95 / 0.2)', description: 'Card hover lift shadow', category: 'shadow' },
    { name: '--shadow-lift-lg', value: '0 32px 64px -16px oklch(0.2 0.02 95 / 0.24)', description: 'Modal & hero section depth shadow', category: 'shadow' },
  ];

  const handleCopySingle = (name: string) => {
    navigator.clipboard.writeText(`var(${name})`);
    setCopiedToken(name);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleCopyAllCSS = () => {
    const cssBlock = `@theme {
  --color-accent-50: oklch(0.96 0.03 150);
  --color-accent-100: oklch(0.91 0.06 150);
  --color-accent-500: oklch(0.58 0.18 152);
  --color-accent-700: oklch(0.42 0.14 152);
  --color-accent-900: oklch(0.26 0.08 152);
  --color-forest: oklch(0.18 0.045 155);

  --color-paper: oklch(0.975 0.006 95);
  --color-surface: oklch(1 0 0);
  --color-ink: oklch(0.18 0.01 95);
  --color-ink-muted: oklch(0.48 0.01 95);
  --color-border: oklch(0.91 0.01 95);

  --color-danger: oklch(0.55 0.13 32);
  --color-danger-50: oklch(0.96 0.02 40);
  --color-danger-700: oklch(0.44 0.13 32);
  --color-warning: oklch(0.68 0.16 75);
  --color-solana: oklch(0.58 0.24 300);

  --shadow-subtle: 0 2px 4px -1px oklch(0.2 0.02 95 / 0.06);
  --shadow-lift: 0 18px 40px -12px oklch(0.2 0.02 95 / 0.2);
  --shadow-lift-lg: 0 32px 64px -16px oklch(0.2 0.02 95 / 0.24);
}`;
    navigator.clipboard.writeText(cssBlock);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h3 className="font-bold text-lg text-ink">Developer Design Tokens (CSS Variables)</h3>
          <p className="text-xs text-ink-muted">
            Tailwind v4 / CSS theme variables. Click any token to copy variable name.
          </p>
        </div>
        <button
          onClick={handleCopyAllCSS}
          className="min-h-[44px] px-5 rounded-xl bg-accent-500 hover:bg-accent-700 text-white font-semibold text-xs tracking-wider transition-all shadow-xs shrink-0"
        >
          {copiedAll ? 'Copied @theme CSS Block!' : 'Copy Complete @theme Block'}
        </button>
      </div>

      <div className="space-y-3">
        {tokens.map((token) => (
          <div
            key={token.name}
            onClick={() => handleCopySingle(token.name)}
            className="group rounded-xl bg-surface border border-border p-4 transition-all hover:border-accent-500/50 hover:shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-accent-700 group-hover:text-accent-500 transition-colors">
                  {token.name}
                </span>
                <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-paper border border-border text-ink-muted">
                  {token.category}
                </span>
              </div>
              <p className="text-xs text-ink-muted">{token.description}</p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <span className="font-mono text-xs font-semibold text-ink bg-paper px-3 py-1.5 rounded-lg border border-border">
                {token.value}
              </span>
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent-50 text-accent-700 hover:bg-accent-100 transition-all border border-accent-100 shrink-0"
              >
                {copiedToken === token.name ? 'Copied!' : 'Copy var'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
