import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  tone?: 'cream' | 'forest' | 'white';
  /** Opt-in only — clipping every section breaks deliberate overlaps and future sticky children. */
  clip?: boolean;
  children: React.ReactNode;
}

export function Section({
  tone = 'cream',
  clip = false,
  id,
  children,
  className,
  ...props
}: SectionProps) {
  const toneStyles = {
    cream: 'bg-paper text-ink',
    forest: 'bg-forest text-white',
    white: 'bg-surface text-ink',
  };

  return (
    <section
      id={id}
      className={cn(
        'relative py-16 md:py-24',
        clip && 'overflow-hidden',
        toneStyles[tone],
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
