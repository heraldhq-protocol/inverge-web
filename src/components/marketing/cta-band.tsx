import React from 'react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';
import { cn } from '@/lib/utils';

export interface CtaBandProps {
  eyebrow?: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  className?: string;
}

/**
 * Floating Dark Forest Card CTA Band.
 * Renders a dark forest green rounded card on warm paper background,
 * creating a clean separation from the dark footer below.
 */
export function CtaBand({
  eyebrow,
  title,
  body,
  primary,
  secondary,
  className,
}: CtaBandProps) {
  return (
    <section className={cn('py-12 md:py-16 bg-paper', className)} data-reveal>
      <Container>
        <div className="relative w-full rounded-2xl md:rounded-3xl bg-forest text-white p-8 sm:p-12 md:p-16 text-center flex flex-col items-center gap-6 overflow-hidden">
          {eyebrow && <Eyebrow tone="forest">{eyebrow}</Eyebrow>}

          <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl md:text-5xl">
            {title}
          </h2>

          {body && (
            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-white/75 text-pretty">
              {body}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button variant="primary" size="lg" href={primary.href}>
              {primary.label}
            </Button>
            {secondary && (
              <Button
                variant="ghost"
                size="lg"
                href={secondary.href}
                className="border border-white/20 text-white hover:bg-white/10"
              >
                {secondary.label}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
