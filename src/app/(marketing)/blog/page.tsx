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
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-200 hover:border-brand/40 hover:shadow-md"
            >
              <div>
                {entry.cover ? (
                  <JournalCover
                    cover={entry.cover}
                    title={entry.title}
                    size="compact"
                  />
                ) : null}
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <span className="h-0.5 w-4 bg-brand" aria-hidden="true" />
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                      Product note
                    </p>
                  </div>
                  <h2 className="mt-2.5 text-lg font-bold tracking-tight text-ink transition-colors group-hover:text-brand-strong sm:text-xl">
                    {entry.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                    {entry.summary}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 px-5 py-3.5 text-xs sm:px-6">
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
