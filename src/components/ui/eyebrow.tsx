import React from 'react';
import { cn } from '@/lib/utils';

export interface EyebrowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  statusDot?: boolean;
  tone?: 'default' | 'forest' | 'accent';
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
        'inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.15em] uppercase',
        tone === 'forest' ? 'text-accent-100' : tone === 'accent' ? 'text-accent-700' : 'text-ink-muted',
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
