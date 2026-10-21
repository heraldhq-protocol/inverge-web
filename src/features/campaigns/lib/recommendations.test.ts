import { describe, expect, it } from "vitest";

import { previewCampaigns } from "@/features/campaigns/content/preview-campaigns";
import {
  rankRelatedCampaigns,
  recommendationReason,
  recommendationTier,
} from "@/features/campaigns/lib/recommendations";
import type { Campaign } from "@/features/campaigns/types";

function bySlug(slug: string): Campaign {
  const campaign = previewCampaigns.find((entry) => entry.slug === slug);
  if (!campaign) throw new Error(`Missing preview campaign: ${slug}`);
  return campaign;
}

describe("campaign recommendations", () => {
  it("never recommends the source campaign", () => {
    const source = bySlug("sungrid-community-power");
    const result = rankRelatedCampaigns(source, previewCampaigns);

    expect(result.map((campaign) => campaign.id)).not.toContain(source.id);
  });

  it("ranks a shared subcategory above a shared parent", () => {
    const source = bySlug("sungrid-community-power");

    expect(recommendationTier(source, bySlug("farmlink-coldbox"))).toBe(0);
    expect(recommendationTier(source, bySlug("studymate-ng"))).toBe(1);
    expect(recommendationTier(source, bySlug("ibadan-creative-lab"))).toBe(3);
  });

  it("puts the strongest related campaign first", () => {
    const source = bySlug("sungrid-community-power");
    const result = rankRelatedCampaigns(source, previewCampaigns);

    expect(result[0]?.slug).toBe("farmlink-coldbox");
  });

  it("falls back to the legacy category for an unassigned campaign", () => {
    const source = bySlug("healthreach-clinic");
    const result = rankRelatedCampaigns(source, previewCampaigns);

    expect(result[0]?.slug).toBe("harmattan-health-kiosks");
  });

  it("deduplicates repeated ids and keeps one copy", () => {
    const source = bySlug("sungrid-community-power");
    const candidate = bySlug("farmlink-coldbox");
    const result = rankRelatedCampaigns(source, [
      candidate,
      candidate,
      candidate,
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(candidate.id);
  });

  it("excludes campaigns that are not publicly readable", () => {
    const source = bySlug("sungrid-community-power");
    const result = rankRelatedCampaigns(source, previewCampaigns);

    expect(result.map((campaign) => campaign.slug)).not.toContain(
      "skill-circle",
    );
    expect(result.map((campaign) => campaign.slug)).not.toContain(
      "naija-craft-marketplace",
    );
  });

  it("returns a stable order for the same input", () => {
    const source = bySlug("ibadan-creative-lab");
    const first = rankRelatedCampaigns(source, previewCampaigns).map(
      (campaign) => campaign.id,
    );
    const second = rankRelatedCampaigns(source, [...previewCampaigns].reverse())
      .map((campaign) => campaign.id)
      .sort();
    const firstSorted = [...first].sort();

    expect(second).toEqual(firstSorted);
    expect(
      rankRelatedCampaigns(source, previewCampaigns).map(
        (campaign) => campaign.id,
      ),
    ).toEqual(first);
  });

  it("returns an empty list when no candidate is eligible", () => {
    const source = bySlug("sungrid-community-power");
    const draft = bySlug("skill-circle");

    expect(rankRelatedCampaigns(source, [source, draft])).toEqual([]);
  });

  it("states the same reason that the ranking used", () => {
    const sungrid = bySlug("sungrid-community-power");
    const ibadan = bySlug("ibadan-creative-lab");

    expect(recommendationReason(sungrid, bySlug("farmlink-coldbox"))).toBe(
      "Same subcategory",
    );
    expect(recommendationReason(sungrid, bySlug("studymate-ng"))).toBe(
      "Same category",
    );
    expect(recommendationReason(sungrid, bySlug("ibadan-creative-lab"))).toBe(
      "Open to backers",
    );
    expect(recommendationReason(ibadan, sungrid)).toBe("Featured campaign");
    expect(
      recommendationReason(
        bySlug("healthreach-clinic"),
        bySlug("harmattan-health-kiosks"),
      ),
    ).toBe("Same broad category");
  });
});
