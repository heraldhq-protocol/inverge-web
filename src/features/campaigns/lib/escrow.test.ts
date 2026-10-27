import { describe, expect, it } from "vitest";

import { previewCampaigns } from "@/features/campaigns/content/preview-campaigns";
import {
  PLATFORM_SUCCESS_FEE_BPS,
  WORKING_CAPITAL_BPS,
  workingCapitalSentence,
} from "@/features/campaigns/lib/escrow";

describe("platform escrow parameters", () => {
  it("states the All-or-Nothing success fee from FR-505", () => {
    expect(PLATFORM_SUCCESS_FEE_BPS).toBe(500);
  });

  it("fixes the working-capital tranche at 20% of the target", () => {
    // FR-503a as revised: a platform constant, not a creator choice, and not a
    // share of whatever the campaign happens to raise.
    expect(WORKING_CAPITAL_BPS).toBe(2_000);
  });
});

describe("preview fixtures against the fixed tranche", () => {
  it("publishes either no working-capital term or exactly 20% of the target", () => {
    const published = previewCampaigns
      .map((campaign) => campaign.escrow.workingCapitalBps)
      .filter((bps): bps is number => bps !== null);

    expect(published.length).toBeGreaterThan(0);

    for (const bps of published) expect(bps).toBe(WORKING_CAPITAL_BPS);
  });

  it("has milestone weights totalling 100% of the post-tranche pool", () => {
    // The weights divide what remains after the fixed tranche, so they total
    // 10,000 on their own. A combined 100% invariant would imply the old
    // same-base model and shrink every overfunded campaign's milestones.
    for (const campaign of previewCampaigns) {
      const tranches = campaign.milestones.reduce(
        (total, milestone) => total + milestone.allocationBps,
        0,
      );

      expect(tranches).toBe(10_000);
      expect(
        campaign.milestones.every((milestone) => milestone.allocationBps > 0),
      ).toBe(true);
    }
  });

  it("publishes the platform success fee on every campaign that publishes terms", () => {
    const fees = previewCampaigns
      .map((campaign) => campaign.escrow.successFeeBps)
      .filter((bps): bps is number => bps !== null);

    expect(fees.length).toBeGreaterThan(0);

    for (const bps of fees) expect(bps).toBe(PLATFORM_SUCCESS_FEE_BPS);
  });
});

describe("workingCapitalSentence", () => {
  it("sizes the tranche from the target and calls it a separate stage", () => {
    const campaign = previewCampaigns.find(
      (item) => item.escrow.workingCapitalBps !== null,
    );
    expect(campaign).toBeDefined();

    const sentence = workingCapitalSentence(campaign!);

    expect(sentence).toContain("20% of the original target");
    expect(sentence).toContain("separate stage");
    expect(sentence).toContain("does not grow");
    expect(sentence).not.toContain("capped at");
  });

  it("does not invent a figure when the campaign has not published terms", () => {
    const campaign = previewCampaigns.find(
      (item) => item.escrow.workingCapitalBps === null,
    );
    expect(campaign).toBeDefined();

    expect(workingCapitalSentence(campaign!)).toContain(
      "depends on this campaign's published terms",
    );
  });
});
