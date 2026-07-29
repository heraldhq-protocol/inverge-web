import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Prose } from '@/components/marketing/prose';
import { CtaBand } from '@/components/marketing/cta-band';
import { GUIDES, getGuide, type Guide } from '@/lib/content/guides';
import { cn } from '@/lib/utils';
import { pageMetadata } from '@/lib/metadata';

// Next 16: params is a Promise (conventions §2.1).
type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: 'Guide not found' };
  return pageMetadata({
    title: guide.title,
    description: guide.summary,
    path: `/guides/${guide.slug}`,
  });
}

function ClockIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2.5 1.5" />
    </svg>
  );
}

function GuideNavCard({ guide, direction }: { guide: Guide; direction: 'prev' | 'next' }) {
  const isNext = direction === 'next';
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className={cn(
        'group flex flex-col gap-1.5 rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2',
        isNext && 'sm:items-end sm:text-right'
      )}
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
        {isNext ? 'Next guide' : 'Previous guide'}
      </span>
      <span className="inline-flex items-center gap-1.5 font-display font-semibold text-ink group-hover:text-accent-700">
        {!isNext && <span aria-hidden="true">←</span>}
        <span className="text-balance">{guide.title}</span>
        {isNext && <span aria-hidden="true">→</span>}
      </span>
    </Link>
  );
}

export default async function GuidePage({ params }: Params) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const index = GUIDES.findIndex((g) => g.slug === slug);
  const prev = index > 0 ? GUIDES[index - 1] : null;
  const next = index < GUIDES.length - 1 ? GUIDES[index + 1] : null;
  const lastStep = guide.steps.length - 1;

  return (
    <>
      <article>
        <header className="bg-paper pt-14 pb-10 md:pt-20 md:pb-12">
          <Container className="max-w-3xl">
            <Link
              href="/guides"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-accent-700"
            >
              <span aria-hidden="true">←</span> All guides
            </Link>

            <div className="mt-8 flex flex-col gap-5">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-50 text-accent-700 [&_svg]:h-7 [&_svg]:w-7">
                {guide.icon}
              </span>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-accent-50 px-2.5 py-1 font-semibold text-accent-700">
                  {guide.audience}
                </span>
                <span className="inline-flex items-center gap-1 text-ink-muted">
                  <ClockIcon />
                  {guide.readingTime} read
                </span>
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight text-ink text-balance sm:text-4xl md:text-5xl">
                {guide.title}
              </h1>
              <p className="text-lg leading-relaxed text-ink-muted text-pretty">{guide.summary}</p>
            </div>
          </Container>
        </header>

        <Container className="max-w-3xl pb-16 md:pb-24">
          <Prose className="text-base">{guide.intro}</Prose>

          {/* Steps as a timeline — the connector spine reads the walkthrough as one flow. */}
          <ol className="relative mt-12">
            {guide.steps.map((step, i) => (
              <li key={step.title} className="relative flex gap-5 pb-8 last:pb-0">
                {i < lastStep && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[1.375rem] top-12 bottom-0 w-px -translate-x-1/2 bg-border"
                  />
                )}
                <span
                  aria-hidden="true"
                  className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-500 font-display text-sm font-bold tabular-nums text-white shadow-sm ring-4 ring-paper"
                >
                  {i + 1}
                </span>
                <div className="min-w-0 pt-2">
                  <h2 className="font-display text-lg font-semibold text-ink">{step.title}</h2>
                  <Prose className="mt-2">{step.body}</Prose>
                </div>
              </li>
            ))}
          </ol>

          {(prev || next) && (
            <nav
              aria-label="More guides"
              className="mt-14 grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-2"
            >
              {prev ? <GuideNavCard guide={prev} direction="prev" /> : <span className="hidden sm:block" />}
              {next && <GuideNavCard guide={next} direction="next" />}
            </nav>
          )}
        </Container>
      </article>

      <CtaBand
        title="Put it into practice"
        body="Explore live ideas raising in milestones, or publish your own to start validating it."
        primary={{ label: 'Explore ideas', href: '/ideas' }}
        secondary={{ label: 'Start an idea', href: '/ideas/new' }}
      />
    </>
  );
}
