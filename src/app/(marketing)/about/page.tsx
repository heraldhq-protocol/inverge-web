import React from 'react';
import { pageMetadata } from '@/lib/metadata';
import { PageHeader } from '@/components/marketing/page-header';
import { CtaBand } from '@/components/marketing/cta-band';
import { Container } from '@/components/ui/container';
import { StatStrip } from '@/components/marketing/stat-strip';

export const metadata = pageMetadata({
  title: 'About',
  description:
    'Inverge exists to back African builders with accountability: funds released against verified milestones, not promises.',
  path: '/about',
});

type Value = {
  title: string;
  body: string;
  icon: React.ReactNode;
};

// Icons draw the actual mechanic, never a trust badge — no shield, padlock, checkmark-in-circle,
// handshake, or rocket (landing-brief §3.3).
const VALUES: Value[] = [
  {
    title: 'Accountability by design',
    body: 'Funding is released in stages against delivered milestones, not handed over in one lump and hoped for.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" d="M4 18V6M9 18v-4M14 18V9M19 18V4" />
        <path strokeLinecap="round" d="M3 21h18" />
      </svg>
    ),
  },
  {
    title: 'Proof over promises',
    body: 'Every stage is backed by evidence a builder shows and a backer can see: receipts, not assurances.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 3v5h5M9 13h6M9 16h4" />
      </svg>
    ),
  },
  {
    title: 'Access, not gatekeeping',
    body: 'A builder in Ibadan or Accra deserves the same shot as one in a coastal accelerator. We lower the bar to being seen.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20l6-6 4 4 6-9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 5v4h-4" />
      </svg>
    ),
  },
  {
    title: 'Built in Africa',
    body: 'We build for how money, trust, and community actually work here, not a template borrowed from somewhere else.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 20C8 12 14 8 19 8.5c-.5 6-4.5 11.5-13 11.5Z" />
        <path strokeLinecap="round" d="M6 20c0-3 1-5 2.5-6.5" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="ABOUT INVERGE"
        title="Backing ideas. Built on accountability."
        lede="We help early-stage builders across Africa turn an idea into something real, and give the people who back them a reason to trust it."
      />

      {/* Mission narrative */}
      <Container className="pb-16 md:pb-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 items-start" data-reveal>
          <div>
            <span className="text-[12px] font-semibold tracking-[0.15em] uppercase text-accent-700 block mb-2">
              WHY WE EXIST
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink text-balance leading-snug">
              Good ideas fail for the wrong reasons.
            </h2>
          </div>
          <div className="flex flex-col gap-4 text-base sm:text-lg leading-relaxed text-ink-muted text-pretty">
            <p>
              Across Africa, brilliant builders struggle to raise the first few thousand naira to
              prove an idea, while the people who might back them hold back, unsure their money
              will be used the way it was promised. Both sides lose.
            </p>
            <p>
              Inverge closes that gap. Builders validate an idea with real feedback before they raise
              a naira. When they do raise, the money is held and released in milestones, each one
              unlocked by proof of delivery, not the passage of time. If a milestone isn’t met, the
              funds tied to it go back.
            </p>
            <p>
              The result is simple: backers support with confidence, and builders earn trust by
              shipping. Accountability stops being a slogan and becomes how the money moves.
            </p>
          </div>
        </div>
      </Container>

      {/* Values */}
      <section className="bg-paper py-16 md:py-24 border-t border-border/50" data-reveal>
        <Container>
          <div className="mx-auto mb-12 max-w-2xl text-center flex flex-col items-center">
            <span className="text-[12px] font-semibold tracking-[0.15em] uppercase text-accent-700 mb-2">
              WHAT WE STAND FOR
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Four things we won’t compromise on
            </h2>
          </div>

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" data-stagger>
            {VALUES.map((v) => (
              <li
                key={v.title}
                className="flex flex-col gap-3 rounded-xl border border-border/80 bg-[#f7f6f2] p-6 transition-colors duration-200 hover:border-accent-500/40"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100/70 text-accent-700 [&_svg]:h-5 [&_svg]:w-5 mb-1">
                  {v.icon}
                </span>
                <h3 className="font-display text-base sm:text-lg font-semibold text-ink">{v.title}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{v.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* By the numbers */}
      <StatStrip />

      {/* Who we are */}
      <Container className="py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center flex flex-col items-center" data-reveal>
          <span className="text-[12px] font-semibold tracking-[0.15em] uppercase text-accent-700 mb-2">
            THE TEAM
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            A small, remote team across West Africa
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-ink-muted text-pretty">
            We’re builders, designers, and operators who have raised money, shipped products, and
            felt the friction first-hand. We’re deliberately small, close to the people we serve,
            and biased towards proof. If that sounds like you, we’re usually hiring.
          </p>
        </div>
      </Container>

      <CtaBand
        eyebrow="JOIN US"
        title="Back a builder, or become one"
        body="Explore ideas raising right now, or publish your own and start validating it today."
        primary={{ label: 'Explore ideas', href: '/ideas' }}
        secondary={{ label: 'Start an idea', href: '/ideas/new' }}
      />
    </>
  );
}
