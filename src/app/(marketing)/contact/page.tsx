import React from 'react';
import { pageMetadata } from '@/lib/metadata';
import Link from 'next/link';
import { PageHeader } from '@/components/marketing/page-header';
import { ContactForm } from '@/components/marketing/contact-form';
import { Container } from '@/components/ui/container';

export const metadata = pageMetadata({
  title: 'Contact',
  description:
    'Get in touch with the Inverge team: questions about backing, building, press, or partnerships.',
  path: '/contact',
});

type Channel = {
  label: string;
  value: string;
  href: string;
  description: string;
};

const CHANNELS: Channel[] = [
  {
    label: 'General',
    value: 'hello@inverge.africa',
    href: 'mailto:hello@inverge.africa',
    description: 'For anything about the platform, backing, or building.',
  },
  {
    label: 'Support',
    value: 'support@inverge.africa',
    href: 'mailto:support@inverge.africa',
    description: 'Trouble with your account or a campaign you backed.',
  },
  {
    label: 'Press & partnerships',
    value: 'press@inverge.africa',
    href: 'mailto:press@inverge.africa',
    description: 'Media enquiries and partnership proposals.',
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="CONTACT"
        title="Talk to us"
        lede="Whether you’re backing your first idea, raising as a builder, or writing about what we’re building, we’d love to hear from you."
      />

      <Container className="pb-16 md:pb-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:gap-14 items-start">
          {/* Form Card */}
          <div
            className="rounded-xl border border-border/80 bg-surface p-6 sm:p-8"
            data-reveal
          >
            <h2 className="font-display text-xl sm:text-[22px] font-semibold text-ink mb-1">
              Send a message
            </h2>
            <p className="text-sm text-ink-muted mb-6">
              Fill this in and it lands with the right person on our team.
            </p>
            <ContactForm />
          </div>

          {/* Channels + help pointer */}
          <aside className="flex flex-col gap-6" data-reveal>
            <div>
              <span className="text-[12px] font-semibold tracking-[0.15em] uppercase text-ink-muted block mb-3">
                EMAIL US DIRECTLY
              </span>
              <ul className="flex flex-col gap-3.5">
                {CHANNELS.map((c) => (
                  <li key={c.href} className="rounded-xl border border-border/80 bg-surface p-4.5 sm:p-5">
                    <p className="text-[15px] font-semibold text-ink">{c.label}</p>
                    <a
                      href={c.href}
                      className="text-sm font-medium text-accent-700 underline decoration-accent-700/40 underline-offset-2 hover:decoration-accent-700 inline-block mt-0.5"
                    >
                      {c.value}
                    </a>
                    <p className="mt-1.5 text-xs sm:text-sm text-ink-muted leading-relaxed">
                      {c.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help Quick Answer Box */}
            <div className="rounded-xl bg-forest p-5 text-white">
              <p className="text-[15px] font-semibold text-white">Looking for a quick answer?</p>
              <p className="mt-1 text-xs sm:text-sm text-white/70 leading-relaxed">
                The Help Centre covers most questions about backing, refunds, and building.
              </p>
              <Link
                href="/help"
                className="mt-3 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-accent-100 hover:text-white transition-colors"
              >
                Visit the Help Centre
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-ink-muted/80 leading-relaxed">
              We’re a remote team across West Africa and typically reply within one business day.
            </p>
          </aside>
        </div>
      </Container>
    </>
  );
}
