import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/features/marketing/components/container";
import { JournalCover } from "@/features/marketing/components/journal-cover";
import { PageHeader } from "@/features/marketing/components/page-header";
import { journalEntries } from "@/features/marketing/content/editorial";

export const metadata: Metadata = {
  title: "Journal — Inverge",
  description:
    "Notes on idea validation, accountable crowdfunding, milestone delivery, and backing African builders.",
};

export default function BlogPage() {
  return (
    <main>
      <PageHeader
        eyebrow="INVERGE JOURNAL"
        title="Thinking clearly about trust and funding."
        description="Product notes and practical perspectives from the work of building a more accountable path for African ideas."
      />
      <Container className="py-12 sm:py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {journalEntries.map((entry) => (
            <Link
              key={entry.slug}
              href={`/blog/${entry.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 transition-colors duration-200 hover:border-brand/40 sm:p-5"
            >
              <div>
                {entry.cover ? (
                  <JournalCover
                    cover={entry.cover}
                    title={entry.title}
                    size="compact"
                  />
                ) : null}
                <div className="mt-4 flex items-center gap-2">
                  <span className="h-0.5 w-4 bg-brand" aria-hidden="true" />
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                    Product note
                  </p>
                </div>
                <h2 className="mt-2 text-lg font-bold tracking-tight text-ink transition-colors group-hover:text-brand-strong sm:text-xl">
                  {entry.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                  {entry.summary}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                <span className="text-muted">{entry.readTime}</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-brand-strong group-hover:text-brand">
                  <span>Read entry</span>
                  <ArrowRight
                    className="size-3.5 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}
