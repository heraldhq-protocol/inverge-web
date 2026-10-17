import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Pill } from "@/components/ui/pill";
import { ideasInTopic } from "@/features/ideas/lib/filter-ideas";
import type { DiscoveryIdea, Topic } from "@/features/ideas/types";

/**
 * The topic index — themes that cut across category and region, which is what a
 * reader browsing by interest reaches for once a flat grid stops helping.
 *
 * Counts come from `ideasInTopic` scoped to public, so a topic never advertises
 * an idea its own page cannot show. Topics are a fixed editorial list rather
 * than something derived from the current filter: a directory that reshuffled
 * under a search would stop being an index.
 */
export function TopicDirectory({
  ideas,
  topics,
}: {
  ideas: readonly DiscoveryIdea[];
  topics: readonly Topic[];
}) {
  if (topics.length === 0) return null;

  const entries = topics.map((topic) => ({
    count: ideasInTopic(topic, ideas, "public").length,
    topic,
  }));

  return (
    <section
      aria-labelledby="browse-by-topic"
      className="border-t border-border py-7 sm:py-9"
    >
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
          Directory
        </p>
        <h2
          id="browse-by-topic"
          className="mt-1 text-xl font-bold tracking-[-0.035em] text-ink sm:text-2xl"
        >
          Browse by topic
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-5 text-muted">
          Themes that cut across categories and regions. Counts cover public
          ideas only.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(({ count, topic }) => (
          <li key={topic.slug}>
            <Link
              href={`/topics/${topic.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-4 transition-[border-color,box-shadow] hover:border-brand/25 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold tracking-[-0.025em] text-ink group-hover:text-brand-strong">
                  {topic.title}
                </h3>
                <Pill size="xs">
                  {count} {count === 1 ? "idea" : "ideas"}
                </Pill>
              </div>
              <p className="mt-1.5 text-xs leading-5 text-muted">
                {topic.description}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-strong">
                Explore topic
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  size={14}
                  strokeWidth={1.9}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
