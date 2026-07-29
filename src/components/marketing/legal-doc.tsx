import React from 'react';
import { Container } from '@/components/ui/container';
import { Prose } from './prose';

export interface LegalSection {
  id: string;
  heading: string;
  body: React.ReactNode;
}

/**
 * Two-column legal / policy renderer shared by Terms and Privacy. A static table of contents
 * (plain anchor links — no JS, so this stays a Server Component) sits beside the numbered
 * sections. The nav's landmark name is carried by `aria-label`, not a heading, so the page
 * heading order stays h1 (page title) → h2 (each section).
 */
export function LegalDoc({ sections }: { sections: LegalSection[] }) {
  return (
    <Container className="py-10 md:py-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
        <nav
          aria-label="On this page"
          className="lg:sticky lg:top-8 lg:self-start"
          data-reveal
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-muted">
            On this page
          </p>
          <ol className="space-y-1 border-l border-border">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="-ml-px block border-l-2 border-transparent py-1 pl-4 text-sm text-ink-muted transition-colors hover:border-accent-500 hover:text-ink focus-visible:outline-none focus-visible:text-ink focus-visible:border-accent-500"
                >
                  <span className="mr-1.5 tabular-nums text-ink-muted/60">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 max-w-2xl">
          {sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-24 border-b border-border py-8 first:pt-0 last:border-0"
              data-reveal
            >
              <h2 className="mb-4 font-display text-2xl font-bold tracking-tight text-ink">
                <span className="mr-2 tabular-nums text-accent-700">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {s.heading}
              </h2>
              <Prose>{s.body}</Prose>
            </section>
          ))}
        </div>
      </div>
    </Container>
  );
}
