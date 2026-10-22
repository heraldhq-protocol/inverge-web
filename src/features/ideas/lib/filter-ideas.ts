import {
  ideaCategoryLabel,
  ideaSubcategoryLabel,
  type IdeaCategorySlug,
  type IdeaSubcategorySlug,
} from "@/features/ideas/lib/taxonomy";
import type {
  DiscoveryIdea,
  IdeaRegion,
  IdeaScope,
  IdeaSort,
  IdeaValidationStage,
  Topic,
} from "@/features/ideas/types";

export type IdeaFilters = {
  category: "all" | IdeaCategorySlug;
  query: string;
  region: "all" | IdeaRegion;
  sort: IdeaSort;
  stage: "all" | IdeaValidationStage;
  subcategory: "all" | IdeaSubcategorySlug;
};

function validationStage(value: number): IdeaValidationStage {
  if (value >= 70) return "near";
  if (value >= 50) return "growing";
  return "early";
}

type IdeaTaxonomyFields = {
  category: string;
  taxonomyCategory?: IdeaCategorySlug | undefined;
  taxonomySubcategory?: IdeaSubcategorySlug | undefined;
};

/** The taxonomy text a card can show, with the descriptive label as fallback. */
export function ideaTaxonomyText(idea: IdeaTaxonomyFields): string {
  if (!idea.taxonomyCategory) return idea.category;

  const parent = ideaCategoryLabel(idea.taxonomyCategory);
  return idea.taxonomySubcategory
    ? `${parent} / ${ideaSubcategoryLabel(
        idea.taxonomyCategory,
        idea.taxonomySubcategory,
      )}`
    : parent;
}

function matchesQuery(idea: DiscoveryIdea, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;

  const taxonomy = idea.taxonomyCategory
    ? [
        ideaCategoryLabel(idea.taxonomyCategory),
        idea.taxonomySubcategory
          ? ideaSubcategoryLabel(
              idea.taxonomyCategory,
              idea.taxonomySubcategory,
            )
          : "",
      ]
    : [];

  return [
    idea.title,
    idea.category,
    ...taxonomy,
    idea.creator,
    idea.description,
    idea.location,
  ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
}

/**
 * Filter and order ideas for a browsing surface.
 *
 * `scope` is a route-level policy rather than a user filter, so it is a
 * separate argument and never reaches the query string. It defaults to
 * `public` so a surface that forgets it cannot list someone's private idea.
 */
export function filterAndSortIdeas(
  ideas: readonly DiscoveryIdea[],
  filters: IdeaFilters,
  scope: IdeaScope = "public",
) {
  return ideas
    .filter(
      (idea) =>
        (scope === "all" || idea.visibility === "public") &&
        matchesQuery(idea, filters.query) &&
        (filters.category === "all" ||
          idea.taxonomyCategory === filters.category) &&
        (filters.subcategory === "all" ||
          idea.taxonomySubcategory === filters.subcategory) &&
        (filters.region === "all" || idea.region === filters.region) &&
        (filters.stage === "all" ||
          validationStage(idea.validationPercent) === filters.stage),
    )
    .toSorted((left, right) => {
      switch (filters.sort) {
        case "most-supported":
          return right.supporters - left.supporters;
        case "newest":
          return right.publishedOrder - left.publishedOrder;
        case "most-validated":
        default:
          return right.validationPercent - left.validationPercent;
      }
    });
}

/**
 * The ideas a topic actually shows, in topic order.
 *
 * Topics record membership for every idea, public and private, so a creator can
 * keep a private idea filed under a topic without it appearing on the topic's
 * page or in its count.
 */
export function ideasInTopic(
  topic: Topic,
  ideas: readonly DiscoveryIdea[],
  scope: IdeaScope = "public",
) {
  const byId = new Map(ideas.map((idea) => [idea.id, idea]));

  return topic.ideaIds.flatMap((id) => {
    const idea = byId.get(id);
    if (!idea) return [];
    return scope === "all" || idea.visibility === "public" ? [idea] : [];
  });
}
