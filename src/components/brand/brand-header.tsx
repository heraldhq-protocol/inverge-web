'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export function BrandHeader() {
  const [copied, setCopied] = useState(false);

  const handleCopyTokens = () => {
    const cssBlock = `--color-accent-500: #1FA85C;\n--color-paper: #FBF9F5;\n--color-forest: #0D1D15;\n--color-ink: #1F1F1E;\n--color-surface: #FFFFFF;\n--color-border: #EAE6E1;\n--font-sans: Geist Sans;\n--font-mono: Geist Mono;`;
    navigator.clipboard.writeText(cssBlock);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="sticky top-14 lg:top-0 z-30 bg-paper/90 backdrop-blur-md border-b border-border py-3 px-4 sm:px-8 flex items-center justify-between gap-2.5 no-print">
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-xs font-semibold text-accent-700 bg-accent-50 px-2.5 py-1 rounded-full border border-accent-100 uppercase tracking-wider">
          Official Brand Book & Design Tokens
        </span>
        <span className="text-xs text-ink-muted hidden md:inline">
          Single source of truth for the Inverge Brand
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={handlePrint}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface border border-border text-ink hover:bg-paper transition-all flex items-center gap-1.5 shadow-xs"
          title="Print or Save as PDF"
        >
          <span>Print / Export PDF</span>
        </button>

        <button
          onClick={handleCopyTokens}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface border border-border text-ink hover:bg-paper transition-all flex items-center gap-1.5 shadow-xs"
        >
          <span>{copied ? 'Tokens Copied!' : 'Copy Core Tokens'}</span>
        </button>

        <Link
          href="/"
          className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-accent-500 hover:bg-accent-700 text-white transition-all shadow-xs flex items-center gap-1"
        >
          <span>Launch Web App ↗</span>
        </Link>
      </div>
    </header>
  );
}

