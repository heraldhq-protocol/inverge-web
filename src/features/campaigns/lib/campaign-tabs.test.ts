import { describe, expect, it } from "vitest";

import { findPreviewCampaignById } from "@/features/campaigns/content/preview-campaigns";
import {
  campaignTabHref,
  campaignTabIds,
  campaignTabsFor,
  defaultCampaignTab,
  parseCampaignTab,
  resolveCampaignTab,
} from "@/features/campaigns/lib/campaign-tabs";
import type { Campaign } from "@/features/campaigns/types";

function campaignById(id: string): Campaign {
  const campaign = findPreviewCampaignById(id);
  if (!campaign) throw new Error(`Expected the ${id} fixture`);
  return campaign;
}

describe("campaignTabsFor", () => {
  it("keeps the rewards tab for a campaign that offers no rewards", () => {
    const campaign = campaignById("campaign-harmattan-kiosks");

    expect(campaign.supportTiers).toEqual([]);
    expect(campaignTabsFor(campaign).map((tab) => tab.id)).toContain("rewards");
  });

  it("keeps the milestones tab for a campaign that published a plan", () => {
    expect(
      campaignTabsFor(campaignById("campaign-sungrid")).map((t) => t.id),
    ).toContain("milestones");
  });

  it("drops the milestones tab when there is no plan to show", () => {
    const campaign = campaignById("campaign-sungrid");
    const tabs = campaignTabsFor({ ...campaign, milestones: [] });

    expect(tabs.map((tab) => tab.id)).not.toContain("milestones");
    expect(tabs.map((tab) => tab.id)).toContain("story");
  });

  it("labels every tab it returns", () => {
    for (const tab of campaignTabsFor(campaignById("campaign-sungrid"))) {
      expect(tab.label.length).toBeGreaterThan(0);
    }
  });
});

describe("parseCampaignTab", () => {
  it("accepts a known tab id", () => {
    expect(parseCampaignTab("rewards")).toBe("rewards");
    expect(parseCampaignTab("facts")).toBe("facts");
  });

  it("returns null for nothing, an unknown id, or a wrong case", () => {
    expect(parseCampaignTab(undefined)).toBeNull();
    expect(parseCampaignTab("")).toBeNull();
    expect(parseCampaignTab("Rewards")).toBeNull();
    expect(parseCampaignTab("../../etc/passwd")).toBeNull();
  });

  it("lists every tab id it can resolve", () => {
    for (const id of campaignTabIds) {
      expect(parseCampaignTab(id)).toBe(id);
    }
  });
});

describe("resolveCampaignTab", () => {
  it("opens the requested tab when the campaign has it", () => {
    const tabs = campaignTabsFor(campaignById("campaign-sungrid"));

    expect(resolveCampaignTab("updates", tabs)).toBe("updates");
  });

  it("falls back to the first tab when the request names a tab that is not there", () => {
    const campaign = campaignById("campaign-sungrid");
    const tabs = campaignTabsFor({ ...campaign, milestones: [] });

    expect(resolveCampaignTab("milestones", tabs)).toBe("story");
  });

  it("falls back to the first tab when the request names nothing", () => {
    const tabs = campaignTabsFor(campaignById("campaign-sungrid"));

    expect(resolveCampaignTab(undefined, tabs)).toBe("story");
    expect(defaultCampaignTab).toBe("story");
  });

  it("falls back to the default when a campaign somehow has no tabs", () => {
    expect(resolveCampaignTab("rewards", [])).toBe(defaultCampaignTab);
  });
});

describe("campaignTabHref", () => {
  it("links to the tab on the campaign, encoding an awkward slug", () => {
    expect(campaignTabHref("sungrid-community-power", "facts")).toBe(
      "/campaigns/sungrid-community-power?tab=facts",
    );
    expect(campaignTabHref("a b/c", "story")).toBe(
      "/campaigns/a%20b%2Fc?tab=story",
    );
  });
});
