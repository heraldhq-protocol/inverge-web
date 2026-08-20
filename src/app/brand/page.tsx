'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { BrandSidebar } from '@/components/brand/brand-sidebar';
import { BrandHeader } from '@/components/brand/brand-header';
import { ColorSwatch } from '@/components/brand/color-swatch';
import { TypeSpecimen } from '@/components/brand/type-specimen';
import { LogoShowcase } from '@/components/brand/logo-showcase';
import { ComponentShowcase } from '@/components/brand/component-showcase';
import { TokenCopyButton } from '@/components/brand/token-copy-button';
import { DosAndDonts } from '@/components/brand/dos-and-donts';
import { ChecklistInteractive } from '@/components/brand/checklist-interactive';

export default function BrandGuidelinesPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [taglineCopied, setTaglineCopied] = useState(false);

  const handleCopyTagline = () => {
    navigator.clipboard.writeText('People helping ambitious people build.');
    setTaglineCopied(true);
    setTimeout(() => setTaglineCopied(false), 2000);
  };

  // Scroll observer to update active section in sidebar
  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = [
        'overview',
        'logo',
        'colour',
        'typography',
        'layout',
        'radius',
        'elevation',
        'components',
        'imagery',
        'iconography',
        'motion',
        'voice',
        'dos-donts',
        'tokens',
        'checklist',
      ];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 140) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-accent-500 selection:text-white flex flex-col lg:flex-row font-sans">
      {/* Persistent Left Sidebar / Mobile Nav */}
      <BrandSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main Content Scroll Canvas */}
      <div className="flex-1 min-w-0 flex flex-col pt-14 lg:pt-0">
        <BrandHeader />

        <main className="flex-1 p-4 sm:p-8 lg:p-12 max-w-6xl w-full mx-auto space-y-16 sm:space-y-24 pt-6 sm:pt-8 pb-24">
          {/* Print-Only Professional Document Header */}
          <div className="hidden print:flex items-center justify-between border-b border-border pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="font-display text-xl font-bold text-ink">inverge</span>
              <span className="text-xs font-mono font-bold text-accent-700 bg-accent-50 px-2.5 py-0.5 rounded border border-accent-100 uppercase">
                BRAND SYSTEM v1.0
              </span>
            </div>
            <span className="text-xs text-ink-muted font-mono">
              Official Brand Guidelines & Design Tokens • Inverge Platform
            </span>
          </div>

          {/* ===================================================================
              SECTION 1: BRAND OVERVIEW
             =================================================================== */}
          <section id="overview" className="space-y-8 scroll-mt-24">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-50 text-accent-700 text-xs font-semibold border border-accent-100">
                <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse no-print"></span>
                Official Design System Specification • v1.0
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink">
                INVERGE
              </h1>
              <p className="text-xl sm:text-2xl font-semibold text-accent-700 max-w-3xl leading-snug">
                Milestone-Escrowed Crowdfunding & Idea Validation on Solana
              </p>
              <p className="text-base text-ink-muted max-w-2xl leading-relaxed">
                Inverge represents the convergence of <strong>INVEST + CONVERGE</strong>. It is designed around milestone-based escrow smart contracts, allowing backers to support projects while funds are released programmatically when verifiable milestones are achieved.
              </p>

              {/* Core Token Metadata Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono text-ink-muted">
                <span className="bg-surface px-3 py-1 rounded-lg border border-border">
                  Primary: <strong className="text-accent-700">#1FA85C</strong>
                </span>
                <span className="bg-surface px-3 py-1 rounded-lg border border-border">
                  Canvas: <strong className="text-ink">#FBF9F5</strong>
                </span>
                <span className="bg-surface px-3 py-1 rounded-lg border border-border">
                  Contrast: <strong className="text-forest">#0D1D15</strong>
                </span>
                <span className="bg-surface px-3 py-1 rounded-lg border border-border">
                  Type: <strong>Geist Sans & Mono</strong>
                </span>
              </div>
            </div>

            {/* Core Positioning Banner */}
            <div
              onClick={handleCopyTagline}
              className="p-8 rounded-2xl bg-forest text-white shadow-lift space-y-3 border border-forest relative overflow-hidden cursor-pointer hover:border-accent-500/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-100">
                  Brand Positioning Statement
                </span>
                <span className="text-[10px] font-mono font-bold bg-white/10 text-accent-100 px-2 py-0.5 rounded group-hover:bg-accent-500 group-hover:text-white transition-all no-print">
                  {taglineCopied ? 'Tagline Copied!' : 'Click to Copy Tagline'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                "People helping ambitious people build."
              </h2>
              <p className="text-sm text-white/80 max-w-2xl leading-relaxed">
                Communicating trust, collective action, growth, validation, transparency, ambition, human creativity, and modern Web3 infrastructure without becoming cold or corporate.
              </p>
            </div>

            {/* 4 Core Brand Pillars Cards Grid */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-ink-muted uppercase tracking-widest">
                The Four Core Brand Pillars
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-surface border border-border space-y-3 shadow-xs hover:border-accent-500/40 transition-all">
                  <div className="text-xs font-mono font-bold text-accent-700 bg-accent-50 w-8 h-8 rounded-lg border border-accent-100 flex items-center justify-center">
                    01
                  </div>
                  <h4 className="font-bold text-lg text-ink">TRUSTWORTHY ESCROW</h4>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Backers pledge funds into Solana smart contracts released only when verifiable milestones are met. Eliminates execution risk.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-surface border border-border space-y-3 shadow-xs hover:border-accent-500/40 transition-all">
                  <div className="text-xs font-mono font-bold text-accent-700 bg-accent-50 w-8 h-8 rounded-lg border border-accent-100 flex items-center justify-center">
                    02
                  </div>
                  <h4 className="font-bold text-lg text-ink">DATA-DRIVEN VALIDATION</h4>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Ideas undergo Phase 0 pre-pledge validation using weighted feedback and signal scores before capital commitment.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-surface border border-border space-y-3 shadow-xs hover:border-accent-500/40 transition-all">
                  <div className="text-xs font-mono font-bold text-accent-700 bg-accent-50 w-8 h-8 rounded-lg border border-accent-100 flex items-center justify-center">
                    03
                  </div>
                  <h4 className="font-bold text-lg text-ink">WEB3 NATIVE, WEB2 FRICTIONLESS</h4>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Modern Web3 infrastructure powered by embedded wallets (Privy) and Solana transactions without unnecessary user complexity.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-surface border border-border space-y-3 shadow-xs hover:border-accent-500/40 transition-all">
                  <div className="text-xs font-mono font-bold text-accent-700 bg-accent-50 w-8 h-8 rounded-lg border border-accent-100 flex items-center justify-center">
                    04
                  </div>
                  <h4 className="font-bold text-lg text-ink">HIGH-CONTRAST WARMTH</h4>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    A premium humanistic identity (Warm Paper `#FBF9F5` + Emerald `#1FA85C`) that avoids cold blue fintech and chaotic neon crypto aesthetics.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================================
              SECTION 2: LOGO SYSTEM
             =================================================================== */}
          <section id="logo" className="space-y-8 scroll-mt-24 border-t border-border pt-12">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-accent-700 uppercase tracking-widest">
                Section 02
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-ink">
                Logo System
              </h2>
              <p className="text-sm text-ink-muted max-w-2xl">
                The Inverge logo combines the emerald geometric rounded-square mark with the lowercase <strong>inverge</strong> wordmark.
              </p>
            </div>

            <LogoShowcase />
          </section>

          {/* ===================================================================
              SECTION 3: COLOUR SYSTEM
             =================================================================== */}
          <section id="colour" className="space-y-8 scroll-mt-24 border-t border-border pt-12">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-accent-700 uppercase tracking-widest">
                Section 03
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-ink">
                Colour System Architecture
              </h2>
              <p className="text-sm text-ink-muted max-w-2xl">
                Click any color swatch below to copy its HEX value to clipboard.
              </p>
            </div>

            {/* Emerald Ramp */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-ink uppercase tracking-wider">
                Primary Brand Colour & Accent Ramp (Emerald Green)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <ColorSwatch
                  name="Accent 50"
                  hex="#F2FAF5"
                  oklch="oklch(0.96 0.03 150)"
                  role="Hover wash & success pills"
                  darkText
                  border
                />
                <ColorSwatch
                  name="Accent 100"
                  hex="#DCF3E4"
                  oklch="oklch(0.91 0.06 150)"
                  role="Active tab & progress track"
                  darkText
                  border
                />
                <ColorSwatch
                  name="Accent 500"
                  hex="#1FA85C"
                  oklch="oklch(0.58 0.18 152)"
                  role="Primary CTA & Brand Accent"
                  contrastRatio="4.5:1+"
                  badge="PRIMARY BRAND"
                />
                <ColorSwatch
                  name="Accent 700"
                  hex="#14723E"
                  oklch="oklch(0.42 0.14 152)"
                  role="High-contrast small text"
                  contrastRatio="7.1:1+"
                />
                <ColorSwatch
                  name="Accent 900"
                  hex="#0A3F22"
                  oklch="oklch(0.26 0.08 152)"
                  role="Deep accent & pressed state"
                />
              </div>
            </div>

            {/* Neutral Palette */}
            <div className="space-y-4 pt-4">
              <h3 className="font-bold text-sm text-ink uppercase tracking-wider">
                Neutral Paper & Surface Palette
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <ColorSwatch
                  name="Paper"
                  hex="#FBF9F5"
                  oklch="oklch(0.975 0.006 95)"
                  role="Main page canvas background"
                  darkText
                  border
                  badge="CANVAS BASE"
                />
                <ColorSwatch
                  name="Surface"
                  hex="#FFFFFF"
                  oklch="oklch(1.000 0.000 95)"
                  role="Card & modal surfaces"
                  darkText
                  border
                />
                <ColorSwatch
                  name="Ink"
                  hex="#1F1F1E"
                  oklch="oklch(0.180 0.010 95)"
                  role="Primary text & headings"
                  contrastRatio="14.2:1 (AAA)"
                />
                <ColorSwatch
                  name="Ink Muted"
                  hex="#71716E"
                  oklch="oklch(0.480 0.010 95)"
                  role="Secondary text & metadata"
                  contrastRatio="4.8:1 (AA)"
                />
                <ColorSwatch
                  name="Border"
                  hex="#EAE6E1"
                  oklch="oklch(0.910 0.010 95)"
                  role="Subtle warm card border"
                  darkText
                  border
                />
                <ColorSwatch
                  name="Deep Forest"
                  hex="#0D1D15"
                  oklch="oklch(0.180 0.045 155)"
                  role="Dark contrast band & footer"
                  badge="CONTRAST BAND"
                />
                <ColorSwatch
                  name="Muted Forest"
                  hex="#A3B8AC"
                  oklch="oklch(0.720 0.030 155)"
                  role="Text on Deep Forest cards"
                  darkText
                  border
                />
              </div>
            </div>

            {/* Functional Colors */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-ink uppercase tracking-wider">
                  Functional State Colors
                </h3>
                <span className="text-xs font-mono font-bold text-accent-700 bg-accent-50 px-2.5 py-1 rounded border border-accent-100">
                  Solana Purple = Functional Web3 Only
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ColorSwatch
                  name="Success"
                  hex="#1FA85C"
                  role="Verified milestones & goals"
                />
                <ColorSwatch
                  name="Danger"
                  hex="#D94A38"
                  role="Failed/refunded pledges"
                />
                <ColorSwatch
                  name="Warning"
                  hex="#D97706"
                  role="Pending review amber"
                />
                <ColorSwatch
                  name="Solana Purple"
                  hex="#9945FF"
                  role="Web3 & wallet badges only"
                  badge="WEB3 ONLY"
                />
              </div>

              {/* Solana Rule Callout Box */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <strong className="font-bold block text-sm pb-1">Important Branding Discipline:</strong>
                Solana Purple (`#9945FF`) is a functional Web3 color, NOT a primary Inverge brand color. Do not allow Solana purple to visually overpower Inverge Emerald Green (`#1FA85C`).
              </div>
            </div>
          </section>

          {/* ===================================================================
              SECTION 4: TYPOGRAPHY
             =================================================================== */}
          <section id="typography" className="space-y-8 scroll-mt-24 border-t border-border pt-12">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-accent-700 uppercase tracking-widest">
                Section 04
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-ink">
                Typography System
              </h2>
              <p className="text-sm text-ink-muted max-w-2xl">
                Dual typeface architecture: <strong>Geist Sans</strong> for general UI & headings, <strong>Geist Mono</strong> for numeric data & financials.
              </p>
            </div>

            <TypeSpecimen />
          </section>

          {/* ===================================================================
              SECTION 5: LAYOUT & SPACING
             =================================================================== */}
          <section id="layout" className="space-y-8 scroll-mt-24 border-t border-border pt-12">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-accent-700 uppercase tracking-widest">
                Section 05
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-ink">
                Layout & Spacing System (4px Multiples Grid)
              </h2>
              <p className="text-sm text-ink-muted max-w-2xl">
                Visual rhythm scale based on strict 4px increments for paddings, gaps, and section bounds.
              </p>
            </div>

            <div className="rounded-2xl bg-surface border border-border p-8 space-y-6">
              <h3 className="font-bold text-sm text-ink uppercase tracking-wider">
                Spacing Scale Grid (4px - 96px)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
                {[4, 8, 12, 16, 24, 32, 48, 64, 80, 96].map((space) => (
                  <div key={space} className="rounded-xl bg-paper p-3 border border-border text-center space-y-2">
                    <span className="font-mono text-xs font-bold text-accent-700">{space}px</span>
                    <div
                      className="bg-accent-500 mx-auto rounded-sm"
                      style={{ width: `${Math.min(space, 40)}px`, height: '6px' }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===================================================================
              SECTION 6: BORDER RADIUS
             =================================================================== */}
          <section id="radius" className="space-y-8 scroll-mt-24 border-t border-border pt-12">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-accent-700 uppercase tracking-widest">
                Section 06
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-ink">
                Border Radius Tokens
              </h2>
              <p className="text-sm text-ink-muted max-w-2xl">
                Structured corner radius system mapped to specific component tiers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
                <div className="w-16 h-16 rounded-[6px] bg-accent-500/20 border-2 border-accent-500 flex items-center justify-center font-mono font-bold text-accent-700 text-xs">
                  6px
                </div>
                <h4 className="font-bold text-sm text-ink">6px (rounded-md)</h4>
                <p className="text-xs text-ink-muted">Inputs, buttons, pills, tags, tooltips</p>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
                <div className="w-16 h-16 rounded-[12px] bg-accent-500/20 border-2 border-accent-500 flex items-center justify-center font-mono font-bold text-accent-700 text-xs">
                  12px
                </div>
                <h4 className="font-bold text-sm text-ink">12px (rounded-lg)</h4>
                <p className="text-xs text-ink-muted">Cards, dropdowns, pitch sections</p>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
                <div className="w-16 h-16 rounded-[16px] bg-accent-500/20 border-2 border-accent-500 flex items-center justify-center font-mono font-bold text-accent-700 text-xs">
                  16px
                </div>
                <h4 className="font-bold text-sm text-ink">16px (rounded-xl)</h4>
                <p className="text-xs text-ink-muted">Hero cards, feature blocks, modals</p>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
                <div className="w-16 h-16 rounded-full bg-accent-500/20 border-2 border-accent-500 flex items-center justify-center font-mono font-bold text-accent-700 text-xs">
                  9999px
                </div>
                <h4 className="font-bold text-sm text-ink">9999px (rounded-full)</h4>
                <p className="text-xs text-ink-muted">Avatars, status dots, circular buttons</p>
              </div>
            </div>
          </section>

          {/* ===================================================================
              SECTION 7: ELEVATION & SHADOWS
             =================================================================== */}
          <section id="elevation" className="space-y-8 scroll-mt-24 border-t border-border pt-12">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-accent-700 uppercase tracking-widest">
                Section 07
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-ink">
                Elevation & Warm Shadows
              </h2>
              <p className="text-sm text-ink-muted max-w-2xl">
                Warm-tinted shadows matching paper canvas to eliminate cold grey casts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3 shadow-subtle">
                <span className="text-xs font-bold text-accent-700 uppercase tracking-wider">Subtle Shadow</span>
                <p className="text-xs text-ink-muted">0 2px 4px -1px with low-opacity warm neutral</p>
                <div className="text-[11px] font-mono text-ink-muted pt-2 border-t border-border">--shadow-subtle</div>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3 shadow-lift hover:-translate-y-1 transition-all">
                <span className="text-xs font-bold text-accent-700 uppercase tracking-wider">Medium Lift Shadow</span>
                <p className="text-xs text-ink-muted">0 18px 40px -12px with warm neutral tint</p>
                <div className="text-[11px] font-mono text-ink-muted pt-2 border-t border-border">--shadow-lift</div>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3 shadow-lift-lg">
                <span className="text-xs font-bold text-accent-700 uppercase tracking-wider">Large Depth Shadow</span>
                <p className="text-xs text-ink-muted">0 32px 64px -16px with warm neutral tint</p>
                <div className="text-[11px] font-mono text-ink-muted pt-2 border-t border-border">--shadow-lift-lg</div>
              </div>
            </div>
          </section>

          {/* ===================================================================
              SECTION 8: CORE UI COMPONENTS
             =================================================================== */}
          <section id="components" className="space-y-8 scroll-mt-24 border-t border-border pt-12">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-accent-700 uppercase tracking-widest">
                Section 08
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-ink">
                Core UI Component Showcase
              </h2>
              <p className="text-sm text-ink-muted max-w-2xl">
                Interactive live component implementations enforcing brand styling & 44px minimum touch targets.
              </p>
            </div>

            <ComponentShowcase />
          </section>

          {/* ===================================================================
              SECTION 9: IMAGERY & ILLUSTRATION
             =================================================================== */}
          <section id="imagery" className="space-y-8 scroll-mt-24 border-t border-border pt-12">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-accent-700 uppercase tracking-widest">
                Section 09
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-ink">
                Imagery & Illustration Direction
              </h2>
              <p className="text-sm text-ink-muted max-w-2xl">
                Authentic, contemporary, builder-oriented photography depicting real creators and ambitious teams.
              </p>
            </div>

            <div className="rounded-2xl bg-surface border border-border p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-bold text-xs text-accent-700 uppercase tracking-wider">
                    PREFERRED PHOTOGRAPHY DIRECTION
                  </h3>
                  <ul className="text-xs text-ink space-y-2">
                    <li>• People actually building, designing, prototyping, collaborating, & launching.</li>
                    <li>• Real workshops, studios, laboratories, and laptop workspaces.</li>
                    <li>• Authentic and contemporary African creator identity.</li>
                    <li>• High contrast warm lighting with subtle emerald ambient reflections.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-xs text-danger uppercase tracking-wider">
                    IMAGERY TO AVOID
                  </h3>
                  <ul className="text-xs text-ink-muted space-y-2">
                    <li>• Generic corporate stock handshakes in suit jackets.</li>
                    <li>• Obvious crypto casino imagery, coins falling, or neon rocket ships.</li>
                    <li>• Cyberpunk aesthetics, blue matrix code rain, or dark sci-fi tropes.</li>
                    <li>• Overly staged or stereotypical representations.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================================
              SECTION 10: ICONOGRAPHY & LOGO INTEGRITY
             =================================================================== */}
          <section id="iconography" className="space-y-8 scroll-mt-24 border-t border-border pt-12">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-accent-700 uppercase tracking-widest">
                Section 10
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-ink">
                Iconography & Visual Identifier Standards
              </h2>
              <p className="text-sm text-ink-muted max-w-2xl">
                The official Inverge logo mark is the primary brand identifier. Non-logo decorative iconography is strictly minimized across official brand assets to maintain pristine typography and clarity.
              </p>
            </div>

            <div className="rounded-2xl bg-surface border border-border p-8 space-y-6">
              <div className="flex items-center gap-4 border-b border-border pb-6">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm shrink-0">
                  <Image src="/icon.svg" alt="Inverge Mark" fill className="object-contain" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-ink">Sole Brand Icon Identifier</h4>
                  <p className="text-xs text-ink-muted">
                    The rounded-square converging leaf mark is the only approved brand glyph. Avoid adding arbitrary decorative icons or unapproved pictorial art to UI layouts.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-ink-muted pt-2">
                <div className="p-4 rounded-xl bg-paper border border-border">
                  <span className="font-bold text-ink block font-sans text-sm pb-1">Clean Typography First</span>
                  Rely on Geist Sans hierarchy & Geist Mono metrics rather than decorative graphics.
                </div>
                <div className="p-4 rounded-xl bg-paper border border-border">
                  <span className="font-bold text-ink block font-sans text-sm pb-1">Functional Indicators Only</span>
                  Use simple structural CSS shapes (dots, progress bars, pill boundaries) for status.
                </div>
                <div className="p-4 rounded-xl bg-paper border border-border">
                  <span className="font-bold text-ink block font-sans text-sm pb-1">Strict Logo Usage</span>
                  Always render the Inverge mark using the official vector SVG assets without alteration.
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================================
              SECTION 11: MOTION LANGUAGE
             =================================================================== */}
          <section id="motion" className="space-y-8 scroll-mt-24 border-t border-border pt-12">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-accent-700 uppercase tracking-widest">
                Section 11
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-ink">
                Motion Language & Accessibility
              </h2>
              <p className="text-sm text-ink-muted max-w-2xl">
                Fast, precise, subtle, and intentional motion curves with reduced-motion support.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
                <span className="text-xs font-bold text-accent-700 uppercase tracking-wider">Micro-Interactions</span>
                <div className="font-mono text-lg font-bold text-ink">150 – 200ms</div>
                <p className="text-xs text-ink-muted">Button hover, toggle, & pressed feedback</p>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
                <span className="text-xs font-bold text-accent-700 uppercase tracking-wider">Component Entrances</span>
                <div className="font-mono text-lg font-bold text-ink">300 – 400ms</div>
                <p className="text-xs text-ink-muted">Modals, dropdowns, & drawer reveals</p>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
                <span className="text-xs font-bold text-accent-700 uppercase tracking-wider">Section Reveals</span>
                <div className="font-mono text-lg font-bold text-ink">600 – 700ms</div>
                <p className="text-xs text-ink-muted">Scroll-driven page entrance stagger</p>
              </div>
            </div>
          </section>

          {/* ===================================================================
              SECTION 12: VOICE & TONE
             =================================================================== */}
          <section id="voice" className="space-y-8 scroll-mt-24 border-t border-border pt-12">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-accent-700 uppercase tracking-widest">
                Section 12
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-ink">
                Voice & Tone Guidelines
              </h2>
              <p className="text-sm text-ink-muted max-w-2xl">
                Precise, confident, human, transparent, founder-friendly, and backer-protective.
              </p>
            </div>

            <DosAndDonts />
          </section>

          {/* ===================================================================
              SECTION 13: DO'S & DON'TS
             =================================================================== */}
          <section id="dos-donts" className="space-y-8 scroll-mt-24 border-t border-border pt-12">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-accent-700 uppercase tracking-widest">
                Section 13
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-ink">
                Brand Execution Checklist
              </h2>
              <p className="text-sm text-ink-muted max-w-2xl">
                Summary of approved vs prohibited brand practices.
              </p>
            </div>
          </section>

          {/* ===================================================================
              SECTION 14: DEVELOPER TOKENS
             =================================================================== */}
          <section id="tokens" className="space-y-8 scroll-mt-24 border-t border-border pt-12">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-accent-700 uppercase tracking-widest">
                Section 14
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-ink">
                Developer Design Tokens
              </h2>
              <p className="text-sm text-ink-muted max-w-2xl">
                Copyable CSS variables for developer integration.
              </p>
            </div>

            <TokenCopyButton />
          </section>

          {/* ===================================================================
              SECTION 15: BRAND CHECKLIST
             =================================================================== */}
          <section id="checklist" className="space-y-8 scroll-mt-24 border-t border-border pt-12">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-accent-700 uppercase tracking-widest">
                Section 15
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-ink">
                11-Point Brand Audit Checklist
              </h2>
              <p className="text-sm text-ink-muted max-w-2xl">
                Run through this pre-flight audit checklist before publishing any Inverge asset.
              </p>
            </div>

            <ChecklistInteractive />
          </section>
        </main>
      </div>
    </div>
  );
}
