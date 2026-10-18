import { describe, expect, it } from "vitest";

import { previewCampaigns } from "@/features/campaigns/content/preview-campaigns";
import {
  isWorkingCapitalInRange,
  PLATFORM_SUCCESS_FEE_BPS,
  WORKING_CAPITAL_MAX_BPS,
  WORKING_CAPITAL_MIN_BPS,
  workingCapitalChoices,
} from "@/features/campaigns/lib/escrow";

describe("platform escrow parameters", () => {
  it("states the All-or-Nothing success fee from FR-505", () => {
    expect(PLATFORM_SUCCESS_FEE_BPS).toBe(500);
  });

  it("bounds the first tranche at 15% and 25% of the raise", () => {
    expect(WORKING_CAPITAL_MIN_BPS).toBe(1_500);
    expect(WORKING_CAPITAL_MAX_BPS).toBe(2_500);
  });
});

describe("isWorkingCapitalInRange", () => {
  it("accepts the floor, the ceiling, and the shares between them", () => {
    expect(isWorkingCapitalInRange(WORKING_CAPITAL_MIN_BPS)).toBe(true);
    expect(isWorkingCapitalInRange(2_000)).toBe(true);
    expect(isWorkingCapitalInRange(WORKING_CAPITAL_MAX_BPS)).toBe(true);
  });

  it("rejects a share outside the published range", () => {
    expect(isWorkingCapitalInRange(1_499)).toBe(false);
    expect(isWorkingCapitalInRange(2_501)).toBe(false);
    expect(isWorkingCapitalInRange(0)).toBe(false);
  });
});

describe("workingCapitalChoices", () => {
  it("offers one percent steps from the floor to the ceiling", () => {
    const choices = workingCapitalChoices();

    expect(choices).toHaveLength(11);
    expect(choices.at(0)).toEqual({ label: "15%", value: "15" });
    expect(choices.at(-1)).toEqual({ label: "25%", value: "25" });
    expect(choices.map((choice) => choice.value)).toEqual([
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
    ]);
  });

  it("is the same set every caller gets, so the select cannot drift", () => {
    expect(workingCapitalChoices()).toEqual(workingCapitalChoices());
  });
});

describe("preview fixtures against the platform range", () => {
  it("publishes a first tranche that is inside the range whenever it publishes one", () => {
    const published = previewCampaigns
      .map((campaign) => campaign.escrow.workingCapitalBps)
      .filter((bps): bps is number => bps !== null);

    expect(published.length).toBeGreaterThan(0);

    for (const bps of published) {
      expect(isWorkingCapitalInRange(bps)).toBe(true);
    }
  });

  it("never publishes a first tranche above the campaign's own cap", () => {
    for (const campaign of previewCampaigns) {
      const { workingCapitalBps, workingCapitalCapBps } = campaign.escrow;
      if (workingCapitalBps === null || workingCapitalCapBps === null) continue;

      expect(workingCapitalBps).toBeLessThanOrEqual(workingCapitalCapBps);
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
