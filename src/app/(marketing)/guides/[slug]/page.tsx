import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Prose } from '@/components/marketing/prose';
import { CtaBand } from '@/components/marketing/cta-band';
import { GUIDES, getGuide } from '@/lib/content/guides';

// Next 16: params is a Promise (conventions §2.1).
type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: 'Guide not found — Inverge' };
  return {
    title: `${guide.title} — Inverge Guides`,
    description: guide.summary,
  };
}

export default async function GuidePage({ params }: Params) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

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

            <div className="mt-6 flex flex-col gap-5">
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-accent-50 px-2.5 py-1 font-semibold text-accent-700">
                  {guide.audience}
                </span>
                <span className="text-ink-muted">{guide.readingTime} read</span>
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-ink text-balance sm:text-4xl md:text-5xl">
                {guide.title}
              </h1>
            </div>
          </Container>
        </header>

        <Container className="max-w-3xl pb-16 md:pb-24">
          <Prose className="text-base">{guide.intro}</Prose>

          <ol className="mt-10 flex flex-col gap-6">
            {guide.steps.map((step, i) => (
              <li key={step.title} className="flex gap-4 sm:gap-5">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-500 font-display text-sm font-bold tabular-nums text-white"
                >
                  {i + 1}
                </span>
                <div className="min-w-0 pt-1">
                  <h2 className="font-display text-lg font-semibold text-ink">{step.title}</h2>
                  <Prose className="mt-2">{step.body}</Prose>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-12 border-t border-border pt-8">
            <Eyebrow>Keep reading</Eyebrow>
            <Link
              href="/guides"
              className="mt-3 inline-flex items-center gap-1.5 font-display text-lg font-semibold text-ink hover:text-accent-700"
            >
              Browse all guides
              <span aria-hidden="true">→</span>
            </Link>
          </div>
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
