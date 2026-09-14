import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/features/marketing/components/container";
import { PageHeader } from "@/features/marketing/components/page-header";

export const metadata: Metadata = {
  title: "Careers — Inverge",
  description:
    "Future opportunities to help Inverge build accountable crowdfunding for African builders.",
};

export default function CareersPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Careers"
        title="Build trust into how ideas get funded."
        description="We are assembling the foundations carefully. Roles will appear here only when they are approved and genuinely open."
      />
      <Container className="py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-sm font-semibold text-brand">Open roles</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
              No advertised openings right now.
            </h2>
            <p className="mt-4 max-w-lg leading-7 text-muted">
              We removed speculative job listings from the previous site. When a
              role has a defined scope, working arrangement, and hiring process,
              it will be published here.
            </p>
          </div>
          <div className="rounded-3xl bg-contrast p-8 text-white sm:p-10">
            <h2 className="text-2xl font-bold tracking-[-0.03em]">
              Interested in future work?
            </h2>
            <p className="mt-4 leading-7 text-white/68">
              You can introduce yourself without treating it as an application.
              Tell us what you do, where you work from, and why this problem
              matters to you.
            </p>
            <a
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white sm:w-auto"
              href="mailto:hello@inverge.africa?subject=Future%20work%20with%20Inverge"
            >
              Introduce yourself
            </a>
          </div>
        </div>
        <p className="mt-12 text-sm leading-6 text-muted">
          For non-career enquiries, use the{" "}
          <Link
            className="font-semibold text-brand-strong underline underline-offset-4"
            href="/contact"
          >
            contact page
          </Link>
          .
        </p>
      </Container>
    </main>
  );
}
