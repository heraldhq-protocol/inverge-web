'use client';
import React, { useState } from 'react';

interface ColorSwatchProps {
  name: string;
  hex: string;
  oklch?: string;
  role: string;
  usage?: string;
  darkText?: boolean;
  border?: boolean;
  contrastRatio?: string;
  badge?: string;
}

export function ColorSwatch({
  name,
  hex,
  oklch,
  role,
  usage,
  darkText = false,
  border = false,
  contrastRatio,
  badge,
}: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={handleCopy}
      className={`group relative flex flex-col justify-between rounded-xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer border select-none ${
        border ? 'border-border' : 'border-transparent'
      }`}
      style={{ backgroundColor: hex }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              darkText ? 'text-ink' : 'text-white'
            }`}
          >
            {name}
          </span>
          {badge && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                darkText
                  ? 'bg-ink/10 text-ink'
                  : 'bg-white/20 text-white backdrop-blur-sm'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-all ${
            darkText
              ? 'bg-ink/10 text-ink hover:bg-ink/20'
              : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
          }`}
          title="Click to copy HEX"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="mt-8 space-y-1">
        <div
          className={`font-mono text-lg font-bold tracking-tight ${
            darkText ? 'text-ink' : 'text-white'
          }`}
        >
          {hex}
        </div>
        {oklch && (
          <div
            className={`font-mono text-[11px] opacity-80 ${
              darkText ? 'text-ink-muted' : 'text-white/80'
            }`}
          >
            {oklch}
          </div>
        )}
        <div
          className={`text-xs font-medium pt-1 ${
            darkText ? 'text-ink-muted' : 'text-white/90'
          }`}
        >
          {role}
        </div>
        {usage && (
          <div
            className={`text-[11px] opacity-75 line-clamp-2 ${
              darkText ? 'text-ink-muted' : 'text-white/75'
            }`}
          >
            {usage}
          </div>
        )}
        {contrastRatio && (
          <div
            className={`inline-block mt-2 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
              darkText
                ? 'bg-ink/5 text-ink-muted border border-ink/10'
                : 'bg-white/10 text-white/90 border border-white/20'
            }`}
          >
            Contrast: {contrastRatio}
          </div>
        )}
      </div>

      {copied && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-accent-500/90 text-white font-bold text-sm backdrop-blur-sm transition-all animate-in fade-in zoom-in-95">
          Copied {hex}!
        </div>
      )}
    </div>
  );
}
