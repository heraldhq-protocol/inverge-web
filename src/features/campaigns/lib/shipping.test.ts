import { describe, expect, it } from "vitest";

import { findPreviewCampaignById } from "@/features/campaigns/content/preview-campaigns";
import {
  describeCoverage,
  describeRate,
  destinationName,
  destinationSupported,
  hasPhysicalPart,
  resolveShipping,
  resolveShippingRule,
  shippedUnits,
  shippingIsEntirelyDeferred,
  shippingSummary,
} from "@/features/campaigns/lib/shipping";
import type {
  RewardAddOn,
  RewardShipping,
  SupportTier,
} from "@/features/campaigns/types";
import type { MoneyAmount } from "@/lib/money";

/**
 * The rule engine's contract.
 *
 * The tests are written around the two failures the model exists to prevent: a
 * destination that is priced when the creator refused it, and a destination that
 * is priced from a figure nobody published. So the exclusion cases and the
 * "no number is available" cases are each asserted on their own shape rather
 * than as strings that happen to look right.
 */

function amount(atomic: string): MoneyAmount {
  return { atomic, currency: "USD", decimals: 2 };
}

function policy(overrides: Partial<RewardShipping> = {}): RewardShipping {
  return {
    customs: null,
    originCountry: "NG",
    rules: [],
    terms: null,
    zones: [],
    ...overrides,
  };
}

function tier(overrides: Partial<SupportTier> = {}): SupportTier {
  return {
    addOns: [],
    description: "A reward.",
    estimatedDelivery: null,
    fulfilment: "physical",
    id: "tier",
    image: null,
    includes: [],
    minimum: amount("1000"),
    quantityLimit: null,
    shipping: null,
    title: "Reward",
    variants: [],
    ...overrides,
  };
}

function addOn(overrides: Partial<RewardAddOn> = {}): RewardAddOn {
  return {
    affectsShipping: false,
    description: "An extra.",
    estimatedDelivery: null,
    fulfilment: "digital",
    id: "addon",
    image: null,
    price: amount("500"),
    title: "Add-on",
    ...overrides,
  };
}

/** The published fixture's own policy, so the real numbers are exercised. */
function lanternShipping(): RewardShipping {
  const campaign = findPreviewCampaignById("campaign-sungrid");
  const found = campaign?.supportTiers.find(
    (candidate) => candidate.id === "sungrid-tier-lantern",
  );

  if (!found?.shipping) {
    throw new Error("Expected the lantern fixture to carry a shipping policy");
  }

  return found.shipping;
}

describe("hasPhysicalPart", () => {
  it("is true only where something has to be posted", () => {
    expect(hasPhysicalPart("physical")).toBe(true);
    expect(hasPhysicalPart("mixed")).toBe(true);
    expect(hasPhysicalPart("digital")).toBe(false);
    expect(hasPhysicalPart(null)).toBe(false);
  });
});

describe("resolveShipping", () => {
  it("requires nothing when the reward has no policy", () => {
    expect(resolveShipping(null, "NG", 1)).toEqual({ kind: "not-required" });
  });

  it("waits for a destination rather than assuming one", () => {
    expect(resolveShipping(policy(), null, 1)).toEqual({ kind: "unchosen" });
  });

  it("reports a destination no rule reaches", () => {
    const shipping = policy({
      rules: [
        {
          coverage: { country: "GH", kind: "country" },
          id: "ghana",
          rate: { kind: "free" },
        },
      ],
    });

    expect(resolveShipping(shipping, "KE", 1)).toEqual({
      cause: "not-covered",
      kind: "unsupported",
      note: null,
    });
  });

  it("reports a refusal with the creator's own reason, not as a price", () => {
    const shipping = policy({
      rules: [
        {
          coverage: { country: "BR", kind: "country" },
          id: "brazil",
          rate: {
            kind: "unavailable",
            note: "Customs returned two parcels there.",
          },
        },
      ],
    });

    expect(resolveShipping(shipping, "BR", 1)).toEqual({
      cause: "excluded",
      kind: "unsupported",
      note: "Customs returned two parcels there.",
    });
  });
});

describe("rule order", () => {
  it("lets the first match win, so an exception above 'everywhere' excludes", () => {
    const shipping = policy({
      rules: [
        {
          coverage: { country: "BR", kind: "country" },
          id: "brazil",
          rate: { kind: "unavailable", note: "Not offering it." },
        },
        {
          coverage: { kind: "worldwide" },
          id: "worldwide",
          rate: { kind: "free" },
        },
      ],
    });

    expect(resolveShipping(shipping, "BR", 1)).toEqual({
      cause: "excluded",
      kind: "unsupported",
      note: "Not offering it.",
    });
    expect(resolveShipping(shipping, "GB", 1)).toEqual({ kind: "free" });
  });

  it("cannot reach a rule written below one that covers everywhere", () => {
    const shipping = policy({
      rules: [
        {
          coverage: { kind: "worldwide" },
          id: "worldwide",
          rate: { kind: "free" },
        },
        {
          coverage: { country: "BR", kind: "country" },
          id: "brazil",
          rate: { kind: "unavailable", note: "Too late to apply." },
        },
      ],
    });

    expect(resolveShippingRule(shipping, "BR")?.id).toBe("worldwide");
  });
});

