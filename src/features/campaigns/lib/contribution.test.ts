import { describe, expect, it } from "vitest";

import { findPreviewCampaignById } from "@/features/campaigns/content/preview-campaigns";
import {
  additionalSupportAmount,
  additionalSupportInvalid,
  contributionAmount,
  contributionSummaryLine,
  contributionSteps,
  emptyContributionDraft,
  handoffStates,
  planShareFor,
  quoteLines,
  routeAvailability,
  selectedTier,
  shippingRegions,
  validateContributionStep,
  visibleContributionSteps,
  type ContributionDraft,
} from "@/features/campaigns/lib/contribution";
import type { Campaign } from "@/features/campaigns/types";

/** $10, digital. */
const DIGITAL = "sungrid-tier-community";
/** $150, physical, posted to three named countries. */
const LANTERN = "sungrid-tier-lantern";
/** $200, mixed: a digital part and a posted report. */
const SITE = "sungrid-tier-site";

function sungrid(): Campaign {
  const campaign = findPreviewCampaignById("campaign-sungrid");
  if (!campaign) throw new Error("Expected the sungrid fixture");
  return campaign;
}

function draft(overrides: Partial<ContributionDraft> = {}): ContributionDraft {
  return { ...emptyContributionDraft, ...overrides };
}

describe("visibleContributionSteps", () => {
  it("drops Delivery when no reward is selected", () => {
    expect(
      visibleContributionSteps(draft(), sungrid()).map((s) => s.id),
    ).toEqual(["reward", "settlement", "disclosures", "review"]);
  });

  it("drops Delivery for a digital reward, which has nothing to send", () => {
    expect(
      visibleContributionSteps(draft({ tierId: DIGITAL }), sungrid()).map(
        (s) => s.id,
      ),
    ).toEqual(["reward", "settlement", "disclosures", "review"]);
  });

  it("puts Delivery after the reward once that reward ships", () => {
    expect(
      visibleContributionSteps(draft({ tierId: LANTERN }), sungrid()).map(
        (s) => s.id,
      ),
    ).toEqual(["reward", "options", "settlement", "disclosures", "review"]);
  });

  it("keeps the flow's own order for a mixed reward", () => {
    const ids = visibleContributionSteps(
      draft({ tierId: SITE }),
      sungrid(),
    ).map((s) => s.id);

    expect(ids).toEqual(contributionSteps.map((s) => s.id));
  });
});

describe("selectedTier", () => {
  it("returns null for an empty selection and for an id the campaign does not publish", () => {
    const campaign = sungrid();

    expect(selectedTier(draft(), campaign)).toBeNull();
    expect(selectedTier(draft({ tierId: "not-a-tier" }), campaign)).toBeNull();
  });

  it("resolves a published tier by id", () => {
    expect(selectedTier(draft({ tierId: LANTERN }), sungrid())?.id).toBe(
      LANTERN,
    );
  });
});

describe("additionalSupportAmount", () => {
  it("treats a blank field and an explicit zero as nothing extra", () => {
    expect(additionalSupportAmount(draft())).toBeNull();
    expect(additionalSupportAmount(draft({ supportInput: "0" }))).toBeNull();
    expect(additionalSupportAmount(draft({ supportInput: "0.00" }))).toBeNull();
  });

  it("reads an amount to the cent", () => {
    expect(additionalSupportAmount(draft({ supportInput: "12.50" }))).toEqual({
      atomic: "1250",
      currency: "USD",
      decimals: 2,
    });
  });

  it("does not report invalid input as an amount", () => {
    expect(
      additionalSupportAmount(draft({ supportInput: "twenty" })),
    ).toBeNull();
  });
});

describe("additionalSupportInvalid", () => {
  it("passes a blank field, a zero, and a well-formed amount", () => {
    expect(additionalSupportInvalid(draft())).toBe(false);
    expect(additionalSupportInvalid(draft({ supportInput: "0" }))).toBe(false);
    expect(additionalSupportInvalid(draft({ supportInput: "5" }))).toBe(false);
  });

  it("flags text that is not an amount", () => {
    expect(additionalSupportInvalid(draft({ supportInput: "abc" }))).toBe(true);
  });
});

