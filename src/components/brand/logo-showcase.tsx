'use client';
import React, { useState } from 'react';
import Image from 'next/image';

export function LogoShowcase() {
  const [activeSize, setActiveSize] = useState<'sm' | 'md' | 'lg'>('md');

  const sizingPresets = {
    sm: { mark: 22, text: 'text-lg', label: 'Small (22px Mark)', context: 'App top navigation bar, chrome header' },
    md: { mark: 28, text: 'text-2xl', label: 'Medium (28px Mark)', context: 'Marketing website navbar, landing page hero' },
    lg: { mark: 48, text: 'text-4xl', label: 'Large (48px Mark)', context: 'Pitch presentation splash, onboarding modals' },
  };

  const misuses = [
    { title: 'Do Not Distort / Stretch', desc: 'Never stretch or alter aspect ratio of logo mark' },
    { title: 'Do Not Rotate / Skew', desc: 'Keep logo level at 0° rotation angle' },
    { title: 'Do Not Capitalize as "INVERGE"', desc: 'Wordmark is strictly lowercase "inverge"' },
    { title: 'Do Not CamelCase as "InVerge"', desc: 'Avoid mixed casing in wordmark branding' },
    { title: 'Do Not Use Neon Colors', desc: 'Avoid unapproved neon or bright crypto hues' },
    { title: 'Do Not Add Gradients', desc: 'Keep mark flat solid Emerald #1FA85C fill' },
    { title: 'Do Not Add Heavy Drop Shadows', desc: 'Avoid blurred black drop shadows behind logo' },
    { title: 'Do Not Outline Logo Mark', desc: 'Do not add strokes around rounded-square icon' },
    { title: 'Do Not Recolor Icon Elements', desc: 'Internal leaf geometry remains white #FFFFFF' },
    { title: 'Do Not Low-Contrast Place', desc: 'Ensure 4.5:1 minimum contrast background' },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Core Logo Variations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Logo (Warm Paper Background) */}
        <div className="rounded-2xl bg-paper border border-border p-5 sm:p-8 flex flex-col justify-between space-y-8 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-muted uppercase tracking-wider">
            <span>Primary Brand Logo</span>
            <span className="bg-surface px-2 py-1 rounded-md border border-border">Warm Paper (#FBF9F5)</span>
          </div>

          <div className="py-8 flex items-center justify-center">
            <div className="inline-flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm shrink-0">
                <Image src="/icon.svg" alt="Inverge Mark" fill className="object-contain" />
              </div>
              <span className="font-display text-3xl font-bold tracking-tight text-ink">
                inverge
              </span>
            </div>
          </div>

          <div className="text-xs text-ink-muted border-t border-border pt-4 flex justify-between items-center">
            <span>Emerald Icon (#1FA85C) + Ink Text (#1F1F1E)</span>
            <span className="text-accent-700 font-semibold">Standard Usage</span>
          </div>
        </div>

        {/* Reversed Logo (Deep Forest Background) */}
        <div className="rounded-2xl bg-forest border border-forest p-5 sm:p-8 flex flex-col justify-between space-y-8 shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold text-white/70 uppercase tracking-wider">
            <span>Reversed Logo</span>
            <span className="bg-white/10 px-2 py-1 rounded-md text-white">Deep Forest (#0D1D15)</span>
          </div>

          <div className="py-8 flex items-center justify-center">
            <div className="inline-flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm shrink-0">
                <Image src="/icon.svg" alt="Inverge Mark" fill className="object-contain" />
              </div>
              <span className="font-display text-3xl font-bold tracking-tight text-white">
                inverge
              </span>
            </div>
          </div>

          <div className="text-xs text-white/70 border-t border-white/10 pt-4 flex justify-between items-center">
            <span>Emerald Icon + White Text (#FFFFFF)</span>
            <span className="text-accent-100 font-semibold">Dark Backgrounds</span>
          </div>
        </div>

        {/* Icon Only Mark */}
        <div className="rounded-2xl bg-surface border border-border p-5 sm:p-8 flex flex-col justify-between space-y-8 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-muted uppercase tracking-wider">
            <span>Icon Only Mark</span>
            <span className="bg-paper px-2 py-1 rounded-md border border-border">25% Corner Radius</span>
          </div>

          <div className="py-8 flex items-center justify-center gap-6">
            <div className="relative w-16 h-16 rounded-[16px] overflow-hidden shadow-md">
              <Image src="/icon.svg" alt="Inverge Icon Large" fill className="object-contain" />
            </div>
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm">
              <Image src="/icon.svg" alt="Inverge Icon Medium" fill className="object-contain" />
            </div>
            <div className="relative w-6 h-6 rounded-md overflow-hidden">
              <Image src="/icon.svg" alt="Inverge Icon Small" fill className="object-contain" />
            </div>
          </div>

          <div className="text-xs text-ink-muted border-t border-border pt-4 flex justify-between items-center">
            <span>Standalone Mark for Avatars & Favicons</span>
            <span className="font-mono text-[11px]">16 / 32 / 64px</span>
          </div>
        </div>

        {/* Monochrome Logo Variations */}
        <div className="rounded-2xl bg-surface border border-border p-5 sm:p-8 flex flex-col justify-between space-y-8 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-muted uppercase tracking-wider">
            <span>Monochrome Versions</span>
            <span className="bg-paper px-2 py-1 rounded-md border border-border">1-Color Printing</span>
          </div>

          <div className="py-6 grid grid-cols-2 gap-4 items-center justify-items-center">
            {/* Pure Black */}
            <div className="inline-flex items-center gap-2 p-3 bg-paper rounded-xl w-full justify-center">
              <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center text-white font-bold text-xs">
                inv
              </div>
              <span className="font-display text-lg font-bold text-black">inverge</span>
            </div>

            {/* Pure White on Black */}
            <div className="inline-flex items-center gap-2 p-3 bg-black rounded-xl w-full justify-center text-white">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-black font-bold text-xs">
                inv
              </div>
              <span className="font-display text-lg font-bold text-white">inverge</span>
            </div>
          </div>

          <div className="text-xs text-ink-muted border-t border-border pt-4 flex justify-between items-center">
            <span>Single-color print & legal documents</span>
            <span className="text-ink font-semibold">Strict Monochrome</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Logo Sizing Presets */}
      <div className="rounded-2xl bg-surface border border-border p-5 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="font-bold text-lg text-ink">Logo Sizing & Proportion Presets</h3>
            <p className="text-xs text-ink-muted">
              Select a size preset below to see the proportional mark and wordmark sizing.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-paper p-1 rounded-xl border border-border text-xs font-medium">
            {(['sm', 'md', 'lg'] as const).map((sz) => (
              <button
                key={sz}
                onClick={() => setActiveSize(sz)}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider font-semibold transition-all ${
                  activeSize === sz
                    ? 'bg-accent-500 text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {sz} ({sizingPresets[sz].mark}px)
              </button>
            ))}
          </div>
        </div>

        <div className="bg-paper rounded-xl p-10 flex flex-col items-center justify-center border border-border min-h-[160px]">
          <div className="inline-flex items-center gap-3">
            <div
              className="relative shadow-sm transition-all duration-300"
              style={{ width: `${sizingPresets[activeSize].mark}px`, height: `${sizingPresets[activeSize].mark}px` }}
            >
              <Image src="/icon.svg" alt="Sized Inverge Mark" fill className="object-contain" />
            </div>
            <span
              className={`font-display font-bold tracking-tight text-ink transition-all ${sizingPresets[activeSize].text}`}
            >
              inverge
            </span>
          </div>
          <div className="mt-4 text-xs font-semibold text-accent-700 bg-accent-50 px-3 py-1 rounded-full border border-accent-100">
            {sizingPresets[activeSize].label} — {sizingPresets[activeSize].context}
          </div>
        </div>
      </div>

      {/* 3. Interactive Clear Space Visual Diagram */}
      <div className="rounded-2xl bg-surface border border-border p-5 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <h3 className="font-bold text-lg text-ink">Clear Space Specification</h3>
            <p className="text-xs text-ink-muted">
              Minimum clear space must equal <strong>1.5× the height of the mark (X)</strong> on all four sides.
            </p>
          </div>
          <span className="rounded-full bg-accent-100 text-accent-700 px-3 py-1 text-xs font-semibold self-start sm:self-auto">
            Clear Space = 1.5× Mark Height
          </span>
        </div>

        <div className="relative bg-paper rounded-xl p-4 sm:p-8 md:p-12 border border-dashed border-accent-500/50 flex items-center justify-center overflow-x-auto">
          {/* Dashed clearance boundary box */}
          <div className="relative border-2 border-dashed border-accent-500 bg-accent-50/40 p-8 rounded-xl flex items-center justify-center">
            {/* Clearance labels */}
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold bg-accent-500 text-white px-2 py-0.5 rounded">
              1.5X TOP CLEARANCE
            </span>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold bg-accent-500 text-white px-2 py-0.5 rounded">
              1.5X BOTTOM CLEARANCE
            </span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-mono font-bold bg-accent-500 text-white px-2 py-0.5 rounded">
              1.5X LEFT
            </span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-[10px] font-mono font-bold bg-accent-500 text-white px-2 py-0.5 rounded">
              1.5X RIGHT
            </span>

            {/* Core Logo */}
            <div className="inline-flex items-center gap-3 bg-surface p-4 rounded-lg shadow-sm border border-border z-10">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                <Image src="/icon.svg" alt="Mark" fill className="object-contain" />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-ink">
                inverge
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Prohibited Logo Misuses Grid */}
      <div className="rounded-2xl bg-surface border border-border p-5 sm:p-8 space-y-6">
        <div>
          <h3 className="font-bold text-lg text-ink">Logo Misuse Rules (10 Prohibited Executions)</h3>
          <p className="text-xs text-ink-muted">
            To preserve brand integrity, never apply the following modifications to the Inverge mark or wordmark.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {misuses.map((item, i) => (
            <div
              key={i}
              className="rounded-xl bg-paper p-4 border border-danger/20 flex flex-col justify-between space-y-3 hover:border-danger/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-danger bg-danger-50 px-2 py-0.5 rounded uppercase">
                  PROHIBITED
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-ink leading-snug">{item.title}</h4>
                <p className="text-[11px] text-ink-muted pt-1 leading-tight">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
