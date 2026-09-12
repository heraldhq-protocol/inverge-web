import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/features/marketing/components/container";
import {
  getGuideAudience,
  GuideIcon,
} from "@/features/marketing/components/guide-icon";
import { ProductCta } from "@/features/marketing/components/product-cta";
import { Prose } from "@/features/marketing/components/prose";
import {
  guides,
  type EditorialEntry,
} from "@/features/marketing/content/editorial";

function GuideNavCard({
  entry,
  direction,
}: {
  entry: EditorialEntry;
  direction: "previous" | "next";
}) {
  const isNext = direction === "next";
  return (
    <Link
      href={`/guides/${entry.slug}`}
      className={`group flex flex-col gap-1.5 rounded-2xl border border-border bg-surface p-5 transition-all duration-200 hover:border-brand/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand ${isNext ? "sm:items-end sm:text-right" : ""}`}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {isNext ? "Next guide" : "Previous guide"}
      </span>
      <span className="inline-flex items-center gap-2 font-semibold text-ink transition-colors group-hover:text-brand-strong">
        {!isNext ? (
          <ArrowLeft
            className="size-4 transition-transform duration-200 group-hover:-translate-x-1"
            aria-hidden="true"
          />
        ) : null}
        <span className="text-balance">{entry.title}</span>
        {isNext ? (
          <ArrowRight
            className="size-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        ) : null}
      </span>
    </Link>
  );
}

export function GuideArticle({ entry }: { entry: EditorialEntry }) {
  const index = guides.findIndex((guide) => guide.slug === entry.slug);
  const previous = index > 0 ? guides[index - 1] : undefined;
  const next = index < guides.length - 1 ? guides[index + 1] : undefined;

  return (
    <main>
      <article>
        <header className="bg-canvas pb-10 pt-14 md:pb-12 md:pt-20">
          <Container className="max-w-3xl">
            <Link
              href="/guides"
              className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              <ArrowLeft
                className="size-4 transition-transform duration-200 group-hover:-translate-x-1"
                aria-hidden="true"
              />
              All guides
            </Link>
            <div className="mt-8 flex flex-col gap-5">
              <span className="grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand-strong">
                <GuideIcon slug={entry.slug} className="size-7" />
              </span>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="font-bold uppercase tracking-[0.16em] text-brand">
                  {getGuideAudience(entry.slug)}
                </span>
                <span className="text-muted/40">·</span>
                <span className="text-muted">{entry.readTime}</span>
              </div>
              <h1 className="text-balance text-3xl font-bold tracking-[-0.04em] text-ink sm:text-4xl md:text-5xl">
                {entry.title}
              </h1>
              <p className="text-pretty text-lg leading-relaxed text-muted">
                {entry.summary}
              </p>
            </div>
          </Container>
        </header>

        <Container className="max-w-3xl pb-16 md:pb-24">
          <ol className="relative mt-8">
            {entry.sections.map((section, sectionIndex) => (
              <li
                key={section.heading}
                className="relative flex gap-5 pb-10 last:pb-0"
              >
                {sectionIndex < entry.sections.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-[1.375rem] top-12 -translate-x-1/2 border-l border-border"
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full bg-brand font-mono text-sm font-bold text-white ring-4 ring-canvas"
                >
                  {sectionIndex + 1}
                </span>
                <div className="min-w-0 pt-2">
                  <h2 className="text-lg font-semibold text-ink">
                    {section.heading}
                  </h2>
                  <Prose className="mt-2 text-base">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {section.bullets ? (
                      <ul>
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </Prose>
                </div>
              </li>
            ))}
          </ol>

          {previous || next ? (
            <nav
              aria-label="More guides"
              className="mt-14 grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-2"
            >
              {previous ? (
                <GuideNavCard entry={previous} direction="previous" />
              ) : (
                <span className="hidden sm:block" />
              )}
              {next ? <GuideNavCard entry={next} direction="next" /> : null}
            </nav>
          ) : null}
        </Container>
      </article>
      <ProductCta compact />
    </main>
  );
}
