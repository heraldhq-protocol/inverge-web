import { compareCampaigns } from "@/features/campaigns/lib/filters";
import { isPublicPhase } from "@/features/campaigns/lib/status";
import type { Campaign } from "@/features/campaigns/types";

/**
 * Baseline related-campaign rule.
 *
 * There is no recommendation service in this repository, so this is a
 * transparent, deterministic fallback rather than a score:
 *
 * 1. the same subcategory;
 * 2. the same parent category;
 * 3. an editorially featured campaign;
 * 4. any other eligible public campaign.
 *
 * Campaigns without a taxonomy assignment fall back to their legacy broad
 * category for step 2, which keeps health and education listings related to
 * each other without pretending they belong to a supplied category.
 *
 * The source campaign, ineligible phases, and duplicate ids are removed before
 * ranking. Ties keep the discovery sort (`ending-soon`) and finally compare
 * slugs, so the order is stable across renders.
 */
export type RecommendationTier = 0 | 1 | 2 | 3;

export function recommendationTier(
  source: Campaign,
  candidate: Campaign,
): RecommendationTier {
  if (source.taxonomy && candidate.taxonomy) {
    if (
      candidate.taxonomy.category === source.taxonomy.category &&
      source.taxonomy.subcategory !== null &&
      candidate.taxonomy.subcategory === source.taxonomy.subcategory
    ) {
      return 0;
    }
    if (candidate.taxonomy.category === source.taxonomy.category) return 1;
  }

  if (!source.taxonomy && candidate.category === source.category) return 1;
  if (candidate.featured) return 2;
  return 3;
}

/**
 * The plain-language reason a candidate is in the list.
 *
 * This is derived from the same tier the ordering uses, so a badge can never
 * claim a stronger relationship than the ranking actually applied. It says what
 * matched, not why the viewer should want it.
 */
export function recommendationReason(
  source: Campaign,
  candidate: Campaign,
): string {
  switch (recommendationTier(source, candidate)) {
    case 0:
      return "Same subcategory";
    case 1:
      return source.taxonomy ? "Same category" : "Same broad category";
    case 2:
      return "Featured campaign";
    case 3:
      return "Open to backers";
  }
}

export function rankRelatedCampaigns(
  source: Campaign,
  candidates: readonly Campaign[],
): readonly Campaign[] {
  const seen = new Set<string>([source.id]);
  const ranked: { campaign: Campaign; tier: RecommendationTier }[] = [];

  for (const candidate of candidates) {
    if (seen.has(candidate.id)) continue;
    if (!isPublicPhase(candidate.phase)) continue;
    seen.add(candidate.id);
    ranked.push({
      campaign: candidate,
      tier: recommendationTier(source, candidate),
    });
  }

  return ranked
    .sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return compareCampaigns(a.campaign, b.campaign, "ending-soon");
    })
    .map((entry) => entry.campaign);
}
