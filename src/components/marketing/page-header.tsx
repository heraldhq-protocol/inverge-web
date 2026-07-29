import React from 'react';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  /** Small muted line under the lede — e.g. "Last updated 29 July 2026". */
  meta?: React.ReactNode;
  align?: 'left' | 'center';
  /** CTA row, search box, or filters rendered beneath the lede. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * The shared hero for the secondary marketing pages (about, careers, legal, help…).
 * Cream band, one `<h1>` per page, entrance markers matching the landing hero
 * (`data-enter` + inline `--inv-delay` stagger) so it plays once on load and is fully
 * visible under `prefers-reduced-motion` or with JS disabled.
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  meta,
  align = 'center',
  children,
  className,
}: PageHeaderProps) {
  const centered = align === 'center';

  return (
    <header className={cn('relative bg-paper pt-14 pb-10 md:pt-20 md:pb-14', className)}>
      <Container
        className={cn(
          'flex flex-col gap-5',
          centered ? 'items-center text-center' : 'items-start text-left'
        )}
      >
        <Eyebrow data-enter>{eyebrow}</Eyebrow>

        <h1
          className={cn(
            'font-display text-4xl font-bold tracking-tight text-ink text-balance sm:text-5xl md:text-6xl',
            centered ? 'max-w-3xl' : 'max-w-4xl',
            '[--inv-delay:80ms]'
          )}
          data-enter
        >
          {title}
        </h1>

        {lede && (
          <p
            className={cn(
              'max-w-2xl text-lg leading-relaxed text-ink-muted text-pretty',
              centered && 'mx-auto',
              '[--inv-delay:160ms]'
            )}
            data-enter
          >
            {lede}
          </p>
        )}

        {meta && (
          <p className="text-sm text-ink-muted/80 [--inv-delay:200ms]" data-enter>
            {meta}
          </p>
        )}

        {children && (
          <div className={cn('w-full [--inv-delay:240ms]', centered && 'flex justify-center')} data-enter>
            {children}
          </div>
        )}
      </Container>
    </header>
  );
}