describe("coverage", () => {
  it("matches the creator's own country only when they said where they post from", () => {
    const rules = [
      {
        coverage: { kind: "origin" },
        id: "origin",
        rate: { kind: "free" },
      },
    ] as const;

    expect(resolveShipping(policy({ rules }), "NG", 1)).toEqual({
      kind: "free",
    });
    expect(
      resolveShipping(policy({ originCountry: null, rules }), "NG", 1),
    ).toEqual({ cause: "not-covered", kind: "unsupported", note: null });
  });

  it("matches a zone's own countries and nothing else", () => {
    const shipping = policy({
      rules: [
        {
          coverage: { kind: "zone", zoneId: "west-africa" },
          id: "west-africa",
          rate: { kind: "free" },
        },
      ],
      zones: [{ countries: ["GH"], id: "west-africa", name: "West Africa" }],
    });

    expect(resolveShipping(shipping, "GH", 1)).toEqual({ kind: "free" });
    expect(resolveShipping(shipping, "NG", 1)).toEqual({
      cause: "not-covered",
      kind: "unsupported",
      note: null,
    });
  });

  it("matches nothing when a rule points at a zone that no longer exists", () => {
    const shipping = policy({
      rules: [
        {
          coverage: { kind: "zone", zoneId: "deleted" },
          id: "stale",
          rate: { kind: "free" },
        },
      ],
    });

    expect(resolveShipping(shipping, "GH", 1)).toEqual({
      cause: "not-covered",
      kind: "unsupported",
      note: null,
    });
  });
});

describe("shippedUnits", () => {
  it("counts one parcel for each copy of a posted reward", () => {
    expect(shippedUnits(tier(), 3, [])).toBe(3);
  });

  it("counts nothing for a reward that posts nothing", () => {
    expect(shippedUnits(tier({ fulfilment: "digital" }), 3, [])).toBe(0);
  });

  it("adds no parcel for a digital add-on", () => {
    const dataPack = addOn({ affectsShipping: false, id: "data" });

    expect(shippedUnits(tier({ addOns: [dataPack] }), 1, ["data"])).toBe(1);
  });

  it("adds a parcel for an add-on the creator said posts separately", () => {
    const guide = addOn({
      affectsShipping: true,
      fulfilment: "physical",
      id: "guide",
    });

    expect(shippedUnits(tier({ addOns: [guide] }), 1, ["guide"])).toBe(2);
  });

  it("ignores an add-on the backer did not take", () => {
    const guide = addOn({
      affectsShipping: true,
      fulfilment: "physical",
      id: "guide",
    });

    expect(shippedUnits(tier({ addOns: [guide] }), 1, [])).toBe(1);
  });
});

describe("rate models", () => {
  const worldwide = (rate: RewardShipping["rules"][number]["rate"]) =>
    policy({
      rules: [{ coverage: { kind: "worldwide" }, id: "worldwide", rate }],
    });

  it("charges a per-order rate once, however many items are posted", () => {
    const shipping = worldwide({
      amount: amount("1500"),
      basis: "order",
      kind: "flat",
    });

    expect(resolveShipping(shipping, "GH", 4)).toEqual({
      amount: amount("1500"),
      kind: "quoted",
    });
  });

  it("multiplies a per-item rate by the items posted", () => {
    const shipping = worldwide({
      amount: amount("2200"),
      basis: "unit",
      kind: "flat",
    });

    expect(resolveShipping(shipping, "DE", 4)).toEqual({
      amount: amount("8800"),
      kind: "quoted",
    });
  });

  it("is free, rather than a zero the backer is charged", () => {
    expect(resolveShipping(worldwide({ kind: "free" }), "NG", 2)).toEqual({
      kind: "free",
    });
  });

  it("says postage is not known yet, in the creator's words, rather than a figure", () => {
    const outcome = resolveShipping(
      worldwide({ kind: "deferred", note: "A courier quote is coming." }),
      "GH",
      1,
    );

    expect(outcome).toEqual({
      kind: "deferred",
      note: "A courier quote is coming.",
    });
  });
});