describe("contributionAmount", () => {
  it("reads the free amount when the backer takes no reward", () => {
    expect(contributionAmount(draft({ amountInput: "25" }), sungrid())).toEqual(
      {
        atomic: "2500",
        currency: "USD",
        decimals: 2,
      },
    );
  });

  it("uses the reward's own amount and ignores a leftover free amount", () => {
    expect(
      contributionAmount(
        draft({ amountInput: "9999", tierId: LANTERN }),
        sungrid(),
      ),
    ).toEqual({ atomic: "15000", currency: "USD", decimals: 2 });
  });

  it("adds optional support to the reward's amount", () => {
    expect(
      contributionAmount(
        draft({ supportInput: "20", tierId: LANTERN }),
        sungrid(),
      ),
    ).toEqual({ atomic: "17000", currency: "USD", decimals: 2 });
  });

  it("does not total an amount it cannot read", () => {
    expect(
      contributionAmount(draft({ amountInput: "abc" }), sungrid()),
    ).toBeNull();
    expect(
      contributionAmount(
        draft({ supportInput: "abc", tierId: LANTERN }),
        sungrid(),
      ),
    ).toBeNull();
  });
});

describe("shippingRegions", () => {
  it("is empty when nothing ships", () => {
    expect(shippingRegions(draft(), sungrid())).toEqual([]);
    expect(shippingRegions(draft({ tierId: DIGITAL }), sungrid())).toEqual([]);
  });

  it("returns the creator's own destinations for a posted reward", () => {
    expect(shippingRegions(draft({ tierId: LANTERN }), sungrid())).toEqual([
      "Nigeria",
      "Ghana",
      "Kenya",
    ]);
  });
});

