import React from 'react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';

export interface CtaBandProps {
  eyebrow?: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}

/**
 * The closing call-to-action band shared across the secondary pages. Forest tone — the same
 * inverted surface the stat strip and footer use — so these pages resolve back into the
 * landing page's rhythm instead of ending on a flat cream stop.
 */
export function CtaBand({ eyebrow, title, body, primary, secondary }: CtaBandProps) {
  return (
    <section className="bg-forest text-white" data-reveal>
      <Container className="flex flex-col items-center gap-6 py-16 text-center md:py-24">
        {eyebrow && <Eyebrow tone="forest">{eyebrow}</Eyebrow>}

        <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl md:text-5xl">
          {title}
        </h2>

        {body && (
          <p className="max-w-xl text-lg leading-relaxed text-white/70 text-pretty">{body}</p>
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
      </Container>
    </section>
  );
}
