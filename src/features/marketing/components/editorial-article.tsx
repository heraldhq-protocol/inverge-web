import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/features/marketing/components/container";
import { JournalCover } from "@/features/marketing/components/journal-cover";
import { Prose } from "@/features/marketing/components/prose";
import type { EditorialEntry } from "@/features/marketing/content/editorial";

export function EditorialArticle({ entry }: { entry: EditorialEntry }) {
  return (
    <main>
      <header className="border-b border-border bg-canvas py-12 sm:py-16">
        <Container>
          <Link
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-strong transition-colors hover:text-brand"
            href={`/${entry.kind === "Guide" ? "guides" : "blog"}`}
          >
            <ArrowLeft
              className="size-3.5 transition-transform duration-200 group-hover:-translate-x-1"
              aria-hidden="true"
            />
            <span>
              All {entry.kind === "Guide" ? "guides" : "journal entries"}
            </span>
          </Link>

          <div className="mt-8 max-w-4xl">
            <div className="flex items-center gap-3">
              <span className="h-0.5 w-6 bg-brand" aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                {entry.kind === "Guide" ? "Guide" : "Product Note"} ·{" "}
                {entry.readTime}
              </p>
            </div>
            <h1 className="mt-4 text-balance text-3xl font-bold leading-[1.08] tracking-[-0.04em] text-ink sm:text-5xl lg:text-6xl">
              {entry.title}
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
              {entry.summary}
            </p>
          </div>

          {entry.cover ? (
            <div className="mt-8 max-w-2xl">
              <JournalCover
                cover={entry.cover}
                title={entry.title}
                size="header"
              />
            </div>
          ) : null}
        </Container>
      </header>

      <Container className="py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-16">
          {/* Left Column (Desktop): Sticky Head Content / Section Navigation */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <nav aria-label="On this page">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
                On this page
              </p>
              <ol className="mt-4 space-y-1 border-l border-border">
                {entry.sections.map((section, index) => {
                  const id = section.heading
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");
                  return (
                    <li key={section.heading}>
                      <a
                        className="-ml-px block border-l border-transparent py-2 pl-4 text-sm text-muted transition-colors hover:border-brand hover:text-ink"
                        href={`#${id}`}
                      >
                        <span className="mr-2 font-mono text-xs font-semibold text-brand">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {section.heading}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>

            <div className="mt-8 border-t border-border pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Reading time
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                {entry.readTime}
              </p>
              <div className="mt-6">
                <Link
                  href="/blog"
                  className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-strong transition-colors hover:text-brand"
                >
                  <ArrowLeft
                    className="size-3.5 transition-transform duration-200 group-hover:-translate-x-1"
                    aria-hidden="true"
                  />
                  <span>Back to journal</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Column: Article Prose Content */}
          <div className="min-w-0">
            <Prose className="max-w-none">
              {entry.sections.map((section) => {
                const id = section.heading
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "");
                return (
                  <section
                    key={section.heading}
                    id={id}
                    className="scroll-mt-8 border-b border-border pb-10 last:border-0"
                  >
                    <h2>{section.heading}</h2>
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
                  </section>
                );
              })}
            </Prose>

            {/* Editorial Note */}
            <div className="mt-14 rounded-xl border border-border/80 border-l-4 border-l-brand bg-surface/80 p-5 shadow-xs transition-colors hover:border-border hover:bg-surface">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-1.5 rounded-full bg-brand"
                      aria-hidden="true"
                    />
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                      Inverge Editorial
                    </p>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    Perspectives on validation, escrow design, and milestone
                    delivery for African builders. Have questions or feedback?
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-contrast px-5 text-xs font-semibold text-white transition-colors hover:bg-brand sm:w-auto"
                >
                  <span>Talk to the team</span>
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
