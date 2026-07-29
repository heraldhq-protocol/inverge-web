import React from 'react';
import { pageMetadata } from '@/lib/metadata';
import { PageHeader } from '@/components/marketing/page-header';
import { CtaBand } from '@/components/marketing/cta-band';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';

export const metadata = pageMetadata({
  title: 'Careers',
  description:
    'Join a small, remote team building the platform African builders trust. See open roles at Inverge.',
  path: '/careers',
});

type Role = {
  title: string;
  team: string;
  location: string;
  type: string;
  blurb: string;
};

const ROLES: Role[] = [
  {
    title: 'Senior Product Engineer',
    team: 'Engineering',
    location: 'Remote · West Africa',
    type: 'Full-time',
    blurb: 'Own features end to end across our Next.js app and Node API, from milestone flows to the discovery feed.',
  },
  {
    title: 'Product Designer',
    team: 'Design',
    location: 'Remote · West Africa',
    type: 'Full-time',
    blurb: 'Shape a product where trust is the feature. Design flows that make money movement feel calm and clear.',
  },
  {
    title: 'Builder Success Lead',
    team: 'Growth',
    location: 'Lagos · Hybrid',
    type: 'Full-time',
    blurb: 'Help builders run campaigns that deliver: onboarding, milestone coaching, and community.',
  },
  {
    title: 'Compliance & Trust Associate',
    team: 'Operations',
    location: 'Remote · Nigeria',
    type: 'Full-time',
    blurb: 'Keep the platform safe and above board: verification, fraud review, and refund integrity.',
  },
];

const BENEFITS: { title: string; body: string }[] = [
  {
    title: 'Remote-first, West Africa core',
    body: 'Work from wherever you do your best thinking, with hours that overlap the team you build with.',
  },
  {
    title: 'Real ownership',
    body: 'Meaningful equity, and a say in what we build. Small team, big surface area, your fingerprints everywhere.',
  },
  {
    title: 'Ship things that matter',
    body: 'Your work moves real money to real builders. The impact isn’t abstract; you can point at it.',
  },
  {
    title: 'Room to grow',
    body: 'A learning budget, senior people to learn from, and the space to stretch past your title.',
  },
];

export default function CareersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Build the platform builders trust"
        lede="We’re a small team with an outsized mission: make backing African builders something people can do with confidence. Come help us."
      />

      {/* Benefits */}
      <Container className="pb-14 md:pb-20">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2" data-reveal>
          {BENEFITS.map((b) => (
            <li key={b.title} className="flex gap-4 rounded-2xl border border-border bg-surface p-6">
              <span
                aria-hidden="true"
                className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-accent-500"
              />
              <div>
                <h2 className="font-display text-lg font-semibold text-ink">{b.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{b.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>

      {/* Open roles */}
      <section className="bg-surface py-16 md:py-24" id="open-roles" data-reveal>
        <Container>
          <div className="mb-10 flex flex-col gap-3">
            <Eyebrow>Open roles</Eyebrow>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              We’re hiring for {ROLES.length} roles
            </h2>
          </div>

          <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-paper">
            {ROLES.map((role) => (
              <li key={role.title}>
                <a
                  href={`mailto:careers@inverge.africa?subject=${encodeURIComponent(
                    `Application: ${role.title}`
                  )}`}
                  className="group flex flex-col gap-3 p-6 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-inset sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold text-ink group-hover:text-accent-700">
                      {role.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">{role.blurb}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[role.team, role.location, role.type].map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink-muted"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-accent-700">
                    Apply
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm text-ink-muted">
            Don’t see your exact role? We still want to meet sharp people. Tell us what you’d build at{' '}
            <a
              href="mailto:careers@inverge.africa?subject=Speculative%20application"
              className="font-medium text-accent-700 underline decoration-accent-700/40 underline-offset-2 hover:decoration-accent-700"
            >
              careers@inverge.africa
            </a>
            .
          </p>
        </Container>
      </section>

      <CtaBand
        title="Curious how we work?"
        body="Read what we’re building and why accountability sits at the centre of it."
        primary={{ label: 'About Inverge', href: '/about' }}
        secondary={{ label: 'Get in touch', href: '/contact' }}
      />
    </>
  );
}
