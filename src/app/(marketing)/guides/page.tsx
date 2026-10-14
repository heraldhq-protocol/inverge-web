"use client";

import { ArrowRight, Clock, HelpCircle, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import { ButtonLink } from "@/features/marketing/components/button-link";
import { Container } from "@/features/marketing/components/container";
import {
  getGuideAudience,
  GuideIcon,
} from "@/features/marketing/components/guide-icon";
import { ProductCta } from "@/features/marketing/components/product-cta";
import { guides } from "@/features/marketing/content/editorial";

/* ── Static data ─── */

const popularGuides = [
  "How milestones work",
  "What to check before you back",
  "Identity verification",
] as const;

const audiences = ["All", "Builders", "Backers", "Everyone"] as const;

const glossary = [
  {
    term: "Pre-pledge",
    definition: "A non-binding statement of interest. No money moves.",
  },
  {
    term: "Contribution",
    definition: "Money you give to a campaign (reward or donation).",
  },
  {
    term: "Working-capital tranche",
    definition: "Released at funding close. Not refundable.",
  },
  {
    term: "Objection window",
    definition: "Time to raise a concern. Set per campaign.",
  },
  {
    term: "Receipt",
    definition: "A link to view your transaction details.",
  },
] as const;

const keyTakeaways = [
  {
    num: 1,
    text: "Pre-pledges are non-binding and move no money.",
  },
  {
    num: 2,
    text: "Campaign funds are held in escrow and released in stages.",
  },
  {
    num: 3,
    text: "If a milestone fails review, eligible remaining escrow is claimable. The working-capital tranche is not refundable.",
  },
] as const;

/* ── Component ─── */

export default function GuidesPage() {
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filtered = guides.filter((g) => {
    const matchesAudience =
      filter === "All" || getGuideAudience(g.slug) === filter;
    const matchesSearch =
      search.trim() === "" ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.summary.toLowerCase().includes(search.toLowerCase());
    return matchesAudience && matchesSearch;
  });

  // "Start here" featured guides
  const builderGuide = guides.find(
    (g) => g.slug === "publish-and-validate-an-idea",
  );
  const backerGuide = guides.find((g) => g.slug === "back-a-campaign");

  return (
    <main>
      {/* ─── 1. Hero ─── */}
      <section className="border-b border-border bg-canvas py-14 sm:py-20">
        <Container>
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left */}
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
                Guides
              </p>
              <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.05] tracking-[-0.05em] text-ink sm:text-5xl">
                Learn how Inverge works
              </h1>
              <p className="mt-6 max-w-lg text-pretty text-base leading-7 text-muted sm:text-lg">
                Clear answers. Practical steps. Everything you need to get
                started.
              </p>

              {/* Search */}
              <div className="relative mt-8 max-w-sm">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search guides..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              {/* Popular tags */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-muted">
                  Popular guides
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {popularGuides.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-white px-3 py-1 text-xs text-muted transition-colors hover:border-brand/40 hover:text-ink"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right – hero photo */}
            <div className="relative hidden aspect-[16/10] overflow-hidden rounded-2xl lg:block lg:aspect-[4/3]">
              <Image
                src="/images/showcase/hero_builders.png"
                alt="People learning about Inverge's crowdfunding platform"
                fill
                priority
                sizes="560px"
                className="object-cover object-center"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ─── 2. Audience filter tabs ─── */}
      <Container className="pt-10 sm:pt-14">
        <div className="flex flex-wrap gap-2">
          {audiences.map((aud) => (
            <button
              key={aud}
              onClick={() => setFilter(aud)}
              className={`inline-flex min-h-9 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors ${
                filter === aud
                  ? "bg-brand text-white shadow-sm"
                  : "bg-white text-ink border border-border hover:border-brand/40"
              }`}
            >
              {aud}
            </button>
          ))}
        </div>
      </Container>

      {/* ─── 3. Start here ─── */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="mb-2">
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-ink sm:text-3xl">
              Start here
            </h2>
            <p className="mt-1 text-sm text-muted">
              Get up to speed with the basics for your role.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Builder card */}
            {builderGuide && (
              <Link
                href={`/guides/${builderGuide.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white transition-all duration-200 hover:border-brand/40 hover:shadow-lg"
              >
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-brand/10 text-brand-strong">
                      <GuideIcon slug={builderGuide.slug} className="size-4" />
                    </span>
                    <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                      For builders
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-ink transition-colors group-hover:text-brand-strong sm:text-2xl">
                    {builderGuide.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Learn how to prepare your idea, get feedback and make it
                    visible to the right audience.
                  </p>
                  <div className="mt-4">
                    <span className="inline-flex items-center rounded-full border border-ink/20 px-4 py-1.5 text-sm font-semibold text-ink transition-colors group-hover:border-brand group-hover:text-brand-strong">
                      Read guide
                    </span>
                  </div>
                  <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
                    <ArrowRight className="size-3" aria-hidden="true" />
                    You will know what to check before you publish.
                  </p>
                </div>
                {/* Thumbnail */}
                <div className="relative hidden aspect-[3/2] sm:block md:hidden lg:block">
                  <Image
                    src="/images/showcase/two_doors_builder.png"
                    alt=""
                    fill
                    sizes="280px"
                    className="object-cover"
                  />
                </div>
              </Link>
            )}

            {/* Backer card */}
            {backerGuide && (
              <Link
                href={`/guides/${backerGuide.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white transition-all duration-200 hover:border-brand/40 hover:shadow-lg"
              >
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-brand/10 text-brand-strong">
                      <GuideIcon slug={backerGuide.slug} className="size-4" />
                    </span>
                    <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                      For backers
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-ink transition-colors group-hover:text-brand-strong sm:text-2xl">
                    Back a campaign with clear eyes
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Learn how to review campaigns, check evidence and make a
                    contribution with confidence.
                  </p>
                  <div className="mt-4">
                    <span className="inline-flex items-center rounded-full border border-ink/20 px-4 py-1.5 text-sm font-semibold text-ink transition-colors group-hover:border-brand group-hover:text-brand-strong">
                      Read guide
                    </span>
                  </div>
                  <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
                    <ArrowRight className="size-3" aria-hidden="true" />
                    You will know what to check before you contribute.
                  </p>
                </div>
                <div className="relative hidden aspect-[3/2] sm:block md:hidden lg:block">
                  <Image
                    src="/images/showcase/two_doors_backer.png"
                    alt=""
                    fill
                    sizes="280px"
                    className="object-cover"
                  />
                </div>
              </Link>
            )}
          </div>
        </Container>
      </section>

      {/* ─── 4. All guides ─── */}
      <section className="border-t border-border bg-surface py-12 sm:py-16">
        <Container>
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-ink">
              All guides
            </h2>
            <p className="mt-1 text-sm text-muted">
              Short, focused guides for every step.
            </p>
          </div>

          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">
              No guides match your search.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((guide) => (
                <li key={guide.slug}>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-white p-5 transition-all duration-200 hover:border-brand/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand-strong">
                        <GuideIcon slug={guide.slug} className="size-5" />
                      </span>
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                        {getGuideAudience(guide.slug)}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-ink transition-colors group-hover:text-brand-strong">
                      {guide.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted line-clamp-3">
                      {guide.summary}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" aria-hidden="true" />
                        {guide.readTime}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-brand-strong">
                        Read guide
                        <ArrowRight
                          className="size-3 transition-transform duration-200 group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* More guides coming */}
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-brand/5 p-6 text-center sm:p-8">
            <h3 className="text-lg font-bold text-ink">More guides coming</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              We are adding more guides to help you at every step.
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center rounded-full border border-ink/20 bg-white px-4 py-1.5 text-sm font-semibold text-ink shadow-sm">
                Check back soon
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── 5. The short version ─── */}
      <section className="marketing-pattern border-t border-border py-12 sm:py-16">
        <Container>
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-ink">
            The short version
          </h2>
          <p className="mt-1 text-sm text-muted">
            Three key things to remember.
          </p>

          <ol className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {keyTakeaways.map((item) => (
              <li
                key={item.num}
                className="flex items-start gap-4 rounded-xl border border-border bg-white p-5"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand font-mono text-sm font-bold text-white">
                  {item.num}
                </span>
                <p className="text-sm leading-relaxed text-muted">
                  {item.text}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ─── 6. Plain-English glossary ─── */}
      <section className="border-t border-border bg-surface py-12 sm:py-16">
        <Container>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-[-0.03em] text-ink">
                Plain-English glossary
              </h2>
              <p className="mt-1 text-sm text-muted">
                Quick definitions for key terms.
              </p>
            </div>
            <Link
              href="/guides/milestones-objections-and-refunds"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-strong hover:underline"
            >
              See full glossary
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Desktop: horizontal row */}
          <div className="mt-8 hidden grid-cols-5 gap-4 lg:grid">
            {glossary.map((item) => (
              <div
                key={item.term}
                className="rounded-xl border border-border bg-white p-4"
              >
                <h4 className="text-sm font-bold text-ink">{item.term}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  {item.definition}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile: stacked list */}
          <ul className="mt-8 divide-y divide-border rounded-xl border border-border bg-white lg:hidden">
            {glossary.map((item) => (
              <li
                key={item.term}
                className="flex items-center justify-between p-4"
              >
                <span className="text-sm font-semibold text-ink">
                  {item.term}
                </span>
                <ArrowRight className="size-4 text-muted" aria-hidden="true" />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ─── 7. Still unsure? ─── */}
      <section className="border-t border-border bg-canvas py-10 sm:py-14">
        <Container>
          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-border bg-white p-6 sm:flex-row sm:p-8">
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                <HelpCircle className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-bold text-ink">
                  Still unsure? Talk to the Inverge team.
                </h3>
                <p className="mt-0.5 text-sm text-muted">
                  We are here to help with any questions you have.
                </p>
              </div>
            </div>
            <ButtonLink href="/contact" variant="secondary">
              Get in touch
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ─── 8. Product CTA ─── */}
      <ProductCta />
    </main>
  );
}
