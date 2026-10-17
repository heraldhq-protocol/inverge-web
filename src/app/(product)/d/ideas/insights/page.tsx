import type { Metadata } from "next";
import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Analytics01Icon,
  ArrowRight02Icon,
} from "@hugeicons/core-free-icons";

import { Pill } from "@/components/ui/pill";
import { IdeaCover } from "@/features/ideas/components/idea-cover";
import { previewAnalytics } from "@/features/analytics/content/preview-analytics";

export const metadata: Metadata = {
  title: "Idea analytics | Inverge",
  description:
    "Private analytics for your published ideas: support, estimated interest, feedback, and next steps.",
};

export default function IdeaAnalyticsIndexPage() {
  const idea = previewAnalytics.idea;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
        Creator workspace
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
        Idea analytics
      </h1>
      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
        Understand how an idea is performing, what the community is telling you,
        and which next step is available. Basic analytics stay available without a
        paid plan.
      </p>

      <section aria-labelledby="analytics-ideas" className="mt-6">
        <h2 id="analytics-ideas" className="sr-only">
          Ideas with analytics
        </h2>
        <ul className="grid gap-4 md:grid-cols-2">
          <li>
            <Link
              href={`/d/ideas/${idea.id}/insights`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,box-shadow] hover:border-brand/30 hover:shadow-lg hover:shadow-ink/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <div className="relative aspect-[16/9] bg-surface-muted">
                <IdeaCover
                  artwork={idea.artwork}
                  cover={idea.cover}
                  alt=""
                  sizes="(min-width: 768px) 480px, 100vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill size="xs">{idea.category}</Pill>
                  <Pill tone="accent" size="xs">
                    Published
                  </Pill>
                </div>
                <h3 className="mt-2 text-lg font-bold tracking-[-0.03em] text-ink">
                  {idea.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted">
                  {idea.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-strong">
                  <HugeiconsIcon
                    icon={Analytics01Icon}
                    size={16}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  Open analytics
                  <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    size={15}
                    strokeWidth={1.9}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
                  />
                </span>
              </div>
            </Link>
          </li>
        </ul>
      </section>

      <p className="mt-5 max-w-3xl text-xs leading-5 text-muted">
        This preview repository includes one complete analytics workspace. Other
        preview ideas have no analytics dataset yet, so they are not listed with a
        dead link. Analytics is created per idea and remains private to its
        creator.
      </p>
    </div>
  );
}