describe("validateContributionStep for the reward", () => {
  it("requires an amount when no reward is chosen", () => {
    const issues = validateContributionStep(draft(), sungrid(), "reward");

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe("amount");
  });

  it("accepts a positive free amount", () => {
    expect(
      validateContributionStep(
        draft({ amountInput: "25" }),
        sungrid(),
        "reward",
      ),
    ).toEqual([]);
  });

  it("rejects an amount it cannot read", () => {
    expect(
      validateContributionStep(
        draft({ amountInput: "-5" }),
        sungrid(),
        "reward",
      )[0]?.field,
    ).toBe("amount");
  });

  it("does not ask for an amount once a reward sets one", () => {
    expect(
      validateContributionStep(draft({ tierId: LANTERN }), sungrid(), "reward"),
    ).toEqual([]);
  });

  it("reports a malformed extra under its own field", () => {
    const issues = validateContributionStep(
      draft({ supportInput: "abc", tierId: LANTERN }),
      sungrid(),
      "reward",
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe("supportInput");
  });

  it("refuses a reward the campaign does not publish", () => {
    const issues = validateContributionStep(
      draft({ tierId: "not-a-tier" }),
      sungrid(),
      "reward",
    );

    expect(issues[0]?.field).toBe("tierId");
  });
});

describe("validateContributionStep for delivery", () => {
  it("asks nothing when the reward does not ship", () => {
    expect(
      validateContributionStep(
        draft({ tierId: DIGITAL }),
        sungrid(),
        "options",
      ),
    ).toEqual([]);
  });

  it("requires a destination for a posted reward", () => {
    const issues = validateContributionStep(
      draft({ tierId: LANTERN }),
      sungrid(),
      "options",
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe("shippingRegion");
  });

  it("accepts a destination the creator named", () => {
    expect(
      validateContributionStep(
        draft({ shippingRegion: "Ghana", tierId: LANTERN }),
        sungrid(),
        "options",
      ),
    ).toEqual([]);
  });

  it("rejects a destination the creator never offered", () => {
    expect(
      validateContributionStep(
        draft({ shippingRegion: "Brazil", tierId: LANTERN }),
        sungrid(),
        "options",
      )[0]?.field,
    ).toBe("shippingRegion");
  });
});

describe("routeAvailability", () => {
  it("offers the wallet route everywhere, because it needs no rate", () => {
    const [wallet] = routeAvailability(sungrid());

    expect(wallet).toMatchObject({ available: true, route: "usdc-wallet" });
  });

  it("lists the naira route only where the campaign accepts cNGN", () => {
    const campaign = sungrid();
    const withoutFiat = routeAvailability(campaign);

    expect(withoutFiat.map((option) => option.route)).toEqual(["usdc-wallet"]);

    const withFiat = routeAvailability({
      ...campaign,
      funding: {
        ...campaign.funding,
        supportedSettlementAssets: ["USDC", "cNGN"],
      },
    });

    expect(withFiat.map((option) => option.route)).toEqual([
      "usdc-wallet",
      "fiat-on-ramp",
    ]);
  });

  it("blocks the naira route and says why, rather than hiding it", () => {
    const campaign = sungrid();
    const fiat = routeAvailability({
      ...campaign,
      funding: {
        ...campaign.funding,
        supportedSettlementAssets: ["USDC", "cNGN"],
      },
    }).find((option) => option.route === "fiat-on-ramp");

    expect(fiat?.available).toBe(false);
    expect(fiat?.blockedReason).toContain("quote");
  });
});

describe("validateContributionStep for settlement", () => {
  it("requires a route", () => {
    expect(
      validateContributionStep(draft(), sungrid(), "settlement")[0]?.field,
    ).toBe("route");
  });

  it("accepts the wallet route", () => {
    expect(
      validateContributionStep(
        draft({ route: "usdc-wallet" }),
        sungrid(),
        "settlement",
      ),
    ).toEqual([]);
  });

  it("refuses a route the campaign does not offer", () => {
    const issues = validateContributionStep(
      draft({ route: "fiat-on-ramp" }),
      sungrid(),
      "settlement",
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe("route");
  });

  it("refuses the naira route while no quote service exists", () => {
    const campaign = sungrid();
    const issues = validateContributionStep(
      draft({ route: "fiat-on-ramp" }),
      {
        ...campaign,
        funding: {
          ...campaign.funding,
          supportedSettlementAssets: ["USDC", "cNGN"],
        },
      },
      "settlement",
    );

    expect(issues[0]?.message).toContain("quote");
  });
});

describe("validateContributionStep for the terms and the review", () => {
  it("requires the terms to be accepted", () => {
    expect(
      validateContributionStep(draft(), sungrid(), "disclosures")[0]?.field,
    ).toBe("acknowledgeTerms");
    expect(
      validateContributionStep(
        draft({ acknowledgeTerms: true }),
        sungrid(),
        "disclosures",
      ),
    ).toEqual([]);
  });

  it("requires the preview to be acknowledged", () => {
    expect(
      validateContributionStep(draft(), sungrid(), "review")[0]?.field,
    ).toBe("acknowledgeDemo");
    expect(
      validateContributionStep(
        draft({ acknowledgeDemo: true }),
        sungrid(),
        "review",
      ),
    ).toEqual([]);
  });
});

describe("quoteLines", () => {
  it("names the campaign and the reward with its own amount", () => {
    const lines = quoteLines(draft({ tierId: LANTERN }), sungrid());

    expect(lines.find((line) => line.label === "Reward")).toMatchObject({
      value: "Lantern kit",
    });
    expect(lines.find((line) => line.label === "Reward amount")).toMatchObject({
      value: "$150",
    });
  });

  it("says plainly when no reward is being taken", () => {
    const line = quoteLines(draft({ amountInput: "25" }), sungrid()).find(
      (entry) => entry.label === "Reward",
    );

    expect(line?.unknown).toBe(true);
    expect(line?.value).toContain("None");
  });

  it("adds a line for optional support only when there is some", () => {
    const without = quoteLines(draft({ tierId: LANTERN }), sungrid());
    const withSupport = quoteLines(
      draft({ supportInput: "20", tierId: LANTERN }),
      sungrid(),
    );

    expect(without.some((line) => line.label === "Additional support")).toBe(
      false,
    );
    expect(
      withSupport.find((line) => line.label === "Additional support"),
    ).toMatchObject({ value: "$20" });
    expect(
      withSupport.find((line) => line.label === "Contribution amount")?.value,
    ).toBe("$170");
  });

  it("never prices shipping and keeps it out of the total", () => {
    const lines = quoteLines(
      draft({ shippingRegion: "Nigeria", tierId: LANTERN }),
      sungrid(),
    );

    expect(lines).toContainEqual({
      label: "Shipping cost",
      unknown: true,
      value: "Not quoted by Inverge",
    });
    expect(
      lines.find((line) => line.label === "Contribution amount")?.value,
    ).toBe("$150");
  });

  it("shows the chosen destination and marks it unknown before one is chosen", () => {
    const chosen = quoteLines(
      draft({ shippingRegion: "Ghana", tierId: LANTERN }),
      sungrid(),
    );
    const unchosen = quoteLines(draft({ tierId: LANTERN }), sungrid());

    expect(chosen.find((line) => line.label === "Delivering to")).toMatchObject(
      {
        value: "Ghana",
      },
    );
    expect(
      unchosen.find((line) => line.label === "Delivering to")?.unknown,
    ).toBe(true);
  });

  it("carries no shipping lines for a reward that does not ship", () => {
    const labels = quoteLines(draft({ tierId: DIGITAL }), sungrid()).map(
      (line) => line.label,
    );

    expect(labels).not.toContain("Delivering to");
    expect(labels).not.toContain("Shipping cost");
  });

  it("states the wallet total and that no platform fee is charged to the backer", () => {
    const lines = quoteLines(
      draft({ route: "usdc-wallet", tierId: LANTERN }),
      sungrid(),
    );

    expect(lines.find((line) => line.label === "Total charged")).toMatchObject({
      value: "$150",
    });
    expect(
      lines.find((line) => line.label === "Platform fee")?.value,
    ).toContain("None charged to you");
  });

  it("invents no figure on the naira route, where a quote is missing", () => {
    const campaign = sungrid();
    const lines = quoteLines(
      draft({ route: "fiat-on-ramp", amountInput: "25" }),
      {
        ...campaign,
        funding: {
          ...campaign.funding,
          supportedSettlementAssets: ["USDC", "cNGN"],
        },
      },
    );

    for (const label of [
      "Exchange rate",
      "Provider fee",
      "Total charged",
      "Estimated settlement amount",
    ]) {
      expect(lines.find((line) => line.label === label)).toMatchObject({
        unknown: true,
        value: "Not available",
      });
    }
  });

  it("says the route is not chosen yet when none is", () => {
    expect(
      quoteLines(draft({ amountInput: "25" }), sungrid()).find(
        (line) => line.label === "Payment route",
      ),
    ).toMatchObject({ unknown: true, value: "Not chosen yet" });
  });
});

describe("planShareFor", () => {
  it("names milestone one and its tranche, not a lump sum handed over up front", () => {
    const campaign = sungrid();
    const sentence = planShareFor(
      { atomic: "15000", currency: "USD", decimals: 2 },
      campaign,
    );
    const first = campaign.milestones[0];

    expect(first).toBeDefined();
    expect(sentence).toContain("milestone one");
    expect(sentence).toContain(first?.title ?? "");
  });
});

describe("contributionSummaryLine", () => {
  it("states the escrow destination for a known amount and a dash for none", () => {
    expect(
      contributionSummaryLine({ atomic: "2500", currency: "USD", decimals: 2 }),
    ).toBe("$25 to a campaign-specific escrow");
    expect(contributionSummaryLine(null)).toContain("—");
  });
});

describe("handoffStates", () => {
  it("names the failure and expiry states, so the flow cannot skip them", () => {
    expect(handoffStates).toContain("Quote expired");
    expect(handoffStates).toContain("Payment cancelled or failed");
  });
});
