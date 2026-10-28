import { describe, expect, it } from "vitest";

import { findPreviewCampaignById } from "@/features/campaigns/content/preview-campaigns";
import { MAX_HERO_MEDIA } from "@/features/campaigns/lib/media";
import {
  campaignWizardSteps,
  createDraftMedia,
  createDraftMilestone,
  createDraftShippingRule,
  createDraftShippingZone,
  createDraftTier,
  draftFromCampaign,
  draftShipping,
  emptyCampaignDraft,
  parseLines,
  parseQuantityLimit,
  shippingCoverageNote,
  submissionPreconditions,
  tierNeedsShipping,
  toCampaignMedia,
  toSupportTiers,
  validateCampaignStep,
  type CampaignDraft,
  type DraftMedia,
  type DraftShippingRule,
  type DraftShippingZone,
  type DraftSupportTier,
} from "@/features/campaigns/lib/wizard";
import type { RewardAddOn } from "@/features/campaigns/types";

function draftWith(media: Partial<CampaignDraft>): CampaignDraft {
  return { ...emptyCampaignDraft, ...media };
}

function heroItem(overrides: Partial<DraftMedia> = {}): DraftMedia {
  return {
    alt: "",
    caption: "",
    id: "hero-1",
    kind: "image",
    posterInput: "",
    srcInput: "",
    ...overrides,
  };
}

describe("campaignWizardSteps", () => {
  it("places Media after the basics and rewards after the plan", () => {
    expect(campaignWizardSteps.map((step) => step.id)).toEqual([
      "basics",
      "media",
      "funding",
      "milestones",
      "rewards",
      "terms",
      "review",
    ]);
  });
});

describe("createDraftMedia", () => {
  it("starts empty, defaults to a photo, and gives every item its own id", () => {
    const photo = createDraftMedia();
    const video = createDraftMedia("video");

    expect(photo).toMatchObject({ alt: "", kind: "image", srcInput: "" });
    expect(video.kind).toBe("video");
    expect(photo.id).not.toBe(video.id);
  });
});

describe("validateCampaignStep for media", () => {
  it("accepts an empty gallery, because a campaign falls back to its cover", () => {
    expect(validateCampaignStep(emptyCampaignDraft, "media")).toEqual([]);
  });

  it("accepts a described photo and a described hosted video", () => {
    const draft = draftWith({
      heroMedia: [
        heroItem({
          alt: "A solar array beside a water tank",
          srcInput: "https://images.example.com/array.jpg",
        }),
        heroItem({
          alt: "A site walkthrough",
          id: "hero-2",
          kind: "video",
          srcInput: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        }),
      ],
    });

    expect(validateCampaignStep(draft, "media")).toEqual([]);
  });

  it("reports a source that cannot be played, under that item's field", () => {
    const draft = draftWith({
      heroMedia: [
        heroItem({
          alt: "A description long enough to pass",
          kind: "video",
          srcInput: "https://example.com/not-a-video",
        }),
      ],
    });

    const issues = validateCampaignStep(draft, "media");

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe("heroMedia.hero-1");
    expect(issues[0]?.message).toContain("YouTube");
  });

  it("requires a description long enough to be read aloud", () => {
    const draft = draftWith({
      heroMedia: [
        heroItem({
          alt: "Short",
          srcInput: "https://images.example.com/array.jpg",
        }),
      ],
    });

    const issues = validateCampaignStep(draft, "media");

    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain("screen reader");
  });

  it("rejects a poster that is not an image source", () => {
    const draft = draftWith({
      storyMedia: [
        heroItem({
          alt: "A site walkthrough",
          id: "story-1",
          kind: "video",
          posterInput: "javascript:alert(1)",
          srcInput: "https://vimeo.com/76979871",
        }),
      ],
    });

    const issues = validateCampaignStep(draft, "media");

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe("storyMedia.story-1");
    expect(issues[0]?.message).toContain("poster");
  });

  it("caps the gallery, reporting the limit against the list", () => {
    const draft = draftWith({
      heroMedia: Array.from({ length: MAX_HERO_MEDIA + 1 }, (_, index) =>
        heroItem({
          alt: `A described photo number ${index + 1}`,
          id: `hero-${index + 1}`,
          srcInput: "https://images.example.com/array.jpg",
        }),
      ),
    });

    const issues = validateCampaignStep(draft, "media");

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe("heroMedia");
  });
});

