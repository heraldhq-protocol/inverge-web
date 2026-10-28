import { describe, expect, it } from "vitest";

import {
  dateInputToIso,
  draftFromApiDraft,
  readSavedDraft,
  toCreateDraftPayload,
} from "@/features/campaigns/lib/draft-api";
import { campaignCategories } from "@/features/campaigns/lib/taxonomy";
import {
  createDraftMedia,
  createDraftTier,
  emptyCampaignDraft,
  type CampaignDraft,
} from "@/features/campaigns/lib/wizard";

const category = campaignCategories[0]!;

function completeDraft(overrides: Partial<CampaignDraft> = {}): CampaignDraft {
  return {
    ...emptyCampaignDraft,
    beneficiaries: "Smallholder farmers around Lagos",
    category: category.slug,
    deadline: "2099-01-01",
    heroMedia: [
      {
        ...createDraftMedia("image"),
        alt: "A solar panel beside a cold room",
        caption: "The pilot site",
        srcInput: "https://images.example.com/cold-room.jpg",
      },
    ],
    location: "Lagos, Nigeria",
    milestones: [
      {
        allocationPercent: "50",
        deliverable: "Install the first cold room",
        evidence: "Signed installation report from the engineer",
        expectedAt: "2099-02-01",
        id: "m1",
        title: "Pilot",
      },
      {
        allocationPercent: "50",
        deliverable: "Publish the audited operating report",
        evidence: "Audited report published on the campaign page",
        expectedAt: "2099-03-01",
        id: "m2",
        title: "Report",
      },
    ],
    objectionWindowDays: "7",
    problem:
      "Produce spoils before it reaches the market, which destroys farmer income.",
    solution:
      "Solar-powered cold rooms close to the farms, paid for per use by the cooperative.",
    subcategory: category.subcategories[0]?.slug ?? "",
    summary:
      "A solar cold-chain pilot that cuts post-harvest losses for farmers.",
    supportTiers: [
      {
        ...createDraftTier(),
        description: "A thank-you note and a photo from the pilot site.",
        fulfilment: "digital",
        includesInput: "A thank-you note\nA photo from the site",
        minimumInput: "10",
        title: "Supporter",
      },
    ],
    targetInput: "5000.00",
    title: "Solar cold chain",
    useOfFunds: [
      { amountInput: "3000", id: "u1", label: "Cold room equipment" },
      { amountInput: "2000", id: "u2", label: "Installation and training" },
    ],
    workingCapitalPercent: "20",
    ...overrides,
  };
}

