import { IdeaDiscoveryCard } from "@/features/ideas/components/idea-discovery-card";
import type { DiscoveryIdea } from "@/features/ideas/types";

const NEAR_VALIDATION_FLOOR = 70;
const LANE_LIMIT = 6;

type Lane = {
  eyebrow: string;
  ideas: readonly DiscoveryIdea[];
  slug: string;
  title: string;
};

/**
 * Curated rows between the featured carousel and the full list.
 *
 * Each lane is a question a reader actually arrives with — "what is close to
 * working?" and "what is new?" — answered by cutting the same result set a
 * different way, so the rows stay consistent with the filters above them. A row
 * needs at least two ideas to read as a row; one card alone is a stray card, so
 * thin lanes drop out rather than stand there half-empty.
 */
function buildLanes(ideas: readonly DiscoveryIdea[]): Lane[] {
  const nearValidation = ideas
    .filter((idea) => idea.validationPercent >= NEAR_VALIDATION_FLOOR)
    .toSorted((left, right) => right.validationPercent - left.validationPercent)
    .slice(0, LANE_LIMIT);

  const newest = ideas
    .toSorted((left, right) => right.publishedOrder - left.publishedOrder)
    .slice(0, LANE_LIMIT);

  return [
    {
      eyebrow: "Within reach",
      ideas: nearValidation,
      slug: "near-validation",
      title: "Close to validation",
    },
    {
      eyebrow: "Just landed",
      ideas: newest,
      slug: "newly-added",
      title: "Newly added",
    },
  ].filter((lane) => lane.ideas.length > 1);
}

/**
 * Whether any lane would render.
 *
 * A caller places its own separator between body sections; knowing in advance
 * whether this component draws anything is what keeps a separator from landing
 * on top of the filter bar's existing edge when the carousel is filtered out.
 */
export function hasFeedLanes(ideas: readonly DiscoveryIdea[]): boolean {
  return buildLanes(ideas).length > 0;
}

export function FeedSections({
  bordered,
  ideas,
}: {
  bordered: boolean;
  ideas: readonly DiscoveryIdea[];
}) {
  const lanes = buildLanes(ideas);
  if (lanes.length === 0) return null;

  return (
    <div className={bordered ? "border-t border-border" : undefined}>
      {lanes.map((lane) => {
        const headingId = `lane-${lane.slug}`;

        return (
          <section
            key={lane.slug}
            aria-labelledby={headingId}
            className="py-7 sm:py-9"
          >
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                {lane.eyebrow}
              </p>
              <h2
                id={headingId}
                className="mt-1 text-xl font-bold tracking-[-0.035em] text-ink sm:text-2xl"
              >
                {lane.title}
              </h2>
            </div>

            <ul className="-mx-5 flex snap-x gap-4 overflow-x-auto scroll-smooth px-5 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 motion-reduce:scroll-auto">
              {lane.ideas.map((idea) => (
                <li
                  key={idea.id}
                  className="w-[19rem] max-w-[85vw] shrink-0 snap-start"
                >
                  <IdeaDiscoveryCard idea={idea} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
