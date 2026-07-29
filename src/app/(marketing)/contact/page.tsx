import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/marketing/page-header';
import { ContactForm } from '@/components/marketing/contact-form';
import { Container } from '@/components/ui/container';

export const metadata: Metadata = {
  title: 'Contact — Inverge',
  description:
    'Get in touch with the Inverge team: questions about backing, building, press, or partnerships.',
};

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
        eyebrow="Contact"
        title="Talk to us"
        lede="Whether you’re backing your first idea, raising as a builder, or writing about what we’re building, we’d love to hear from you."
      />

      <Container className="pb-16 md:pb-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">
          {/* Form */}
          <div
            className="rounded-3xl border border-border bg-surface p-6 shadow-lift sm:p-8"
            data-reveal
          >
            <h2 className="mb-1 font-display text-xl font-semibold text-ink">Send a message</h2>
            <p className="mb-6 text-sm text-ink-muted">
              Fill this in and it lands with the right person on our team.
            </p>
            <ContactForm />
          </div>

          {/* Channels + help pointer */}
          <aside className="flex flex-col gap-6" data-reveal>
            <div>
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-ink-muted">
                Email us directly
              </h2>
              <ul className="flex flex-col gap-4">
                {CHANNELS.map((c) => (
                  <li key={c.href} className="rounded-2xl border border-border bg-surface p-4">
                    <p className="text-sm font-semibold text-ink">{c.label}</p>
                    <a
                      href={c.href}
                      className="text-sm font-medium text-accent-700 underline decoration-accent-700/40 underline-offset-2 hover:decoration-accent-700"
                    >
                      {c.value}
                    </a>
                    <p className="mt-1 text-sm text-ink-muted">{c.description}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-forest p-5 text-white">
              <p className="text-sm font-semibold">Looking for a quick answer?</p>
              <p className="mt-1 text-sm text-white/70">
                The Help Centre covers most questions about backing, refunds, and building.
              </p>
              <Link
                href="/help"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-100 hover:text-white"
              >
                Visit the Help Centre
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <p className="text-sm text-ink-muted">
              We’re a remote team across West Africa and typically reply within one business day.
            </p>
          </aside>
        </div>
      </Container>
    </>
  );
}