describe("toCreateDraftPayload", () => {
  it("maps a complete draft onto the API's create shape", () => {
    // #given a complete plan
    const result = toCreateDraftPayload(completeDraft());

    // #when mapped
    // #then every authored field is normalised, dates are absolute instants
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.payload).toMatchObject({
      beneficiaries: "Smallholder farmers around Lagos",
      category: category.slug,
      deadline: "2099-01-01T00:00:00.000Z",
      location: "Lagos, Nigeria",
      objectionWindowDays: 7,
      targetAmount: "5000",
      tokenType: "USDC",
      title: "Solar cold chain",
      workingCapitalPercent: "20",
    });
    expect(result.payload.milestones).toEqual([
      {
        allocationPercent: "50",
        deliverable: "Install the first cold room",
        evidence: "Signed installation report from the engineer",
        expectedAt: "2099-02-01T00:00:00.000Z",
        title: "Pilot",
      },
      {
        allocationPercent: "50",
        deliverable: "Publish the audited operating report",
        evidence: "Audited report published on the campaign page",
        expectedAt: "2099-03-01T00:00:00.000Z",
        title: "Report",
      },
    ]);
    expect(result.payload.useOfFunds).toEqual([
      { amount: "3000", label: "Cold room equipment" },
      { amount: "2000", label: "Installation and training" },
    ]);
  });

  it("keeps fractional money exact", () => {
    // #given an amount with cents
    const draft = completeDraft({
      targetInput: "5000.50",
      useOfFunds: [
        { amountInput: "3000.25", id: "u1", label: "Equipment" },
        { amountInput: "2000.25", id: "u2", label: "Training" },
      ],
    });

    // #when mapped
    // #then cents are preserved rather than truncated
    const result = toCreateDraftPayload(draft);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.payload.targetAmount).toBe("5000.5");
    expect(result.payload.useOfFunds.map((line) => line.amount)).toEqual([
      "3000.25",
      "2000.25",
    ]);
  });

  it("maps media only when it parses and has alt text", () => {
    // #given one valid image, one invalid source, and one missing alt
    const draft = completeDraft({
      heroMedia: [
        {
          ...createDraftMedia("image"),
          alt: "A cold room",
          srcInput: "https://images.example.com/a.jpg",
        },
        {
          ...createDraftMedia("image"),
          alt: "Broken",
          srcInput: "javascript:alert(1)",
        },
        {
          ...createDraftMedia("image"),
          alt: "",
          srcInput: "https://images.example.com/b.jpg",
        },
      ],
    });

    // #when mapped
    // #then only the usable item survives
    const result = toCreateDraftPayload(draft);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.heroMedia).toEqual([
      {
        alt: "A cold room",
        caption: undefined,
        kind: "image",
        src: "https://images.example.com/a.jpg",
      },
    ]);
  });

  it("refuses to invent a target or a deadline", () => {
    // #given a draft with no target and no deadline
    const result = toCreateDraftPayload(
      completeDraft({ deadline: "", targetInput: "" }),
    );

    // #when mapped
    // #then it reports the fields instead of posting placeholder money
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((issue) => issue.field)).toEqual(
      expect.arrayContaining(["targetInput", "deadline"]),
    );
  });

  it("refuses milestone weights that do not total 100% of the pool", () => {
    // #given weights that leave part of the post-tranche pool unallocated
    const draft = completeDraft({
      milestones: completeDraft().milestones.map((milestone, index) => ({
        ...milestone,
        allocationPercent: index === 0 ? "40" : "30",
      })),
    });

    // #when mapped
    // #then the server's invariant is enforced before a request
    const result = toCreateDraftPayload(draft);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(
      result.issues.some((issue) => issue.message.includes("total 100%")),
    ).toBe(true);
  });

  it("refuses a working-capital value other than the fixed 20%", () => {
    for (const workingCapitalPercent of ["19", "25"]) {
      const result = toCreateDraftPayload(
        completeDraft({ workingCapitalPercent }),
      );

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.issues.map((issue) => issue.field)).toContain(
        "workingCapitalPercent",
      );
      expect(
        result.issues.some((issue) => issue.message.includes("fixed at 20%")),
      ).toBe(true);
    }
  });
});

describe("dateInputToIso", () => {
  it("pins a calendar date to UTC midnight", () => {
    expect(dateInputToIso("2099-01-01")).toBe("2099-01-01T00:00:00.000Z");
  });

  it("returns null for an unreadable or empty date", () => {
    expect(dateInputToIso("")).toBeNull();
    expect(dateInputToIso("not-a-date")).toBeNull();
  });
});

