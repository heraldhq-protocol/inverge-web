import React from 'react';
import { pageMetadata } from '@/lib/metadata';
import Link from 'next/link';
import { PageHeader } from '@/components/marketing/page-header';
import { CtaBand } from '@/components/marketing/cta-band';
import { Container } from '@/components/ui/container';

export const metadata = pageMetadata({
  title: 'Help Centre',
  description:
    'Answers about backing, building, milestones, refunds, and verification on Inverge.',
  path: '/help',
});

type Topic = { title: string; body: string; href: string };
type Faq = { q: string; a: React.ReactNode; defaultOpen?: boolean };

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
    defaultOpen: true,
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
        eyebrow="HELP CENTRE"
        title="How can we help?"
        lede="Answers to the questions we hear most, about backing, building, milestones, and getting your money back if a builder doesn’t deliver."
      />

      {/* Topic cards */}
      <Container className="pb-16 md:pb-24">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" data-reveal>
          {TOPICS.map((t) => (
            <li key={t.title}>
              <Link
                href={t.href}
                className="group flex h-full flex-col justify-between rounded-xl border border-border bg-surface p-6 sm:p-6 transition-colors duration-200 hover:border-accent-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
              >
                <div>
                  <h2 className="font-display text-base sm:text-lg font-semibold text-ink group-hover:text-accent-700 transition-colors">
                    {t.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t.body}</p>
                </div>
                <div className="mt-6 pt-2 text-sm font-semibold text-accent-700 flex items-center gap-1.5">
                  <span>Read guide</span>
                  <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>

      {/* FAQ Accordion Section */}
      <section className="bg-paper py-16 md:py-24 border-t border-border/50" data-reveal>
        <Container className="max-w-3xl">
          <div className="mb-10 text-center flex flex-col items-center">
            <span className="text-[12px] font-semibold tracking-[0.15em] uppercase text-accent-700 mb-2">
              FREQUENTLY ASKED
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Common questions
            </h2>
          </div>

          <ul className="flex flex-col gap-3">
            {FAQS.map((faq) => (
              <li key={faq.q}>
                <details
                  open={faq.defaultOpen}
                  className="group rounded-xl border border-border/70 bg-[#f7f6f2] open:bg-surface open:border-border transition-colors duration-200 overflow-hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:px-6 sm:py-4.5 font-display text-[15px] sm:text-base font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-xl [&::-webkit-details-marker]:hidden">
                    <span>{faq.q}</span>
                    <span
                      aria-hidden="true"
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-black/5 text-ink-muted transition-transform duration-200 group-open:rotate-45 text-sm font-medium"
                    >
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 sm:px-6 sm:pb-5 pt-1 text-[14px] sm:text-[15px] leading-relaxed text-ink-muted/90 border-t border-border/30 mt-1 [&_a]:font-medium [&_a]:text-accent-700 [&_a]:underline [&_a]:underline-offset-2">
                    {faq.a}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* CTA Band */}
      <CtaBand
        title="Still need a hand?"
        body="Can’t find your answer? Our team is small, close to the product, and quick to reply."
        primary={{ label: 'Contact support', href: '/contact' }}
        secondary={{ label: 'Browse guides', href: '/guides' }}
      />
    </>
  );
}
