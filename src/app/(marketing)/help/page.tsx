import React from 'react';
import { pageMetadata } from '@/lib/metadata';
import Link from 'next/link';
import { PageHeader } from '@/components/marketing/page-header';
import { CtaBand } from '@/components/marketing/cta-band';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';

export const metadata = pageMetadata({
  title: 'Help Centre',
  description:
    'Answers about backing, building, milestones, refunds, and verification on Inverge.',
  path: '/help',
});

type Topic = { title: string; body: string; href: string };
type Faq = { q: string; a: React.ReactNode };

const TOPICS: Topic[] = [
  {
    title: 'For backers',
    body: 'Backing ideas, milestones, and how refunds protect you.',
    href: '/guides/how-to-back-a-project',
  },
  {
    title: 'For builders',
    body: 'Publishing an idea, running a campaign, and getting verified.',
    href: '/guides/publish-your-first-idea',
  },
  {
    title: 'Payments & refunds',
    body: 'How money is held, released, and returned.',
    href: '/guides/milestones-and-refunds',
  },
  {
    title: 'Account & verification',
    body: 'Signing in, your profile, and identity checks.',
    href: '/guides/get-verified',
  },
];

const FAQS: Faq[] = [
  {
    q: 'What is Inverge?',
    a: (
      <p>
        Inverge is a platform for validating ideas and backing early-stage builders across Africa.
        Money is held in escrow and released to a builder in milestones, each one unlocked by proof
        of delivery, not by a deadline.
      </p>
    ),
  },
  {
    q: 'What happens if a builder doesn’t deliver?',
    a: (
      <p>
        The portion of your contribution tied to undelivered milestones is eligible to be returned to
        you. Money already released for milestones that <em>were</em> delivered isn’t refunded just
        because a later stage falls through. See{' '}
        <Link href="/guides/milestones-and-refunds">how milestones and refunds work</Link>.
      </p>
    ),
  },
  {
    q: 'Is backing an idea free?',
    a: (
      <p>
        Yes. Following and backing ideas is free. When a campaign successfully raises and releases
        funds, Inverge charges a platform fee, which is shown clearly before anything is committed.
      </p>
    ),
  },
  {
    q: 'How do I know a builder is real?',
    a: (
      <p>
        Builders who raise funds go through identity verification, and business verification where relevant,
        before a campaign can collect money. It’s one of the ways we keep the platform trustworthy.
      </p>
    ),
  },
  {
    q: 'How do I publish my own idea?',
    a: (
      <p>
        Start from <Link href="/ideas/new">Start an idea</Link>. You’ll describe the problem and your
        plan, gather feedback in the validation stage, and, when you’re ready, open a campaign built
        around milestones. Our{' '}
        <Link href="/guides/publish-your-first-idea">first-idea guide</Link> walks through it.
      </p>
    ),
  },
  {
    q: 'When does a builder get the money?',
    a: (
      <p>
        In stages. Each milestone’s funds release only once the builder shows that milestone is done.
        Nothing is handed over in one lump up front; that’s the core of how Inverge builds trust.
      </p>
    ),
  },
  {
    q: 'Can I get a receipt for what I backed?',
    a: (
      <p>
        Yes. Every contribution has a receipt you can view from your account, so there’s always a
        clear record of what you backed and when.
      </p>
    ),
  },
  {
    q: 'Something looks wrong. How do I reach a human?',
    a: (
      <p>
        Email <a href="mailto:support@inverge.africa">support@inverge.africa</a> or use our{' '}
        <Link href="/contact">contact page</Link>. We usually reply within one business day.
      </p>
    ),
  },
];

export default function HelpPage() {
  return (
    <>
      <PageHeader
        eyebrow="Help Centre"
        title="How can we help?"
        lede="Answers to the questions we hear most, about backing, building, milestones, and getting your money back if a builder doesn’t deliver."
      />

      {/* Topic cards */}
      <Container className="pb-14 md:pb-20">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" data-reveal>
          {TOPICS.map((t) => (
            <li key={t.title}>
              <Link
                href={t.href}
                className="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-surface p-6 transition-shadow hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
              >
                <h2 className="font-display text-lg font-semibold text-ink group-hover:text-accent-700">
                  {t.title}
                </h2>
                <p className="text-sm leading-relaxed text-ink-muted">{t.body}</p>
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

      {/* FAQ — native <details> so it is accessible and needs zero client JS */}
      <section className="bg-surface py-16 md:py-24" data-reveal>
        <Container className="max-w-3xl">
          <div className="mb-10">
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Common questions
            </h2>
          </div>

          <ul className="flex flex-col gap-3">
            {FAQS.map((faq) => (
              <li key={faq.q}>
                <details className="group rounded-2xl border border-border bg-paper open:shadow-lift">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl p-5 font-display text-base font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <span
                      aria-hidden="true"
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-ink-muted transition-transform duration-200 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-[15px] leading-relaxed text-ink-muted [&_a]:font-medium [&_a]:text-accent-700 [&_a]:underline [&_a]:underline-offset-2">
                    {faq.a}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand
        title="Still need a hand?"
        body="Can’t find your answer? Our team is small, close to the product, and quick to reply."
        primary={{ label: 'Contact support', href: '/contact' }}
        secondary={{ label: 'Browse guides', href: '/guides' }}
      />
    </>
  );
}
