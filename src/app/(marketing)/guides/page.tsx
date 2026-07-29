import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/marketing/page-header';
import { CtaBand } from '@/components/marketing/cta-band';
import { Container } from '@/components/ui/container';
import { GUIDES } from '@/lib/content/guides';

export const metadata: Metadata = {
  title: 'Guides — Inverge',
  description:
    'Step-by-step guides for backing projects, publishing ideas, milestones, refunds, and verification on Inverge.',
};

export default function GuidesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Guides"
        title="Learn how Inverge works"
        lede="Short, practical walkthroughs, whether you’re backing your first project or publishing an idea to raise."
      />

      <Container className="pb-16 md:pb-24">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2" data-stagger>
          {GUIDES.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/guides/${guide.slug}`}
                className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-6 transition-shadow hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-accent-50 px-2.5 py-1 font-semibold text-accent-700">
                    {guide.audience}
                  </span>
                  <span className="text-ink-muted">{guide.readingTime} read</span>
                </div>
                <h2 className="font-display text-xl font-semibold text-ink text-balance group-hover:text-accent-700">
                  {guide.title}
                </h2>
                <p className="text-sm leading-relaxed text-ink-muted">{guide.summary}</p>
                <span className="mt-auto pt-2 text-sm font-semibold text-accent-700">
                  Read guide{' '}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>

      <CtaBand
        title="Ready to put it into practice?"
        body="Explore live ideas or publish your own and start validating it today."
        primary={{ label: 'Explore ideas', href: '/ideas' }}
        secondary={{ label: 'Start an idea', href: '/ideas/new' }}
      />
    </>
  );
}
