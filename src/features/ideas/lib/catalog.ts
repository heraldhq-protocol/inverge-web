import type {
  DiscoveryIdea,
  IdeasDiscoveryData,
  Topic,
} from "@/features/ideas/types";

/**
 * Every idea a public surface may show, in fixture order.
 *
 * Featured ideas are part of the public catalogue, so a detail page, a topic
 * page, and a related-ideas list all count them. Keeping this in one function
 * stops a surface from forgetting the featured slice.
 */
export function allPublicIdeas(data: IdeasDiscoveryData): DiscoveryIdea[] {
  return [...data.featured, ...data.ideas];
}

export function findIdeaById(
  data: IdeasDiscoveryData,
  id: string,
): DiscoveryIdea | undefined {
  return allPublicIdeas(data).find((idea) => idea.id === id);
}

/** The topics an idea is filed under, in directory order. */
export function topicsForIdea(
  topics: readonly Topic[],
  ideaId: string,
): Topic[] {
  return topics.filter((topic) => topic.ideaIds.includes(ideaId));
}

/**
 * Ideas related to the one being read, derived from what the fixture already
 * records: a shared category and shared topic membership.
 *
 * Nothing is invented to make a "related" row look fuller. When an idea shares
 * nothing, the function returns an empty list and the caller renders no row
 * rather than padding it with unrelated ideas.
 */
export function relatedIdeas({
  idea,
  ideas,
  limit = 3,
  topics,
}: {
  idea: DiscoveryIdea;
  ideas: readonly DiscoveryIdea[];
  limit?: number;
  topics: readonly Topic[];
}): DiscoveryIdea[] {
  const sharedTopicIds = new Set(
    topicsForIdea(topics, idea.id).flatMap((topic) => topic.ideaIds),
  );

  function score(candidate: DiscoveryIdea): number {
    let value = 0;
    if (candidate.discoveryCategory === idea.discoveryCategory) value += 2;
    if (sharedTopicIds.has(candidate.id)) value += 1;
    return value;
  }

  return ideas
    .filter((candidate) => candidate.id !== idea.id)
    .map((candidate) => ({ candidate, score: score(candidate) }))
    .filter((entry) => entry.score > 0)
    .toSorted(
      (left, right) =>
        right.score - left.score ||
        right.candidate.validationPercent - left.candidate.validationPercent,
    )
    .slice(0, limit)
    .map((entry) => entry.candidate);
}
