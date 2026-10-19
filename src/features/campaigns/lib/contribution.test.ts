import { describe, expect, it } from "vitest";

import { findPreviewCampaignById } from "@/features/campaigns/content/preview-campaigns";
import {
  additionalSupportAmount,
  additionalSupportInvalid,
  chosenDestination,
  contributionAmount,
  contributionSteps,
  contributionSummaryLine,
  emptyContributionDraft,
  fulfilmentCharge,
  handoffStates,
  maxRewardQuantity,
  planShareFor,
  quoteLines,
  rewardQuantity,
  routeAvailability,
  selectedAddOns,
  selectedTier,
  totalDue,
  validateContributionStep,
  visibleContributionSteps,
  type ContributionDraft,
} from "@/features/campaigns/lib/contribution";
import type {
  Campaign,
  RewardAddOn,
  SupportTier,
} from "@/features/campaigns/types";

/** $10, digital, nothing to configure. */
const DIGITAL = "sungrid-tier-community";
/** $150, physical, four per backer, two variant groups, three add-ons. */
const LANTERN = "sungrid-tier-lantern";
/** $200, mixed: a digital part and a posted report. */
const SITE = "sungrid-tier-site";

const COLOUR = "sungrid-variant-colour";
const PLUG = "sungrid-variant-plug";
const FIELD_GUIDE = "sungrid-addon-field-guide";
const SECOND_LANTERN = "sungrid-addon-second-lantern";
const DATA_PACK = "sungrid-addon-data-pack";

function sungrid(): Campaign {
  const campaign = findPreviewCampaignById("campaign-sungrid");
  if (!campaign) throw new Error("Expected the sungrid fixture");
  return campaign;
}

function tierIn(campaign: Campaign, id: string): SupportTier {
  const found = campaign.supportTiers.find((tier) => tier.id === id);
  if (!found) throw new Error(`Expected the ${id} fixture tier`);
  return found;
}

function draft(overrides: Partial<ContributionDraft> = {}): ContributionDraft {
  return { ...emptyContributionDraft, ...overrides };
}

/** The lantern kit with both variant questions answered, so only the destination varies. */
function lanternDraft(
  overrides: Partial<ContributionDraft> = {},
): ContributionDraft {
  return draft({
    tierId: LANTERN,
    variantSelections: { [COLOUR]: "amber", [PLUG]: "plug-uk" },
    ...overrides,
  });
}

