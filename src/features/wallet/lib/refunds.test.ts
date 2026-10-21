import { describe, expect, it } from "vitest";

import { previewContributions } from "@/features/campaigns/content/preview-contributions";
import {
  refundActionAvailability,
  refundsFromContributions,
  summariseRefunds,
} from "@/features/wallet/lib/refunds";

const refunds = refundsFromContributions(previewContributions);

describe("refundsFromContributions", () => {
  it("keeps only contributions with a refund position and strips the rest", () => {
    expect(refunds).toHaveLength(2);
    expect(refunds.every((refund) => refund.state !== "not-applicable")).toBe(
      true,
    );
  });

  it("carries the campaign, contribution, and eligible amount without a signature", () => {
    const available = refunds.find((refund) => refund.state === "available");

    expect(available).toMatchObject({
      campaignSlug: "lagos-kitchen-collective",
      contributionId: "contrib-lagos-kitchen-01",
      eligibleAmount: { atomic: "500000", currency: "USD", decimals: 2 },
      transaction: null,
    });
    expect(available?.campaignTitle).toBeTruthy();
  });

  it("sorts by confirmation, then claim date", () => {
    expect(refunds.map((refund) => refund.state)).toEqual([
      "confirmed",
      "available",
    ]);
  });
});

describe("summariseRefunds", () => {
  it("separates refundable, in progress, and returned totals", () => {
    const summary = summariseRefunds(refunds);

    expect(summary.refundable).toEqual({
      atomic: "500000",
      currency: "USD",
      decimals: 2,
    });
    expect(summary.refunded).toEqual({
      atomic: "250000",
      currency: "USD",
      decimals: 2,
    });
    expect(summary.inProgress.atomic).toBe("0");
    expect(summary.needsAttention).toBe(1);
  });

  it("returns zero rather than throwing when there are no refunds", () => {
    expect(summariseRefunds([])).toMatchObject({
      needsAttention: 0,
      refunded: { atomic: "0" },
      refundable: { atomic: "0" },
      refunds: [],
    });
  });
});

describe("refundActionAvailability", () => {
  it("offers a claim only where one is possible in principle", () => {
    expect(refundActionAvailability("available")).toMatchObject({
      canRequest: true,
      label: "Claim refund",
      reason: null,
    });
    expect(refundActionAvailability("failed")).toMatchObject({
      canRequest: true,
      label: "Try the refund again",
    });
  });

  it("prevents a duplicate claim while one is being processed", () => {
    expect(refundActionAvailability("claim-submitted")).toMatchObject({
      canRequest: false,
      label: "Claim submitted",
    });
    expect(refundActionAvailability("claim-submitted").reason).toMatch(
      /duplicate/,
    );
    expect(refundActionAvailability("processing").canRequest).toBe(false);
  });

  it("does not offer a control for a completed or inapplicable refund", () => {
    expect(refundActionAvailability("confirmed").canRequest).toBe(false);
    expect(refundActionAvailability("not-applicable").canRequest).toBe(false);
  });
});
