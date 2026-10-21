import { describe, expect, it } from "vitest";

import { previewCampaigns } from "@/features/campaigns/content/preview-campaigns";
import {
  CAMPAIGN_PAGE_SIZE,
  hasMoreCampaigns,
  nextVisibleCount,
  viewedLabel,
  visibleCampaigns,
} from "@/features/campaigns/lib/pagination";

const campaigns = previewCampaigns.slice(0, 8);
const firstPage = campaigns.slice(0, CAMPAIGN_PAGE_SIZE);

describe("campaign pagination", () => {
  it("returns the first page without mutating the result", () => {
    const visible = visibleCampaigns(campaigns, CAMPAIGN_PAGE_SIZE);

    expect(visible.map((campaign) => campaign.id)).toEqual(
      firstPage.map((campaign) => campaign.id),
    );
    expect(campaigns).toHaveLength(8);
  });

  it("appends the next page in order", () => {
    const secondPage = visibleCampaigns(campaigns, CAMPAIGN_PAGE_SIZE * 2);

    expect(secondPage.map((campaign) => campaign.id)).toEqual(
      campaigns.map((campaign) => campaign.id),
    );
  });

  it("deduplicates overlapping pages by campaign id", () => {
    const overlapping = [...campaigns, ...campaigns.slice(0, 2)];
    const visible = visibleCampaigns(overlapping, overlapping.length);

    expect(visible).toHaveLength(8);
    expect(new Set(visible.map((campaign) => campaign.id)).size).toBe(8);
  });

  it("treats a damaged negative or fractional count as a safe slice", () => {
    expect(visibleCampaigns(campaigns, -4)).toEqual([]);
    expect(visibleCampaigns(campaigns, 2.9)).toHaveLength(2);
  });

  it("reports whether another page exists", () => {
    expect(hasMoreCampaigns(8, 6)).toBe(true);
    expect(hasMoreCampaigns(8, 8)).toBe(false);
    expect(hasMoreCampaigns(0, 0)).toBe(false);
  });

  it("advances by one page", () => {
    expect(nextVisibleCount(6)).toBe(12);
    expect(nextVisibleCount(6, 4)).toBe(10);
    expect(nextVisibleCount(0, 0)).toBe(1);
  });

  it("writes singular and plural progress copy without guessing a total", () => {
    expect(viewedLabel(1, null)).toBe("You’ve viewed 1 campaign");
    expect(viewedLabel(2, null)).toBe("You’ve viewed 2 campaigns");
    expect(viewedLabel(1, 1)).toBe("You’ve viewed 1 of 1 campaign");
    expect(viewedLabel(6, 8)).toBe("You’ve viewed 6 of 8 campaigns");
  });
});