describe("visibleContributionSteps", () => {
  it("drops the options step when no reward is selected", () => {
    expect(
      visibleContributionSteps(draft(), sungrid()).map((s) => s.id),
    ).toEqual(["reward", "settlement", "disclosures", "review"]);
  });

  it("drops the options step for a digital reward, which has nothing to configure", () => {
    expect(
      visibleContributionSteps(draft({ tierId: DIGITAL }), sungrid()).map(
        (s) => s.id,
      ),
    ).toEqual(["reward", "settlement", "disclosures", "review"]);
  });

  it("puts the options step after the reward once that reward ships", () => {
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

  it("keeps the options step for a digital reward that carries a printed add-on", () => {
    const campaign = sungrid();
    const digital = tierIn(campaign, DIGITAL);
    const printed = tierIn(campaign, LANTERN).addOns.find(
      (addOn) => addOn.id === FIELD_GUIDE,
    );
    if (!printed) throw new Error("Expected the field-guide add-on");

    const withPrintedAddOn: Campaign = {
      ...campaign,
      supportTiers: [
        {
          ...digital,
          addOns: [printed],
          id: DIGITAL,
          shipping: tierIn(campaign, LANTERN).shipping,
        },
      ],
    };

    expect(
      visibleContributionSteps(
        draft({ tierId: DIGITAL }),
        withPrintedAddOn,
      ).map((s) => s.id),
    ).toContain("options");
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

describe("chosenDestination", () => {
  it("accepts a real country code in any case, and trims it", () => {
    expect(chosenDestination(draft({ destinationCountry: "gh" }))).toBe("GH");
    expect(chosenDestination(draft({ destinationCountry: " gb " }))).toBe("GB");
  });

  it("refuses anything that is not a destination, so a query string cannot preset one", () => {
    expect(chosenDestination(draft())).toBeNull();
    expect(chosenDestination(draft({ destinationCountry: "ZZ" }))).toBeNull();
    expect(
      chosenDestination(draft({ destinationCountry: "<script>" })),
    ).toBeNull();
  });
});

describe("maxRewardQuantity and rewardQuantity", () => {
  it("treats a reward with no stated limit as a single unit", () => {
    expect(maxRewardQuantity(tierIn(sungrid(), DIGITAL))).toBe(1);
  });

  it("reads the creator's own limit", () => {
    expect(maxRewardQuantity(tierIn(sungrid(), LANTERN))).toBe(4);
  });

  it("clamps the requested quantity into the reward's own range", () => {
    const campaign = sungrid();

    expect(rewardQuantity(draft({ tierId: LANTERN }), campaign)).toBe(1);
    expect(
      rewardQuantity(draft({ quantity: 0, tierId: LANTERN }), campaign),
    ).toBe(1);
    expect(
      rewardQuantity(draft({ quantity: 99, tierId: LANTERN }), campaign),
    ).toBe(4);
    expect(
      rewardQuantity(draft({ quantity: 2.5, tierId: LANTERN }), campaign),
    ).toBe(2);
  });
});

describe("selectedAddOns", () => {
  it("keeps only the add-ons this reward offers, in the reward's own order", () => {
    const campaign = sungrid();
    const chosen = selectedAddOns(
      draft({
        addOnIds: [DATA_PACK, "not-an-add-on", FIELD_GUIDE],
        tierId: LANTERN,
      }),
      campaign,
    );

    expect(chosen.map((addOn) => addOn.id)).toEqual([FIELD_GUIDE, DATA_PACK]);
  });

  it("returns nothing when no reward is selected", () => {
    expect(
      selectedAddOns(draft({ addOnIds: [FIELD_GUIDE] }), sungrid()),
    ).toEqual([]);
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

  it("multiplies the reward amount by the quantity taken", () => {
    expect(
      contributionAmount(draft({ quantity: 3, tierId: LANTERN }), sungrid()),
    ).toEqual({ atomic: "45000", currency: "USD", decimals: 2 });
  });

  it("adds the chosen add-ons", () => {
    expect(
      contributionAmount(
        draft({ addOnIds: [FIELD_GUIDE, SECOND_LANTERN], tierId: LANTERN }),
        sungrid(),
      ),
    ).toEqual({ atomic: "29500", currency: "USD", decimals: 2 });
  });

  it("adds optional support on top of the reward", () => {
    expect(
      contributionAmount(
        draft({ supportInput: "20", tierId: LANTERN }),
        sungrid(),
      ),
    ).toEqual({ atomic: "17000", currency: "USD", decimals: 2 });
  });

  it("never includes postage, which is not escrowed", () => {
    const withPostage = contributionAmount(
      lanternDraft({ destinationCountry: "NG" }),
      sungrid(),
    );

    expect(withPostage).toEqual({
      atomic: "15000",
      currency: "USD",
      decimals: 2,
    });
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

describe("fulfilmentCharge", () => {
  it("requires nothing of a reward that does not ship", () => {
    expect(fulfilmentCharge(draft({ tierId: DIGITAL }), sungrid())).toEqual({
      kind: "not-required",
    });
    expect(fulfilmentCharge(draft(), sungrid())).toEqual({
      kind: "not-required",
    });
  });

  it("waits for a destination rather than pricing a default", () => {
    expect(fulfilmentCharge(lanternDraft(), sungrid())).toEqual({
      kind: "unchosen",
    });
  });

  it("quotes the creator's own rate for the destination", () => {
    expect(
      fulfilmentCharge(lanternDraft({ destinationCountry: "NG" }), sungrid()),
    ).toEqual({
      amount: { atomic: "800", currency: "USD", decimals: 2 },
      kind: "quoted",
    });
  });

  it("applies a per-item rate to the units posted", () => {
    // Europe is $22 per item, so two kits cost $44.
    expect(
      fulfilmentCharge(
        lanternDraft({ destinationCountry: "DE", quantity: 2 }),
        sungrid(),
      ),
    ).toEqual({
      amount: { atomic: "4400", currency: "USD", decimals: 2 },
      kind: "quoted",
    });
  });

  it("adds a parcel for an add-on that posts separately, and none for a digital one", () => {
    const campaign = sungrid();

    expect(
      fulfilmentCharge(
        lanternDraft({ addOnIds: [SECOND_LANTERN], destinationCountry: "DE" }),
        campaign,
      ),
    ).toEqual({
      amount: { atomic: "4400", currency: "USD", decimals: 2 },
      kind: "quoted",
    });

    expect(
      fulfilmentCharge(
        lanternDraft({ addOnIds: [DATA_PACK], destinationCountry: "DE" }),
        campaign,
      ),
    ).toEqual({
      amount: { atomic: "2200", currency: "USD", decimals: 2 },
      kind: "quoted",
    });
  });

  it("reports a refused destination as refused, with the creator's reason", () => {
    const outcome = fulfilmentCharge(
      lanternDraft({ destinationCountry: "BR" }),
      sungrid(),
    );

    expect(outcome.kind).toBe("unsupported");
    expect(outcome).toMatchObject({ cause: "excluded" });
  });

  it("reports a deferred destination as deferred rather than as a figure", () => {
    expect(
      fulfilmentCharge(lanternDraft({ destinationCountry: "JP" }), sungrid()),
    ).toMatchObject({ kind: "deferred" });
  });
});

describe("totalDue", () => {
  it("adds a quoted postage charge to the escrowed contribution", () => {
    expect(
      totalDue(lanternDraft({ destinationCountry: "NG" }), sungrid()),
    ).toEqual({ atomic: "15800", currency: "USD", decimals: 2 });
  });

  it("states no total while postage is unknown, refused, or unanswered", () => {
    const campaign = sungrid();

    expect(totalDue(lanternDraft(), campaign)).toBeNull();
    expect(
      totalDue(lanternDraft({ destinationCountry: "JP" }), campaign),
    ).toBeNull();
    expect(
      totalDue(lanternDraft({ destinationCountry: "BR" }), campaign),
    ).toBeNull();
  });

  it("is the contribution alone when nothing has to be posted", () => {
    expect(totalDue(draft({ tierId: DIGITAL }), sungrid())).toEqual({
      atomic: "1000",
      currency: "USD",
      decimals: 2,
    });
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

describe("validateContributionStep for the options and delivery step", () => {
  it("asks nothing when the reward has nothing to configure", () => {
    expect(
      validateContributionStep(
        draft({ tierId: DIGITAL }),
        sungrid(),
        "options",
      ),
    ).toEqual([]);
  });

  it("asks for every variant the creator added, under its own field", () => {
    const issues = validateContributionStep(
      draft({ tierId: LANTERN }),
      sungrid(),
      "options",
    );

    expect(issues.map((issue) => issue.field)).toEqual([
      `variants.${COLOUR}`,
      `variants.${PLUG}`,
      "destinationCountry",
    ]);
  });

  it("requires a destination for a posted reward", () => {
    const issues = validateContributionStep(
      lanternDraft(),
      sungrid(),
      "options",
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe("destinationCountry");
  });

  it("accepts a destination the creator's rules reach", () => {
    expect(
      validateContributionStep(
        lanternDraft({ destinationCountry: "GH" }),
        sungrid(),
        "options",
      ),
    ).toEqual([]);
  });

  it("accepts a destination whose postage the creator bills later", () => {
    expect(
      validateContributionStep(
        lanternDraft({ destinationCountry: "JP" }),
        sungrid(),
        "options",
      ),
    ).toEqual([]);
  });

  it("blocks a destination the creator refused, and says why", () => {
    const issues = validateContributionStep(
      lanternDraft({ destinationCountry: "BR" }),
      sungrid(),
      "options",
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe("destinationCountry");
    expect(issues[0]?.message).toContain("Brazil");
  });

  it("blocks a destination just outside the creator's coverage, and says what to do", () => {
    // The site fixture has no worldwide rule, so Kenya is covered only by the
    // partner zone and Portugal by nothing at all.
    const issues = validateContributionStep(
      draft({ destinationCountry: "PT", tierId: SITE }),
      sungrid(),
      "options",
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain("does not cover");
    expect(issues[0]?.message).toContain("Portugal");
  });

  it("refuses a quantity above the creator's limit", () => {
    const issues = validateContributionStep(
      lanternDraft({ destinationCountry: "GH", quantity: 99 }),
      sungrid(),
      "options",
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe("quantity");
  });
});

describe("routeAvailability", () => {
  it("offers both ways to pay, wallet first", () => {
    expect(routeAvailability(sungrid()).map((option) => option.route)).toEqual([
      "usdc-wallet",
      "fiat-on-ramp",
    ]);
  });

  it("offers the wallet route as available, because it needs no rate", () => {
    const [wallet] = routeAvailability(sungrid());

    expect(wallet).toMatchObject({ available: true, route: "usdc-wallet" });
  });

  it("offers the card route on a USDC-only campaign too, since the provider converts", () => {
    const card = routeAvailability(sungrid()).find(
      (option) => option.route === "fiat-on-ramp",
    );

    expect(card).toBeDefined();
    expect(card?.label).toBe("Card or bank transfer");
  });

  it("blocks the card route and says why, rather than hiding it or inventing a rate", () => {
    const card = routeAvailability(sungrid()).find(
      (option) => option.route === "fiat-on-ramp",
    );

    expect(card?.available).toBe(false);
    expect(card?.blockedReason).toContain("quote");
    expect(card?.blockedReason).toContain("provider");
  });

  it("mentions cNGN only where the campaign can settle in it", () => {
    const campaign = sungrid();
    const withCngn: Campaign = {
      ...campaign,
      funding: {
        ...campaign.funding,
        supportedSettlementAssets: ["USDC", "cNGN"],
      },
    };

    const plain = routeAvailability(campaign).find(
      (option) => option.route === "fiat-on-ramp",
    );
    const cngn = routeAvailability(withCngn).find(
      (option) => option.route === "fiat-on-ramp",
    );

    expect(plain?.description).not.toContain("cNGN");
    expect(cngn?.description).toContain("cNGN");
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

  it("refuses the card route while no provider is connected", () => {
    const issues = validateContributionStep(
      draft({ route: "fiat-on-ramp" }),
      sungrid(),
      "settlement",
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe("route");
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

  it("shows the quantity as an arithmetic line rather than a total only", () => {
    const line = quoteLines(
      draft({ quantity: 3, tierId: LANTERN }),
      sungrid(),
    ).find((entry) => entry.label === "Reward amount");

    expect(line?.value).toBe("$150 × 3");
  });

  it("says plainly when no reward is being taken", () => {
    const line = quoteLines(draft({ amountInput: "25" }), sungrid()).find(
      (entry) => entry.label === "Reward",
    );

    expect(line?.unknown).toBe(true);
    expect(line?.value).toContain("None");
  });

  it("lists each variant the creator asked for, marked unanswered until it is not", () => {
    const unanswered = quoteLines(draft({ tierId: LANTERN }), sungrid());
    const answered = quoteLines(lanternDraft(), sungrid());

    expect(
      unanswered.find((line) => line.label === "Lantern colour"),
    ).toMatchObject({ unknown: true, value: "Not chosen yet" });
    expect(
      answered.find((line) => line.label === "Lantern colour"),
    ).toMatchObject({ value: "Amber" });
  });

  it("lists only the add-ons the backer took", () => {
    const lines = quoteLines(
      draft({ addOnIds: [DATA_PACK], tierId: LANTERN }),
      sungrid(),
    );

    expect(
      lines.find((line) => line.label === "Site data pack (digital)"),
    ).toMatchObject({ value: "$10" });
    expect(lines.some((line) => line.label === "Signed field guide")).toBe(
      false,
    );
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
      withSupport.find((line) => line.label === "Contribution (escrowed)")
        ?.value,
    ).toBe("$170");
  });

  it("separates the escrowed contribution from the postage it collects", () => {
    const lines = quoteLines(
      lanternDraft({ destinationCountry: "NG" }),
      sungrid(),
    );

    expect(
      lines.find((line) => line.label === "Contribution (escrowed)"),
    ).toMatchObject({ value: "$150" });
    expect(lines.find((line) => line.label === "Shipping")).toMatchObject({
      value: "$8",
    });
    expect(lines.find((line) => line.label === "Total due")).toMatchObject({
      value: "$158",
    });
  });

  it("shows a deferred postage charge as pending, never as a figure", () => {
    const lines = quoteLines(
      lanternDraft({ destinationCountry: "JP" }),
      sungrid(),
    );

    expect(lines.find((line) => line.label === "Shipping")).toMatchObject({
      unknown: true,
    });
    expect(lines.find((line) => line.label === "Total due")).toMatchObject({
      unknown: true,
      value: "Pending — postage is not known yet",
    });
  });

  it("keeps a refused destination out of the total in words", () => {
    const lines = quoteLines(
      lanternDraft({ destinationCountry: "BR" }),
      sungrid(),
    );

    expect(lines.find((line) => line.label === "Shipping")).toMatchObject({
      unknown: true,
      value: "Not available to this destination",
    });
  });

  it("shows the destination and marks it unknown before one is chosen", () => {
    const chosen = quoteLines(
      lanternDraft({ destinationCountry: "Ghana" }),
      sungrid(),
    );
    const unchosen = quoteLines(lanternDraft(), sungrid());

    expect(chosen.find((line) => line.label === "Delivering to")).toMatchObject(
      {
        value: "Not chosen yet",
      },
    );
    expect(
      unchosen.find((line) => line.label === "Delivering to")?.unknown,
    ).toBe(true);
  });

  it("resolves a lower-case destination rather than showing it as unanswered", () => {
    const line = quoteLines(
      lanternDraft({ destinationCountry: "gh" }),
      sungrid(),
    ).find((entry) => entry.label === "Delivering to");

    expect(line).toMatchObject({ value: "Ghana" });
  });

  it("carries no shipping lines at all for a reward that does not ship", () => {
    const labels = quoteLines(draft({ tierId: DIGITAL }), sungrid()).map(
      (line) => line.label,
    );

    expect(labels).not.toContain("Delivering to");
    expect(labels).not.toContain("Shipping");
    expect(labels).toContain("Contribution (escrowed)");
  });

  it("names the funding asset, so the currency is never implied", () => {
    expect(
      quoteLines(draft({ amountInput: "25" }), sungrid()).find(
        (line) => line.label === "Funding asset",
      ),
    ).toMatchObject({ value: "USDC" });
  });

  it("states the wallet total and that no platform fee is charged to the backer", () => {
    const lines = quoteLines(
      draft({ route: "usdc-wallet", tierId: DIGITAL }),
      sungrid(),
    );

    expect(lines.find((line) => line.label === "Total due")).toMatchObject({
      value: "$10",
    });
    expect(
      lines.find((line) => line.label === "Platform fee")?.value,
    ).toContain("None charged to you");
  });

  it("withholds a total until a posted reward has a destination", () => {
    const line = quoteLines(
      draft({ route: "usdc-wallet", tierId: LANTERN }),
      sungrid(),
    ).find((entry) => entry.label === "Total due");

    expect(line).toMatchObject({
      unknown: true,
      value: "Pending — postage is not known yet",
    });
  });

  it("invents no figure on the card route, where the provider's quote is missing", () => {
    const lines = quoteLines(
      draft({ amountInput: "25", route: "fiat-on-ramp" }),
      sungrid(),
    );

    for (const label of [
      "Charge currency",
      "Exchange rate",
      "Provider fee",
      "Amount that settles",
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

  it("names the wallet and provider steps the real flow has to pass through", () => {
    expect(handoffStates).toContain("Wallet connection required");
    expect(handoffStates).toContain("Contribution awaiting confirmation");
  });
});

describe("add-on data", () => {
  it("marks only the add-ons that need their own parcel as affecting shipping", () => {
    const addOns: readonly RewardAddOn[] = tierIn(sungrid(), LANTERN).addOns;

    expect(
      addOns.filter((addOn) => addOn.affectsShipping).map((addOn) => addOn.id),
    ).toEqual([FIELD_GUIDE, SECOND_LANTERN]);
  });
});