describe("the published fixture's policy", () => {
  it("prices each destination the creator named, at the basis they chose", () => {
    const shipping = lanternShipping();

    // Inside Nigeria and West Africa are per order; Europe and North America are
    // per item, so the same quantity produces different totals.
    expect(resolveShipping(shipping, "NG", 2)).toEqual({
      amount: amount("800"),
      kind: "quoted",
    });
    expect(resolveShipping(shipping, "GH", 2)).toEqual({
      amount: amount("1500"),
      kind: "quoted",
    });
    expect(resolveShipping(shipping, "DE", 2)).toEqual({
      amount: amount("4400"),
      kind: "quoted",
    });
    expect(resolveShipping(shipping, "US", 1)).toEqual({
      amount: amount("2400"),
      kind: "quoted",
    });
  });

  it("refuses Brazil, and defers every destination the zones do not reach", () => {
    const shipping = lanternShipping();

    expect(resolveShipping(shipping, "BR", 1)).toMatchObject({
      cause: "excluded",
      kind: "unsupported",
    });
    expect(resolveShipping(shipping, "JP", 1)).toMatchObject({
      kind: "deferred",
    });
  });

  it("is not entirely deferred, because most of its destinations carry a rate", () => {
    expect(shippingIsEntirelyDeferred(lanternShipping())).toBe(false);
  });
});

describe("destinationSupported", () => {
  it("is true when nothing has to be posted at all", () => {
    expect(destinationSupported(null, null)).toBe(true);
  });

  it("is false before a destination is chosen", () => {
    expect(destinationSupported(policy(), null)).toBe(false);
  });

  it("is false for a destination no rule reaches, and for a refusal", () => {
    const shipping = policy({
      rules: [
        {
          coverage: { kind: "worldwide" },
          id: "worldwide",
          rate: { kind: "free" },
        },
      ],
    });

    expect(destinationSupported(shipping, "BR")).toBe(true);
    expect(destinationSupported(policy(), "BR")).toBe(false);
  });
});

describe("describeCoverage and describeRate", () => {
  const shipping = policy({
    zones: [{ countries: ["GH"], id: "west-africa", name: "West Africa" }],
  });

  it("names a rule's coverage in the backer's own terms", () => {
    expect(describeCoverage({ kind: "worldwide" }, shipping)).toBe(
      "Everywhere",
    );
    expect(describeCoverage({ country: "GB", kind: "country" }, shipping)).toBe(
      "United Kingdom",
    );
    expect(describeCoverage({ kind: "origin" }, shipping)).toBe(
      "Inside Nigeria",
    );
    expect(
      describeCoverage({ kind: "zone", zoneId: "west-africa" }, shipping),
    ).toBe("West Africa");
  });

  it("names a deleted zone and a missing origin rather than leaving a blank", () => {
    expect(
      describeCoverage({ kind: "zone", zoneId: "deleted" }, shipping),
    ).toBe("A zone that no longer exists");
    expect(
      describeCoverage({ kind: "origin" }, policy({ originCountry: null })),
    ).toBe("Inside your country");
  });

  it("states a price model without turning it into a figure it is not", () => {
    expect(describeRate({ kind: "free" })).toBe("Free");
    expect(
      describeRate({ amount: amount("800"), basis: "order", kind: "flat" }),
    ).toBe("$8 per order");
    expect(
      describeRate({ amount: amount("2200"), basis: "unit", kind: "flat" }),
    ).toBe("$22 per item");
    expect(describeRate({ kind: "deferred", note: null })).toBe(
      "Postage billed later",
    );
    expect(describeRate({ kind: "unavailable", note: null })).toBe(
      "We cannot ship here",
    );
  });
});

describe("shippingSummary", () => {
  it("keeps the creator's own order and marks the refusal as an exclusion", () => {
    const summary = shippingSummary(lanternShipping());

    expect(summary.map((entry) => entry.coverage)).toEqual([
      "Inside Nigeria",
      "West Africa",
      "Europe",
      "North America",
      "Brazil",
      "Everywhere",
    ]);
    expect(summary.filter((entry) => entry.excluded)).toHaveLength(1);
    expect(summary.find((entry) => entry.coverage === "Brazil")?.excluded).toBe(
      true,
    );
  });
});

describe("destinationName", () => {
  it("resolves a stored code to the country's name", () => {
    expect(destinationName("GB")).toBe("United Kingdom");
    expect(destinationName("NG")).toBe("Nigeria");
  });
});

describe("shippingIsEntirelyDeferred", () => {
  it("is true only when every rule defers the cost", () => {
    const deferredOnly = policy({
      rules: [
        {
          coverage: { kind: "worldwide" },
          id: "worldwide",
          rate: { kind: "deferred", note: null },
        },
      ],
    });
    const mostlyPriced = policy({
      rules: [
        {
          coverage: { kind: "worldwide" },
          id: "worldwide",
          rate: { kind: "deferred", note: null },
        },
        {
          coverage: { country: "GH", kind: "country" },
          id: "ghana",
          rate: { kind: "free" },
        },
      ],
    });

    expect(shippingIsEntirelyDeferred(deferredOnly)).toBe(true);
    expect(shippingIsEntirelyDeferred(mostlyPriced)).toBe(false);
    expect(shippingIsEntirelyDeferred(policy())).toBe(false);
  });
});
