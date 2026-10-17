import Link from "next/link";

import { Container } from "@/components/ui/container";
import { StatePanel } from "@/components/ui/state-panel";
import { IdeaDiscoveryCard } from "@/features/ideas/components/idea-discovery-card";
import type { DiscoveryIdea, Topic } from "@/features/ideas/types";

/**
 * A topic's page: the public ideas filed under one theme.
 *
 * The list arrives already scoped to public ideas and ordered by topic
 * membership, so this view renders whatever it is handed and never re-filters.
 * Related topics are derived from shared idea membership — never invented to
 * make the page look fuller.
 */
export function TopicCatalog({
  ideas,
  topic,
  topics,
}: {
  ideas: readonly DiscoveryIdea[];
  topic: Topic;
  topics: readonly Topic[];
}) {
  const relatedTopics = topics
    .filter((candidate) => candidate.slug !== topic.slug)
    .map((candidate) => ({
      topic: candidate,
      shared: candidate.ideaIds.filter((id) => topic.ideaIds.includes(id))
        .length,
    }))
    .filter((entry) => entry.shared > 0)
    .toSorted((left, right) => right.shared - left.shared);

  return (
    <Container className="py-8 sm:py-10">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href="/ideas"
              className="rounded font-medium text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Ideas
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">Topics</li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">{topic.title}</li>
        </ol>
      </nav>

      <header className="mt-5 border-b border-border pb-7 sm:pb-9">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-strong">
            Topic
          </p>
          <span className="text-xs text-muted" title="Sample data">
            Sample data
          </span>
        </div>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-[-0.05em] text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]">
          {topic.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
          {topic.description}
        </p>
        <p className="mt-4 text-sm font-semibold tabular-nums text-ink">
          {ideas.length} {ideas.length === 1 ? "idea" : "ideas"}
        </p>
      </header>

      {ideas.length > 0 ? (
        <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <li key={idea.id} className="grid">
              <IdeaDiscoveryCard idea={idea} variant="featured" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-8 sm:py-10">
          <StatePanel
            variant="empty"
            eyebrow="No public ideas yet"
            title="Nothing filed here yet"
            description="This topic has no public ideas right now. Browse the full catalogue to discover ideas across every topic."
            action={
              <Link
                href="/ideas"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Explore all ideas
              </Link>
            }
          />
        </div>
      )}

      {relatedTopics.length > 0 ? (
        <section
          className="mt-12 border-t border-border pt-8"
          aria-labelledby="related-topics"
        >
          <h2
            id="related-topics"
            className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
          >
            Related topics
          </h2>
          <p className="mt-1 text-sm text-muted">
            Topics sharing ideas with {topic.title}.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {relatedTopics.map(({ topic: related }) => (
              <li key={related.slug}>
                <Link
                  href={`/topics/${related.slug}`}
                  className="inline-flex min-h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-brand/35 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {related.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Container>
  );
}
