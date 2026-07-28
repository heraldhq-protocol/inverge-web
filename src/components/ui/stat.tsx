import React from 'react';
import { cn } from '@/lib/utils';
import { Amount, Count } from './amount';

export interface StatProps {
  label: string;
  value: number | string;
  type?: 'amount' | 'count';
  currency?: string;
  delta?: string;
  className?: string;
  /**
   * Width held open for the figure, in `ch`. Tabular figures make `ch` exact, and because it
   * scales with font-size the reservation can never overflow its own grid column — which a
   * fixed px min-width does at tablet widths.
   */
  reserveClass?: string;
}

export function Stat({
  label,
  value,
  type = 'count',
  currency = 'NGN',
  delta,
  className,
  reserveClass,
}: StatProps) {
  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <span className="text-sm font-medium text-white/60">{label}</span>

      <div
        className={cn(
          'font-display text-3xl font-bold tracking-tight text-white sm:text-4xl xl:text-5xl',
          reserveClass
        )}
        data-count={label}
      >
        {type === 'amount' ? (
          <Amount value={value} currency={currency} />
        ) : (
          <Count value={value} />
        )}
      </div>

      {delta && (
        <div className="inline-flex items-center self-start gap-1.5 rounded-full border border-accent-500/30 bg-accent-900/60 px-3 py-1 text-sm font-semibold text-accent-100 transition-transform duration-200 hover:scale-[1.03] hover:border-accent-500/50">
          <span aria-hidden="true">↗</span>
          <span>{delta}</span>
        </div>
      )}
    </div>
  );
}
