import React from 'react';
import { cn } from '@/lib/utils';

export interface EyebrowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  statusDot?: boolean;
  tone?: 'default' | 'forest';
}

export function Eyebrow({
  children,
  statusDot = false,
  tone = 'default',
  className,
  ...props
}: EyebrowProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase',
        // accent-500 on forest lands near 4:1 — under AA for text this small. The pale end of
        // the ramp reads as green and clears 4.5:1 against the band.
        tone === 'forest' ? 'text-accent-100' : 'text-ink-muted',
        className
      )}
      {...props}
    >
      {statusDot && (
        <span className="relative flex h-2 w-2 shrink-0 items-center justify-center" aria-hidden="true">
          <span
            className="absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-75"
            data-live-ring="true"
          />
          <span
            className="relative h-2 w-2 rounded-full bg-accent-500"
            data-live="true"
          />
        </span>
      )}
      <span>{children}</span>
    </div>
  );
}