function plannedMilestone(percent: string, position: number) {
  return {
    ...createDraftMilestone(percent),
    deliverable: `Deliverable for milestone ${position}`,
    evidence: `Evidence for milestone ${position}`,
    title: `Milestone ${position}`,
  };
}

function planDraft(
  workingCapitalPercent: string,
  tranches: readonly string[],
): CampaignDraft {
  return {
    ...emptyCampaignDraft,
    milestones: tranches.map((percent, index) =>
      plannedMilestone(percent, index + 1),
    ),
    workingCapitalPercent,
  };
}

describe("validateCampaignStep for the milestone plan", () => {
  it("accepts a fixed 20% tranche and milestone weights that total 100%", () => {
    expect(
      validateCampaignStep(planDraft("20", ["50", "50"]), "milestones"),
    ).toEqual([]);
  });

  it("rejects a working-capital share other than the fixed 20%", () => {
    for (const workingCapitalPercent of ["19", "25"]) {
      const issues = validateCampaignStep(
        planDraft(workingCapitalPercent, ["50", "50"]),
        "milestones",
      );

      expect(issues).toHaveLength(1);
      expect(issues[0]?.field).toBe("workingCapitalPercent");
      expect(issues[0]?.message).toContain("fixed at 20%");
    }
  });

  it("requires a choice when nothing is selected", () => {
    const issues = validateCampaignStep(
      planDraft("", ["50", "50"]),
      "milestones",
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe("workingCapitalPercent");
    expect(issues[0]?.message).toContain("fixed at 20%");
  });

  it("refuses a plan that leaves part of the pool unallocated", () => {
    const issues = validateCampaignStep(
      planDraft("20", ["40", "30"]),
      "milestones",
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe("milestones");
    expect(issues[0]?.message).toContain("70%");
  });

  it("refuses weights above 100% of the post-tranche pool", () => {
    const issues = validateCampaignStep(
      planDraft("20", ["60", "50"]),
      "milestones",
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain("110%");
  });

  it("refuses a milestone with no tranche, because it would never release", () => {
    const issues = validateCampaignStep(
      planDraft("20", ["50", "0", "30"]),
      "milestones",
    );

    expect(
      issues.some((issue) => issue.message.includes("greater than zero")),
    ).toBe(true);
  });
});

describe("validateCampaignStep for terms", () => {
  function termsDraft(overrides: Partial<CampaignDraft> = {}): CampaignDraft {
    return {
      ...emptyCampaignDraft,
      eligibility: "Open to backers anywhere Inverge operates.",
      failurePlan: "The contribution becomes refundable in full.",
      risks:
        "Supplier lead times can move, so the plan dates the order rather than the delivery.",
      ...overrides,
    };
  }

  it("checks the disclosures and the objection window, not the plan allocation", () => {
    expect(validateCampaignStep(termsDraft(), "terms")).toEqual([]);
  });

  it("requires an objection window between 1 and 30 days", () => {
    const issues = validateCampaignStep(
      termsDraft({ objectionWindowDays: "0" }),
      "terms",
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe("objectionWindowDays");
  });
});

describe("toCampaignMedia", () => {
  it("keeps a valid photo and nulls a blank caption", () => {
    const media = toCampaignMedia([
      heroItem({
        alt: "A solar array beside a water tank",
        caption: "   ",
        srcInput: "/images/ideas/sungrid-community-power.jpg",
      }),
    ]);

    expect(media).toEqual([
      {
        alt: "A solar array beside a water tank",
        caption: null,
        id: "hero-1",
        kind: "image",
        src: "/images/ideas/sungrid-community-power.jpg",
      },
    ]);
  });

  it("keeps a hosted video with its poster and drops the source string", () => {
    const media = toCampaignMedia([
      heroItem({
        alt: "A site walkthrough",
        kind: "video",
        posterInput: "https://images.example.com/poster.jpg",
        srcInput: "https://youtu.be/dQw4w9WgXcQ",
      }),
    ]);

    expect(media).toEqual([
      {
        alt: "A site walkthrough",
        caption: null,
        id: "hero-1",
        kind: "video",
        poster: "https://images.example.com/poster.jpg",
        source: { kind: "youtube", videoId: "dQw4w9WgXcQ" },
      },
    ]);
  });

  it("drops an item with no description rather than publishing an undescribed photo", () => {
    const media = toCampaignMedia([
      heroItem({ srcInput: "https://images.example.com/array.jpg" }),
    ]);

    expect(media).toEqual([]);
  });

  it("drops an item whose source does not parse", () => {
    const media = toCampaignMedia([
      heroItem({
        alt: "A description long enough to pass",
        srcInput: "javascript:alert(1)",
      }),
    ]);

    expect(media).toEqual([]);
  });
});

describe("draftFromCampaign", () => {
  it("loads a campaign gallery back into editable draft items", () => {
    const campaign = findPreviewCampaignById("campaign-sungrid");
    if (!campaign) throw new Error("Expected the sungrid fixture");

    const draft = draftFromCampaign(campaign);

    expect(draft.heroMedia).toHaveLength(campaign.media.length);
    expect(draft.storyMedia).toHaveLength(campaign.story.media.length);
    expect(draft.heroMedia.map((item) => item.kind)).toEqual(
      campaign.media.map((item) => item.kind),
    );
    expect(toCampaignMedia(draft.heroMedia)).toEqual(campaign.media);
  });

  it("carries a file source through as its path", () => {
    const campaign = findPreviewCampaignById("campaign-sungrid");
    if (!campaign) throw new Error("Expected the sungrid fixture");

    const [first] = toCampaignMedia(
      draftFromCampaign({
        ...campaign,
        media: [
          {
            alt: "A clip of the site",
            caption: null,
            id: "clip",
            kind: "video",
            poster: null,
            source: { kind: "direct", src: "https://cdn.example.com/clip.mp4" },
          },
        ],
      }).heroMedia,
    );

    expect(first).toMatchObject({
      kind: "video",
      source: { kind: "direct", src: "https://cdn.example.com/clip.mp4" },
    });
  });

  it("round-trips the reward tiers, including type and destinations", () => {
    const campaign = findPreviewCampaignById("campaign-sungrid");
    if (!campaign) throw new Error("Expected the sungrid fixture");

    const reloaded = toSupportTiers(draftFromCampaign(campaign).supportTiers);

    expect(reloaded).toEqual(campaign.supportTiers);
  });
});

function reward(overrides: Partial<DraftSupportTier> = {}): DraftSupportTier {
  return { ...createDraftTier(), ...overrides };
}

/** A flat rate of $8, ordered per parcel, covering everywhere unless overridden. */
function flatRule(
  overrides: Partial<DraftShippingRule> = {},
): DraftShippingRule {
  return {
    ...createDraftShippingRule(),
    amountInput: "8",
    coverage: { kind: "worldwide" },
    ...overrides,
  };
}

function zone(overrides: Partial<DraftShippingZone> = {}): DraftShippingZone {
  return {
    ...createDraftShippingZone(),
    countries: ["GH"],
    name: "West Africa",
    ...overrides,
  };
}

const printedAddOn: RewardAddOn = {
  affectsShipping: true,
  description: "A printed booklet posted with the reward.",
  estimatedDelivery: null,
  fulfilment: "physical",
  id: "printed-booklet",
  image: null,
  price: { atomic: "500", currency: "USD", decimals: 2 },
  title: "Printed booklet",
};

/** A physical reward with a type, a price, and a name, ready for its rules. */
function printedReward(
  overrides: Partial<DraftSupportTier> = {},
): DraftSupportTier {
  return reward({
    description: "A printed project report posted to you.",
    fulfilment: "physical",
    minimumInput: "20",
    shippingOriginCountry: "NG",
    title: "Printed report",
    ...overrides,
  });
}

describe("createDraftTier", () => {
  it("starts blank, with no type chosen, and gives every reward its own id", () => {
    const first = createDraftTier();
    const second = createDraftTier();

    expect(first).toMatchObject({
      addOns: [],
      description: "",
      estimatedDelivery: "",
      fulfilment: "",
      imageInput: "",
      includesInput: "",
      minimumInput: "",
      quantityLimitInput: "",
      shippingCustoms: "",
      shippingOriginCountry: "",
      shippingRules: [],
      shippingTerms: "",
      shippingZones: [],
      title: "",
      variants: [],
    });
    expect(first.id).not.toBe(second.id);
  });
});

describe("validateCampaignStep for rewards", () => {
  it("accepts a campaign that offers no rewards, because tiers are optional", () => {
    expect(validateCampaignStep(emptyCampaignDraft, "rewards")).toEqual([]);
  });

  it("accepts a described digital reward with no destination", () => {
    const draft = draftWith({
      supportTiers: [
        reward({
          description: "A thank-you message and access to updates.",
          fulfilment: "digital",
          minimumInput: "10",
          title: "Supporter",
        }),
      ],
    });

    expect(validateCampaignStep(draft, "rewards")).toEqual([]);
  });

  it("requires a destination rule for a physical reward, and accepts one once given", () => {
    const printed = printedReward();

    const missing = validateCampaignStep(
      draftWith({ supportTiers: [printed] }),
      "rewards",
    );

    expect(missing).toHaveLength(1);
    expect(missing[0]?.field).toBe(`supportTiers.${printed.id}.shipping`);
    expect(missing[0]?.message).toContain("at least one destination rule");

    const complete = validateCampaignStep(
      draftWith({
        supportTiers: [
          {
            ...printed,
            shippingRules: [flatRule({ coverage: { kind: "origin" } })],
          },
        ],
      }),
      "rewards",
    );

    expect(complete).toEqual([]);
  });

  it("accepts a quantity limit that is a whole number of two or more", () => {
    expect(
      validateCampaignStep(
        draftWith({
          supportTiers: [
            reward({
              description: "A thank-you message.",
              fulfilment: "digital",
              minimumInput: "10",
              quantityLimitInput: "4",
              title: "Supporter",
            }),
          ],
        }),
        "rewards",
      ),
    ).toEqual([]);
  });

  it("accepts a blank quantity limit, and treats a stated one as a single unit", () => {
    expect(
      validateCampaignStep(
        draftWith({
          supportTiers: [
            reward({
              description: "A thank-you message.",
              fulfilment: "digital",
              minimumInput: "10",
              quantityLimitInput: "1",
              title: "Supporter",
            }),
          ],
        }),
        "rewards",
      ),
    ).toEqual([]);
  });

  it("reports a quantity limit that is not a whole number under its own field", () => {
    const tier = reward({
      description: "A thank-you message.",
      fulfilment: "digital",
      minimumInput: "10",
      quantityLimitInput: "2.5",
      title: "Supporter",
    });

    const issues = validateCampaignStep(
      draftWith({ supportTiers: [tier] }),
      "rewards",
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe(`supportTiers.${tier.id}.quantity`);
  });

  it("reports an implausible quantity limit rather than publishing it", () => {
    const issues = validateCampaignStep(
      draftWith({
        supportTiers: [
          reward({
            description: "A thank-you message.",
            fulfilment: "digital",
            minimumInput: "10",
            quantityLimitInput: "1000",
            title: "Supporter",
          }),
        ],
      }),
      "rewards",
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain("under 1000");
  });

  it("requires a destination for a mixed reward too, because part of it ships", () => {
    const issues = validateCampaignStep(
      draftWith({
        supportTiers: [
          reward({
            description: "A download plus a printed poster.",
            fulfilment: "mixed",
            minimumInput: "35",
            title: "Poster and download",
          }),
        ],
      }),
      "rewards",
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain("ships");
  });

  it("reports a missing title, amount, description and type against the field that needs it", () => {
    const blank = reward();
    const issues = validateCampaignStep(
      draftWith({ supportTiers: [blank] }),
      "rewards",
    );

    expect(issues.map((issue) => issue.field)).toEqual([
      `supportTiers.${blank.id}`,
      `supportTiers.${blank.id}.minimum`,
      `supportTiers.${blank.id}.description`,
      `supportTiers.${blank.id}.type`,
    ]);
  });

  it("refuses a reward image that is not a usable source", () => {
    const issues = validateCampaignStep(
      draftWith({
        supportTiers: [
          reward({
            description: "A thank-you message.",
            fulfilment: "digital",
            imageInput: "javascript:alert(1)",
            minimumInput: "10",
            title: "Supporter",
          }),
        ],
      }),
      "rewards",
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain("https");
  });
});

describe("parseQuantityLimit", () => {
  it("treats a blank field, and a stated one, as the single-unit default", () => {
    expect(parseQuantityLimit("")).toBeNull();
    expect(parseQuantityLimit("   ")).toBeNull();
    expect(parseQuantityLimit("1")).toBeNull();
  });

  it("reads a whole number of two or more, ignoring surrounding space", () => {
    expect(parseQuantityLimit(" 4 ")).toBe(4);
  });

  it("refuses anything that is not a whole number of at least one", () => {
    expect(parseQuantityLimit("0")).toBeNull();
    expect(parseQuantityLimit("-3")).toBeNull();
    expect(parseQuantityLimit("2.5")).toBeNull();
    expect(parseQuantityLimit("many")).toBeNull();
  });
});

describe("parseLines", () => {
  it("keeps the creator's order, drops blanks, and trims each line", () => {
    expect(parseLines("One\n\n  Two  \nThree\n")).toEqual([
      "One",
      "Two",
      "Three",
    ]);
  });

  it("returns nothing for blank input", () => {
    expect(parseLines("   \n  \n")).toEqual([]);
  });
});

describe("tierNeedsShipping", () => {
  it("is false for a digital reward with nothing posted", () => {
    expect(tierNeedsShipping(reward({ fulfilment: "digital" }))).toBe(false);
  });

  it("is false before the creator has chosen a type", () => {
    expect(tierNeedsShipping(reward())).toBe(false);
  });

  it("is true for a physical reward", () => {
    expect(tierNeedsShipping(reward({ fulfilment: "physical" }))).toBe(true);
  });

  it("is true for a digital reward carrying a printed add-on, which still posts", () => {
    expect(
      tierNeedsShipping(
        reward({ addOns: [printedAddOn], fulfilment: "digital" }),
      ),
    ).toBe(true);
  });
});

describe("draftShipping", () => {
  it("stays null when nothing has to be posted, whatever rules were typed", () => {
    expect(
      draftShipping(
        reward({ fulfilment: "digital", shippingRules: [flatRule()] }),
      ),
    ).toBeNull();
  });

  it("drops a half-filled rule rather than publishing a destination with no meaning", () => {
    const shipping = draftShipping(
      printedReward({
        shippingRules: [
          flatRule({ amountInput: "" }),
          flatRule({ coverage: { country: "", kind: "country" } }),
          flatRule({ coverage: { kind: "worldwide" } }),
        ],
      }),
    );

    expect(shipping?.rules).toHaveLength(1);
    expect(shipping?.rules[0]?.coverage).toEqual({ kind: "worldwide" });
  });

  it("drops a rule pointing at a zone the draft no longer keeps", () => {
    const shipping = draftShipping(
      printedReward({
        shippingRules: [
          flatRule({ coverage: { kind: "zone", zoneId: "deleted" } }),
        ],
      }),
    );

    expect(shipping?.rules).toEqual([]);
  });

  it("keeps a zone with its members, and a refusal with the creator's reason", () => {
    const westAfrica = zone();
    const shipping = draftShipping(
      printedReward({
        shippingCustoms: "Duty is the recipient's to pay.",
        shippingRules: [
          flatRule({
            coverage: { kind: "zone", zoneId: westAfrica.id },
          }),
          flatRule({
            coverage: { country: "BR", kind: "country" },
            note: "Two parcels were returned.",
            rateKind: "unavailable",
          }),
        ],
        shippingTerms: "Posted from Lagos.",
        shippingZones: [westAfrica],
      }),
    );

    expect(shipping).toMatchObject({
      customs: "Duty is the recipient's to pay.",
      originCountry: "NG",
      terms: "Posted from Lagos.",
      zones: [{ countries: ["GH"], id: westAfrica.id, name: "West Africa" }],
    });
    expect(shipping?.rules).toHaveLength(2);
    expect(shipping?.rules[1]?.rate).toEqual({
      kind: "unavailable",
      note: "Two parcels were returned.",
    });
  });
});

describe("validateCampaignStep for shipping rules", () => {
  function withRules(...rules: DraftShippingRule[]): CampaignDraft {
    return draftWith({
      supportTiers: [printedReward({ shippingRules: rules })],
    });
  }

  it("accepts an exclusion written above a rule that covers everywhere", () => {
    const exclusion = flatRule({
      coverage: { country: "BR", kind: "country" },
      rateKind: "unavailable",
    });

    expect(
      validateCampaignStep(withRules(exclusion, flatRule()), "rewards"),
    ).toEqual([]);
  });

  it("reports a rule below 'everywhere', because nothing can reach it", () => {
    const exclusion = flatRule({
      coverage: { country: "BR", kind: "country" },
      rateKind: "unavailable",
    });
    const draft = withRules(flatRule(), exclusion);
    const issues = validateCampaignStep(draft, "rewards");
    const tierId = draft.supportTiers[0]?.id ?? "";

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe(
      `supportTiers.${tierId}.rules.${exclusion.id}`,
    );
    expect(issues[0]?.message).toContain("can never apply");
  });

  it("reports a custom zone with no name, under that zone", () => {
    const unnamed = zone({ name: "" });
    const draft = draftWith({
      supportTiers: [
        printedReward({
          shippingRules: [flatRule()],
          shippingZones: [unnamed],
        }),
      ],
    });
    const issues = validateCampaignStep(draft, "rewards");
    const tierId = draft.supportTiers[0]?.id ?? "";

    expect(issues).toHaveLength(1);
    expect(issues[0]?.field).toBe(`supportTiers.${tierId}.zones.${unnamed.id}`);
    expect(issues[0]?.message).toContain("needs a name");
  });

  it("reports a custom zone with no countries in it", () => {
    const empty = zone({ countries: [] });
    const draft = draftWith({
      supportTiers: [
        printedReward({
          shippingRules: [flatRule()],
          shippingZones: [empty],
        }),
      ],
    });
    const issues = validateCampaignStep(draft, "rewards");

    expect(issues[0]?.message).toContain("at least one country");
  });

  it("reports a rule with no flat rate", () => {
    const draft = withRules(flatRule({ amountInput: "" }));
    const issues = validateCampaignStep(draft, "rewards");

    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain("flat rate");
  });

  it("reports a rule covering the creator's own country when they have not said where that is", () => {
    const draft = draftWith({
      supportTiers: [
        printedReward({
          shippingOriginCountry: "",
          shippingRules: [flatRule({ coverage: { kind: "origin" } })],
        }),
      ],
    });

    const issues = validateCampaignStep(draft, "rewards");

    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain("say which country you post from");
  });
});

describe("shippingCoverageNote", () => {
  it("says nothing about a reward that does not post", () => {
    expect(shippingCoverageNote(reward({ fulfilment: "digital" }))).toBeNull();
  });

  it("says nothing while the creator has not written a rule yet", () => {
    expect(shippingCoverageNote(printedReward())).toBeNull();
  });

  it("warns when no rule reaches the rest of the world, without listing what is missing", () => {
    const note = shippingCoverageNote(
      printedReward({
        shippingRules: [
          flatRule({ coverage: { country: "GH", kind: "country" } }),
        ],
      }),
    );

    expect(note).toContain("No rule covers everywhere");
  });

  it("says nothing once a rule covers everywhere", () => {
    expect(
      shippingCoverageNote(printedReward({ shippingRules: [flatRule()] })),
    ).toBeNull();
  });
});

describe("toSupportTiers", () => {
  it("attaches shipping only when the reward includes something physical", () => {
    const westAfrica = zone();
    const [digital, mixed] = toSupportTiers([
      reward({
        description: "A download.",
        fulfilment: "digital",
        minimumInput: "10",
        shippingRules: [flatRule()],
        title: "Download",
      }),
      reward({
        description: "A download and a posted poster.",
        fulfilment: "mixed",
        minimumInput: "35",
        shippingCustoms: "Duty is the recipient's to pay.",
        shippingOriginCountry: "NG",
        shippingRules: [
          flatRule({ coverage: { kind: "zone", zoneId: westAfrica.id } }),
        ],
        shippingTerms: "Posted from Lagos after the handover milestone.",
        shippingZones: [westAfrica],
        title: "Poster and download",
      }),
    ]);

    expect(digital?.shipping).toBeNull();
    expect(mixed?.shipping).toEqual({
      customs: "Duty is the recipient's to pay.",
      originCountry: "NG",
      rules: [
        {
          coverage: { kind: "zone", zoneId: westAfrica.id },
          id: expect.any(String),
          rate: {
            amount: { atomic: "800", currency: "USD", decimals: 2 },
            basis: "order",
            kind: "flat",
          },
        },
      ],
      terms: "Posted from Lagos after the handover milestone.",
      zones: [{ countries: ["GH"], id: westAfrica.id, name: "West Africa" }],
    });
  });

  it("attaches shipping to an otherwise digital reward whose extra item posts", () => {
    const [tier] = toSupportTiers([
      reward({
        addOns: [printedAddOn],
        description: "A download, with a printed booklet as an extra.",
        fulfilment: "digital",
        minimumInput: "10",
        shippingRules: [flatRule()],
        title: "Download and booklet",
      }),
    ]);

    expect(tier?.shipping?.rules).toHaveLength(1);
  });

  it("carries the creator's own includes and quantity limit through", () => {
    const [tier] = toSupportTiers([
      reward({
        description: "A printed report.",
        fulfilment: "digital",
        includesInput: "A signed cover\n\n  A site photograph  \n",
        minimumInput: "20",
        quantityLimitInput: "3",
        title: "Report",
      }),
    ]);

    expect(tier?.includes).toEqual(["A signed cover", "A site photograph"]);
    expect(tier?.quantityLimit).toBe(3);
  });

  it("nulls an unusable image rather than pointing the page at it", () => {
    const [tier] = toSupportTiers([
      reward({
        description: "A thank-you message.",
        fulfilment: "digital",
        imageInput: "javascript:alert(1)",
        minimumInput: "10",
        title: "Supporter",
      }),
    ]);

    expect(tier?.image).toBeNull();
  });

  it("keeps a hosted reward image", () => {
    const [tier] = toSupportTiers([
      reward({
        description: "A printed report.",
        fulfilment: "digital",
        imageInput: "https://images.example.com/report.jpg",
        minimumInput: "20",
        title: "Report",
      }),
    ]);

    expect(tier?.image).toBe("https://images.example.com/report.jpg");
  });

  it("drops a reward with no title or no readable amount", () => {
    expect(
      toSupportTiers([
        reward({ description: "No title.", minimumInput: "10" }),
        reward({ description: "No amount.", title: "Untitled" }),
      ]),
    ).toEqual([]);
  });
});

describe("submissionPreconditions", () => {
  it("reports an unreadable gate as outstanding rather than satisfied", () => {
    // #given no server gate was available
    // #when the review step computes its preconditions
    const preconditions = submissionPreconditions();

    // #then identity is not claimed as verified
    expect(preconditions.map((item) => [item.id, item.met])).toEqual([
      ["kyc", false],
      ["application-fee", false],
    ]);
    expect(preconditions[0]?.code).toBeUndefined();
  });

  it("carries the API's stable code and blockers when verification is outstanding", () => {
    // #given the API refused the gate
    const gate = {
      blockers: ["Creator: identity verification is pending"],
      code: "VERIFICATION_REQUIRED",
      eligible: false,
    };

    // #when the review step computes its preconditions
    const [identity] = submissionPreconditions(gate);

    // #then the refusal is repeated verbatim with its code
    expect(identity?.met).toBe(false);
    expect(identity?.code).toBe("VERIFICATION_REQUIRED");
    expect(identity?.description).toBe(
      "Creator: identity verification is pending",
    );
  });

  it("marks identity done but never invents the application fee", () => {
    // #given the API says the creator is verified
    const [identity, fee] = submissionPreconditions({
      blockers: [],
      code: null,
      eligible: true,
    });

    // #then only the fee remains outstanding
    expect(identity?.met).toBe(true);
    expect(identity?.code).toBeUndefined();
    expect(fee?.met).toBe(false);
  });

  it("marks the fee done only when the API says the charge succeeded", () => {
    // #given a verified creator with a successful application-fee charge
    const [identity, fee] = submissionPreconditions(
      { blockers: [], code: null, eligible: true },
      {
        amount: 10000,
        chargeId: "fee_1",
        currency: "NGN",
        redirectUrl: null,
        status: "SUCCEEDED",
      },
    );

    // #then both gates are satisfied
    expect(identity?.met).toBe(true);
    expect(fee?.met).toBe(true);
    expect(fee?.description).toContain("paid and linked");
  });

  it("keeps a pending or failed payment outstanding", () => {
    for (const status of ["PENDING", "FAILED", "NONE"] as const) {
      const [, fee] = submissionPreconditions(null, {
        amount: 10000,
        chargeId: status === "NONE" ? null : "fee_1",
        currency: "NGN",
        redirectUrl: null,
        status,
      });

      expect(fee?.met).toBe(false);
      expect(fee?.description).not.toContain("paid and linked");
    }
  });
});
