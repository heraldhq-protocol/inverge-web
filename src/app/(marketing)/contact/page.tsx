import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/features/marketing/components/contact-form";
import { Container } from "@/features/marketing/components/container";
import { PageHeader } from "@/features/marketing/components/page-header";

export const metadata: Metadata = {
  title: "Contact — Inverge",
  description:
    "Contact Inverge about backing, building, support, partnerships, or press.",
};

const channels = [
  {
    label: "General",
    value: "hello@inverge.africa",
    description: "For questions about Inverge, backing, or building.",
  },
  {
    label: "Support",
    value: "support@inverge.africa",
    description: "For help with an account or campaign once the product opens.",
  },
  {
    label: "Press & partnerships",
    value: "press@inverge.africa",
    description: "For media enquiries and partnership conversations.",
  },
] as const;

export default function ContactPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Contact"
        title="Talk to us"
        description="Whether you are preparing an idea, thinking about backing, or writing about what we are building, we would like to hear from you."
      />

      <Container className="py-12 sm:py-16 md:pb-24">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
          <section className="rounded-xl border border-border bg-surface p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-ink sm:text-[22px]">
              Send a message
            </h2>
            <p className="mb-6 mt-1 text-sm text-muted">
              Fill this in and continue in your email app to review and send it.
            </p>
            <ContactForm />
          </section>

          <aside className="flex flex-col gap-6">
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted">
                Email us directly
              </h2>
              <ul className="flex flex-col gap-3.5">
                {channels.map((channel) => (
                  <li
                    key={channel.value}
                    className="rounded-xl border border-border bg-surface p-5"
                  >
                    <p className="text-[15px] font-semibold text-ink">
                      {channel.label}
                    </p>
                    <a
                      href={`mailto:${channel.value}`}
                      className="mt-0.5 inline-block text-sm font-medium text-brand-strong underline decoration-brand/40 underline-offset-2"
                    >
                      {channel.value}
                    </a>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {channel.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-contrast p-5 text-white">
              <p className="text-[15px] font-semibold">
                Looking for a quick answer?
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/68">
                The Help Centre covers common questions about backing, refunds,
                and building.
              </p>
              <Link
                href="/help"
                className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-white underline decoration-brand underline-offset-4"
              >
                Visit the Help Centre <span aria-hidden="true">→</span>
              </Link>
            </div>

            <p className="text-xs leading-relaxed text-muted">
              Do not send passwords, identity documents, private keys, or wallet
              recovery phrases by email.
            </p>
          </aside>
        </div>
      </Container>
    </main>
  );
}
