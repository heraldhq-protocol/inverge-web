import type { DiscoveryIdea } from "@/features/ideas/types";

/**
 * The home feed's ordering rules.
 *
 * There is no personalisation service in this product: no category preference
 * is stored, no view history is recorded, and nothing here is called
 * "recommended for you". The rules below are the transparent, non-personalised
 * fallback the dashboard is allowed to claim:
 *
 * - only public ideas, so a private idea can never leak into a feed;
 * - never repeat an idea that the page already shows above;
 * - most-supported first, which is a fact about the data, not a prediction.
 */
export function rankIdeasForFeed(
  ideas: readonly DiscoveryIdea[],
  {
    excludeIds = [],
    limit,
    requireSupported = true,
  }: {
    excludeIds?: readonly string[];
    limit: number;
    /** Skip ideas with no signal yet, so a feed row is never an empty boast. */
    requireSupported?: boolean;
  },
): DiscoveryIdea[] {
  const excluded = new Set(excludeIds);

  return ideas
    .filter(
      (idea) =>
        idea.visibility === "public" &&
        !excluded.has(idea.id) &&
        (!requireSupported || idea.supporters > 0),
    )
    .sort(
      (a, b) =>
        b.supporters - a.supporters ||
        b.validationPercent - a.validationPercent ||
        a.title.localeCompare(b.title),
    )
    .slice(0, Math.max(0, limit));
}

/**
 * The idea whose feedback form is the best destination for "Share feedback".
 *
 * A real form has to exist — enabled, published, with at least one question —
 * otherwise the quick action would point at an idea that cannot accept an
 * answer. Returns `null` when nothing qualifies, and the caller hides the
 * action instead of linking somewhere vague.
 */
export function bestFeedbackOpportunity(
  ideas: readonly DiscoveryIdea[],
  formFor: (
    ideaId: string,
  ) => { enabled: boolean; questions: readonly unknown[] } | undefined,
): DiscoveryIdea | null {
  const eligible = ideas.filter((idea) => {
    if (idea.visibility !== "public") return false;
    const form = formFor(idea.id);
    return Boolean(form?.enabled && form.questions.length > 0);
  });

  return eligible.sort((a, b) => b.supporters - a.supporters).at(0) ?? null;
}
