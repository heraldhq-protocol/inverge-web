import React from 'react';
import { pageMetadata } from '@/lib/metadata';
import Link from 'next/link';
import { PageHeader } from '@/components/marketing/page-header';
import { CtaBand } from '@/components/marketing/cta-band';
import { Container } from '@/components/ui/container';
import { GUIDES } from '@/lib/content/guides';

export const metadata = pageMetadata({
  title: 'Guides',
  description:
    'Step-by-step guides for backing projects, publishing ideas, milestones, refunds, and verification on Inverge.',
  path: '/guides',
});

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
                className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface p-6 transition-shadow hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-700 transition-colors group-hover:bg-accent-500 group-hover:text-white [&_svg]:h-6 [&_svg]:w-6">
                    {guide.icon}
                  </span>
                  <span className="rounded-full border border-border bg-paper px-2.5 py-1 text-xs font-semibold text-ink-muted">
                    {guide.audience}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="font-display text-xl font-semibold text-ink text-balance group-hover:text-accent-700">
                    {guide.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-ink-muted">{guide.summary}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-xs text-ink-muted">{guide.readingTime} read</span>
                  <span className="text-sm font-semibold text-accent-700">
                    Read guide{' '}
                    <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
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