describe("readSavedDraft", () => {
  const response = {
    category: "art",
    deadline: "2099-01-01T00:00:00.000Z",
    id: "cmp_1",
    milestones: [
      {
        allocationPercent: "40.00",
        deliverable: "Install",
        evidence: "Report",
        expectedAt: "2099-02-01T00:00:00.000Z",
        id: "m1",
        index: 0,
        title: "Pilot",
      },
      {
        allocationPercent: "40.00",
        deliverable: "Publish",
        evidence: "Audit",
        expectedAt: "2099-03-01T00:00:00.000Z",
        id: "m2",
        index: 1,
        title: "Report",
      },
    ],
    objectionWindowDays: 7,
    readiness: { blockers: ["Needs one more thing"], ready: false },
    applicationFee: {
      amount: 10000,
      chargeId: "fee_1",
      currency: "NGN",
      redirectUrl: "https://checkout.example/fee_1",
      status: "PENDING",
    },
    rewardTiers: [
      {
        ...createDraftTier(),
        description: "A note",
        fulfilment: "digital",
        includesInput: "A note",
        minimumInput: "10",
        title: "Supporter",
      },
    ],
    status: "DRAFT",
    story: {
      beneficiaries: "Farmers",
      eligibility: "Open to anyone",
      failurePlan: "Refund",
      heroMedia: [
        {
          alt: "A cold room",
          caption: "Site",
          id: "media-1",
          kind: "image",
          src: "https://images.example.com/a.jpg",
        },
      ],
      location: "Lagos",
      problem: "Spoilage",
      risks: "Weather",
      solution: "Cold rooms",
      storyMedia: [],
      useOfFunds: [{ amount: "5000.00", label: "Equipment" }],
    },
    subcategory: "ceramics",
    summary: "A summary",
    targetAmount: "5000.00",
    title: "Solar cold chain",
    tokenType: "USDC",
    updatedAt: "2026-10-24T00:00:00.000Z",
    version: 3,
    workingCapitalPercent: "20.00",
  };

  it("rebuilds the editor model from the persisted projection", () => {
    // #given an API draft response
    const saved = readSavedDraft(response);

    // #when read
    // #then the plan, story, media and version all survive
    expect(saved).not.toBeNull();
    expect(saved).toMatchObject({ id: "cmp_1", version: 3 });
    expect(saved?.draft.title).toBe("Solar cold chain");
    expect(saved?.draft.deadline).toBe("2099-01-01");
    expect(saved?.draft.targetInput).toBe("5000");
    expect(saved?.draft.workingCapitalPercent).toBe("20");
    expect(saved?.draft.milestones).toHaveLength(2);
    expect(saved?.draft.milestones[1]?.expectedAt).toBe("2099-03-01");
    expect(saved?.draft.heroMedia[0]).toMatchObject({
      alt: "A cold room",
      srcInput: "https://images.example.com/a.jpg",
    });
    expect(saved?.draft.useOfFunds[0]?.amountInput).toBe("5000");
    expect(saved?.draft.supportTiers[0]?.title).toBe("Supporter");
    expect(saved?.readiness).toEqual({
      blockers: ["Needs one more thing"],
      ready: false,
    });
    expect(saved?.status).toBe("DRAFT");
    expect(saved?.reviewStatus).toBeNull();
    expect(saved?.applicationFee).toMatchObject({
      amount: 10000,
      chargeId: "fee_1",
      status: "PENDING",
    });
  });

  it("round-trips every authored field through the payload and back", () => {
    // #given a complete draft
    const result = toCreateDraftPayload(completeDraft());
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // #when the API echoes that payload in a read response
    const saved = readSavedDraft({
      ...response,
      category: result.payload.category,
      deadline: result.payload.deadline,
      milestones: result.payload.milestones.map((milestone, index) => ({
        ...milestone,
        id: `m${index}`,
        index,
      })),
      objectionWindowDays: result.payload.objectionWindowDays,
      rewardTiers: result.payload.rewardTiers,
      story: {
        beneficiaries: result.payload.beneficiaries,
        heroMedia: result.payload.heroMedia,
        location: result.payload.location,
        problem: result.payload.problem,
        solution: result.payload.solution,
        storyMedia: result.payload.storyMedia,
        useOfFunds: result.payload.useOfFunds.map((line) => ({
          amount: line.amount,
          label: line.label,
        })),
      },
      summary: result.payload.summary,
      targetAmount: result.payload.targetAmount,
      title: result.payload.title,
      version: 1,
      workingCapitalPercent: result.payload.workingCapitalPercent,
    });

    // #then a second save would produce the same document
    expect(saved).not.toBeNull();
    const again = toCreateDraftPayload(saved!.draft);
    expect(again.ok).toBe(true);
    if (!again.ok) return;
    expect(again.payload).toEqual(result.payload);
  });

  it("returns null for a response without an id or version", () => {
    expect(readSavedDraft({ id: "cmp_1" })).toBeNull();
    expect(readSavedDraft({ version: 1 })).toBeNull();
    expect(readSavedDraft(null)).toBeNull();
  });

  it("does not trust an unknown category or milestone shape", () => {
    // #given a response with no milestones and no reward tiers
    const saved = readSavedDraft({
      category: null,
      id: "cmp_2",
      milestones: [],
      rewardTiers: [],
      story: {},
      version: 0,
    });

    // #when read
    // #then the editor still opens on a usable, empty model
    expect(saved?.draft.milestones).toEqual([]);
    expect(saved?.draft.supportTiers).toEqual([]);
    expect(draftFromApiDraft({ id: "only-an-id" })).not.toBeNull();
  });
});
