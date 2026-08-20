'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface SectionNav {
  id: string;
  title: string;
  number: string;
  category: string;
}

const SECTIONS: SectionNav[] = [
  { id: 'overview', title: 'Brand Overview', number: '01', category: 'Foundation' },
  { id: 'logo', title: 'Logo System', number: '02', category: 'Identity' },
  { id: 'colour', title: 'Colour System', number: '03', category: 'Identity' },
  { id: 'typography', title: 'Typography', number: '04', category: 'Identity' },
  { id: 'layout', title: 'Layout & Spacing', number: '05', category: 'System' },
  { id: 'radius', title: 'Border Radius', number: '06', category: 'System' },
  { id: 'elevation', title: 'Elevation & Shadows', number: '07', category: 'System' },
  { id: 'components', title: 'Core UI Components', number: '08', category: 'Components' },
  { id: 'imagery', title: 'Imagery & Illustration', number: '09', category: 'Assets' },
  { id: 'iconography', title: 'Iconography', number: '10', category: 'Assets' },
  { id: 'motion', title: 'Motion Language', number: '11', category: 'Behavior' },
  { id: 'voice', title: 'Voice & Tone', number: '12', category: 'Editorial' },
  { id: 'dos-donts', title: "Do's & Don'ts", number: '13', category: 'Editorial' },
  { id: 'tokens', title: 'Developer Tokens', number: '14', category: 'Code' },
  { id: 'checklist', title: 'Brand Checklist', number: '15', category: 'Audit' },
];

export function BrandSidebar({
  activeSection,
  setActiveSection,
}: {
  activeSection: string;
  setActiveSection: (id: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredSections = SECTIONS.filter(
    (sec) =>
      sec.title.toLowerCase().includes(search.toLowerCase()) ||
      sec.category.toLowerCase().includes(search.toLowerCase())
  );

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setMobileOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      {/* Mobile Sticky Top Header Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between shadow-xs">
        <Link href="/brand" className="inline-flex items-center gap-2">
          <div className="relative w-6 h-6 rounded-md overflow-hidden shrink-0">
            <Image src="/icon.svg" alt="Mark" fill className="object-contain" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            inverge
          </span>
          <span className="text-[10px] font-mono uppercase bg-accent-50 text-accent-700 font-bold px-2 py-0.5 rounded border border-accent-100">
            Brand Book
          </span>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-paper border border-border text-ink hover:bg-surface text-xs font-semibold flex items-center gap-1.5"
        >
          <span>{mobileOpen ? 'Close Navigation' : 'Menu & Index ☰'}</span>
        </button>
      </div>

      {/* Mobile Slide-Over Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-80 max-w-[85vw] h-full bg-surface border-r border-border p-6 overflow-y-auto space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <span className="font-bold text-sm text-ink uppercase tracking-wider">Brand Guideline Index</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-xs font-bold text-ink-muted hover:text-ink"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-1">
              {filteredSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                    activeSection === sec.id
                      ? 'bg-accent-500 text-white font-bold shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-paper'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[10px] opacity-75">{sec.number}</span>
                    <span>{sec.title}</span>
                  </span>
                  <span className="text-[10px] opacity-60 uppercase">{sec.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 border-r border-border bg-surface h-screen sticky top-0 overflow-y-auto scrollbar-thin p-6 space-y-6">
        {/* Brand Header */}
        <div className="space-y-3 pb-4 border-b border-border">
          <Link href="/brand" className="inline-flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-xs shrink-0">
              <Image src="/icon.svg" alt="Inverge Mark" fill className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight text-ink leading-none">
                inverge
              </span>
              <span className="text-[10px] font-mono uppercase text-accent-700 font-bold tracking-wider pt-1">
                Brand System v1.0
              </span>
            </div>
          </Link>
          <p className="text-xs text-ink-muted leading-relaxed">
            Visual source of truth for Inverge designers, developers, & creators.
          </p>
        </div>

        {/* Filter Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search index..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-paper px-3.5 py-2 text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-ink-muted uppercase tracking-widest flex justify-between items-center">
            <span>Index ({filteredSections.length})</span>
            <span>Jump</span>
          </div>

          {filteredSections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all group ${
                  isActive
                    ? 'bg-accent-500 text-white font-bold shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-paper'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`font-mono text-[10px] ${
                      isActive ? 'text-white' : 'text-accent-700 group-hover:text-accent-500'
                    }`}
                  >
                    {sec.number}
                  </span>
                  <span className="truncate">{sec.title}</span>
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Badge */}
        <div className="pt-4 border-t border-border text-[11px] text-ink-muted flex items-center justify-between">
          <span>Solana Escrow Crowdfunding</span>
          <span className="font-mono text-[10px] text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-100 font-bold">
            Solana
          </span>
        </div>
      </aside>
    </>
  );
}
