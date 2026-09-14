import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/features/marketing/components/container";
import {
  getGuideAudience,
  GuideIcon,
} from "@/features/marketing/components/guide-icon";
import { PageHeader } from "@/features/marketing/components/page-header";
import { ProductCta } from "@/features/marketing/components/product-cta";
import { guides } from "@/features/marketing/content/editorial";

export const metadata: Metadata = {
  title: "Guides — Inverge",
  description:
    "Practical guides to validating ideas, backing campaigns, milestone review, refunds, and identity verification.",
};

export default function GuidesPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Guides"
        title="Learn how Inverge works"
        description="Short, practical walkthroughs, whether you are thinking about backing your first campaign or preparing an idea to validate."
      />

      <Container className="py-12 sm:py-16 md:pb-24">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {guides.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/guides/${guide.slug}`}
                className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface p-6 transition-all duration-200 hover:border-brand/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand-strong">
                    <GuideIcon slug={guide.slug} className="size-5" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                    {getGuideAudience(guide.slug)}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-balance text-xl font-semibold text-ink transition-colors group-hover:text-brand-strong">
                    {guide.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-muted">
                    {guide.summary}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-xs text-muted">{guide.readTime}</span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-strong">
                    Read guide
                    <ArrowRight
                      className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>

      <ProductCta />
    </main>
  );
}
