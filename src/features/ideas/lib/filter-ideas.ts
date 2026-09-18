import type { DiscoveryCategory } from "@/features/home/discovery-categories";
import type {
  DiscoveryIdea,
  IdeaRegion,
  IdeaSort,
  IdeaValidationStage,
} from "@/features/ideas/types";

export type IdeaFilters = {
  category: "all" | DiscoveryCategory;
  query: string;
  region: "all" | IdeaRegion;
  sort: IdeaSort;
  stage: "all" | IdeaValidationStage;
};

function validationStage(value: number): IdeaValidationStage {
  if (value >= 70) return "near";
  if (value >= 50) return "growing";
  return "early";
}

function matchesQuery(idea: DiscoveryIdea, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;

  return [
    idea.title,
    idea.category,
    idea.creator,
    idea.description,
    idea.location,
  ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
}

export function filterAndSortIdeas(
  ideas: readonly DiscoveryIdea[],
  filters: IdeaFilters,
) {
  return ideas
    .filter(
      (idea) =>
        matchesQuery(idea, filters.query) &&
        (filters.category === "all" ||
          idea.discoveryCategory === filters.category) &&
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
