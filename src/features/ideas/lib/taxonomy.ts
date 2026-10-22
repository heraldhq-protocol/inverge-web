/**
 * Idea discovery shares the campaign taxonomy.
 *
 * `@/features/campaigns/lib/taxonomy` is the single source of truth for the
 * categories and subcategories. These aliases give the ideas feature a neutral
 * vocabulary without copying the list, so a category or child added to the
 * campaign taxonomy appears in idea discovery too and a label edit cannot move
 * a saved filter.
 */
import {
  campaignCategories,
  campaignCategoryLabel,
  campaignSubcategoryLabel,
  findCampaignCategory,
  findCampaignSubcategory,
  isCampaignCategorySlug,
  isCampaignSubcategoryOf,
  type CampaignCategoryNode,
  type CampaignCategorySlug,
  type CampaignSubcategoryNode,
  type CampaignSubcategorySlug,
} from "@/features/campaigns/lib/taxonomy";

export type IdeaCategorySlug = CampaignCategorySlug;
export type IdeaSubcategorySlug = CampaignSubcategorySlug;
export type IdeaCategoryNode = CampaignCategoryNode;
export type IdeaSubcategoryNode = CampaignSubcategoryNode;

export const ideaCategories = campaignCategories;
export const isIdeaCategorySlug = isCampaignCategorySlug;
export const findIdeaCategory = findCampaignCategory;
export const findIdeaSubcategory = findCampaignSubcategory;
export const isIdeaSubcategoryOf = isCampaignSubcategoryOf;
export const ideaCategoryLabel = campaignCategoryLabel;
export const ideaSubcategoryLabel = campaignSubcategoryLabel;

export function subcategoriesForIdeaCategory(
  category: IdeaCategorySlug | "all",
): readonly IdeaSubcategoryNode[] {
  if (category === "all") return [];
  return findIdeaCategory(category)?.subcategories ?? [];
}
