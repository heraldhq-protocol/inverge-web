'use client';
import React, { useState } from 'react';

interface ChecklistItem {
  id: string;
  question: string;
  category: string;
}

export function ChecklistInteractive() {
  const items: ChecklistItem[] = [
    { id: 'c1', question: 'Does this design look unmistakably like Inverge?', category: 'Brand Identity' },
    { id: 'c2', question: 'Is Emerald Green (#1FA85C) being used appropriately as the primary accent?', category: 'Color' },
    { id: 'c3', question: 'Is the logo being used correctly in lowercase "inverge" with 1.5x clear space?', category: 'Logo' },
    { id: 'c4', question: 'Is typography consistent with Geist Sans for general UI & headings?', category: 'Typography' },
    { id: 'c5', question: 'Are financial numbers, SOL values, & timers using Geist Mono tabular figures?', category: 'Typography' },
    { id: 'c6', question: 'Is the visual hierarchy clear with proper 4px grid spacing?', category: 'Layout' },
    { id: 'c7', question: 'Is the language precise, founder-friendly, & free of Web3 meme hype?', category: 'Voice & Tone' },
    { id: 'c8', question: 'Does the design communicate trust, milestone escrow rigor, & transparency?', category: 'Trust' },
    { id: 'c9', question: 'Does it feel modern, ambitious, & globally relevant?', category: 'Positioning' },
    { id: 'c10', question: 'Does it strictly avoid generic crypto casino & cold blue bank aesthetics?', category: 'Visual Language' },
    { id: 'c11', question: 'Does it preserve Inverge\'s signature warmth and humanity (Warm Paper canvas)?', category: 'Canvas & Warmth' },
  ];

  const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCheckedState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checkedCount = Object.values(checkedState).filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / items.length) * 100);

  const resetChecklist = () => {
    setCheckedState({});
  };

  return (
    <div className="rounded-2xl bg-surface border border-border p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="font-bold text-lg text-ink">Inverge Brand Audit Checklist (11 Points)</h3>
          <p className="text-xs text-ink-muted">
            Run through this checklist before publishing any marketing, web UI, or product asset.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="font-mono text-sm font-bold text-accent-700">
              {checkedCount} / {items.length} Checked
            </span>
            <span className="text-xs text-ink-muted block">{progressPercent}% Ready</span>
          </div>
          <button
            onClick={resetChecklist}
            className="text-xs text-ink-muted hover:text-ink underline"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 rounded-full bg-paper border border-border overflow-hidden">
        <div
          className="h-full bg-accent-500 transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Checklist items */}
      <div className="space-y-3 pt-2">
        {items.map((item) => {
          const isChecked = !!checkedState[item.id];
          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                isChecked
                  ? 'bg-accent-50/60 border-accent-500/40 text-ink'
                  : 'bg-paper border-border hover:border-border/80 text-ink/90'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  isChecked
                    ? 'bg-accent-500 text-white font-bold text-xs'
                    : 'border-2 border-border bg-surface'
                }`}
              >
                {isChecked && '✓'}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-ink leading-snug">{item.question}</span>
                  <span className="text-[10px] font-semibold text-ink-muted bg-surface px-2 py-0.5 rounded border border-border">
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {progressPercent === 100 && (
        <div className="p-4 rounded-xl bg-accent-500 text-white font-bold text-sm text-center shadow-md animate-in fade-in zoom-in-95">
          100% Brand Approved! This asset is ready for publication.
        </div>
      )}
    </div>
  );
}
