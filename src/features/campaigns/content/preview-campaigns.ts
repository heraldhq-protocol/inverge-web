import { formatLongDate } from "@/features/campaigns/lib/dates";
import {
  PLATFORM_SUCCESS_FEE_BPS,
  WORKING_CAPITAL_BPS,
} from "@/features/campaigns/lib/escrow";
import {
  campaignCategoryLabel,
  campaignSubcategoryLabel,
  type CampaignCategorySlug,
  type CampaignSubcategorySlug,
} from "@/features/campaigns/lib/taxonomy";
import type {
  Campaign,
  CampaignDisclosures,
  CampaignFaq,
  CampaignMedia,
  CampaignMilestone,
  CampaignPhase,
  CampaignReview,
  EscrowTerms,
  FundingSource,
  MilestoneDecision,
  MilestoneEvidence,
  MilestoneState,
  PublicCreator,
  StoryBlock,
  SupportTier,
  UseOfFundsLine,
} from "@/features/campaigns/types";
import type { DiscoveryCategory } from "@/features/home/discovery-categories";
import type { MoneyAmount } from "@/lib/money";

/**
 * Preview campaign fixtures.
 *
 * These stand in for the campaign API. They are the only source of campaign data
 * in this repository and every one is marked `demo: true`, so the UI can state
 * plainly that it is a preview.
 *
 * Two rules keep them honest:
 *
 * 1. Every `transaction` is `null`. No chain is connected, and a signature is
 *    never fabricated. Where a receipt or an explorer link would appear, the UI
 *    says the reference is unavailable.
 * 2. Missing data is modelled as missing, not as zero. A campaign whose funding
 *    totals are not indexed carries `source: "reconciling"` and a `null` raised
 *    amount, and the UI renders "being reconciled" rather than "$0 raised".
 *
 * Dates are fixed sample instants in UTC. The day counts on a card are derived
 * from the reader's clock, so the fixtures stay deterministic across renderers
 * while the presentation stays relative.
 *
 * Media is images only, and only for the two campaigns whose galleries are worth
 * showing. No fixture carries a video: the repository vendors no video file, and
 * inventing one — or pointing at a third-party host — would be fabricating media
 * and breaking the rule above that a preview does not depend on someone else at
 * render time. The linked-video path is exercised by the creator wizard, where a
 * real YouTube or Vimeo link can be pasted and previewed.
 */

type MilestoneSeed = {
  title: string;
  deliverable: string;
  allocationBps: number;
  evidence: string;
  expectedAt: string;
  state: MilestoneState;
  submission?: { submittedAt: string; evidence: readonly MilestoneEvidence[] };
  objectionClosesAt?: string;
  objectionBps?: number;
  decision?: MilestoneDecision;
};

type Seed = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  /** @deprecated broad preview category, retained for compatibility. */
  category: DiscoveryCategory;
  /** Explicit fit against the supplied discovery taxonomy. Omit when none fits. */
  taxonomy?: {
    category: CampaignCategorySlug;
    subcategory?: CampaignSubcategorySlug | null;
  };
  location: string;
  cover: string | null;
  creator: PublicCreator;
  phase: CampaignPhase;
  review?: CampaignReview;
  target: string;
  raised?: string | null;
  backerCount?: number | null;
  fundingSource?: FundingSource;
  supportedSettlementAssets?: readonly ("USDC" | "cNGN")[];
  closesAt: string;
  publishedAt?: string | null;
  milestones: readonly MilestoneSeed[];
  /** The hero gallery, in order. Omitted entirely when the campaign has none. */
  media?: readonly CampaignMedia[];
  story: {
    problem: string;
    solution: string;
    beneficiaries: string;
    useOfFunds: readonly UseOfFundsLine[];
    /** Media attached inside the story. Omitted when there is none. */
    media?: readonly CampaignMedia[];
    /** The creator's long-form narrative. Omitted when they wrote none. */
    blocks?: readonly StoryBlock[];
  };
  supportTiers?: readonly SupportTier[];
  faqs?: readonly CampaignFaq[];
  disclosures?: CampaignDisclosures;
  updates?: readonly {
    id: string;
    title: string;
    body: string;
    createdAt: string;
    milestoneId?: string | null;
    attachments?: readonly { id: string; label: string; href: string }[];
  }[];
  escrow?: Partial<EscrowTerms>;
  campaignNumber: string;
  featured?: boolean;
};

const USD = "USD" as const;

function money(atomic: string): MoneyAmount {
  return { atomic, currency: USD, decimals: 2 };
}

/** `undefined` and `null` both mean "this figure is not available". */
function optionalMoney(value: string | null | undefined): MoneyAmount | null {
  return value === undefined || value === null ? null : money(value);
}

/** The platform parameters the SRS states, as the published term defaults. */
const DEFAULT_ESCROW: EscrowTerms = {
  objectionThresholdBps: 3_000,
  objectionWindowDays: 7,
  perWalletObjectionCapBps: 1_500,
  successFeeBps: PLATFORM_SUCCESS_FEE_BPS,
  workingCapitalBps: null,
};

function buildMilestones(
  slug: string,
  seeds: readonly MilestoneSeed[],
): readonly CampaignMilestone[] {
  return seeds.map((seed, index) => ({
    allocationBps: seed.allocationBps,
    decision: seed.decision ?? null,
    deliverable: seed.deliverable,
    evidence: seed.evidence,
    expectedAt: seed.expectedAt,
    id: `${slug}-m${index + 1}`,
    objectionBps: seed.objectionBps ?? 0,
    objectionClosesAt: seed.objectionClosesAt ?? null,
    sequence: index + 1,
    state: seed.state,
    submission: seed.submission ?? null,
    title: seed.title,
  }));
}

/** The fixed share of the target released at funding (FR-503a). */
const DEFAULT_WORKING_CAPITAL_BPS = WORKING_CAPITAL_BPS;

function buildCampaign(seed: Seed): Campaign {
  const declaredWorkingCapital = seed.escrow?.workingCapitalBps;
  // A fixture that declares no published terms keeps `null`, because "unknown"
  // must not become a number. The rest use the fixed 20% of target.
  const workingCapitalBps =
    declaredWorkingCapital === null
      ? null
      : (declaredWorkingCapital ?? DEFAULT_WORKING_CAPITAL_BPS);
  const milestones = buildMilestones(seed.slug, seed.milestones);
  const escrow: EscrowTerms = {
    ...DEFAULT_ESCROW,
    ...seed.escrow,
    // Working capital is a separate stage sized from the target; the milestone
    // weights divide what remains and sum to 100% on their own. They are not
    // rescaled to make a combined total.
    workingCapitalBps,
  };

  const taxonomy = seed.taxonomy
    ? {
        category: seed.taxonomy.category,
        subcategory: seed.taxonomy.subcategory ?? null,
      }
    : null;

  return {
    category: seed.category,
    taxonomy,
    cover: seed.cover,
    creator: seed.creator,
    demo: true,
    disclosures: seed.disclosures ?? {
      eligibility:
        "Open to backers anywhere Inverge operates. Identity verification applies only once cumulative contributions pass Inverge's configured threshold.",
      failurePlan:
        "If the target is not reached by the deadline the campaign fails and every contribution becomes refundable in full.",
      risks:
        "Delivery depends on the creator's own capacity, local supply chains, and the operating environment. Milestone tranches are released only on approved evidence, which is the protection against a plan that stalls.",
    },
    escrow,
    facts: [
      {
        label: "Category",
        value: taxonomy
          ? taxonomy.subcategory
            ? `${campaignCategoryLabel(
                taxonomy.category,
              )} / ${campaignSubcategoryLabel(
                taxonomy.category,
                taxonomy.subcategory,
              )}`
            : campaignCategoryLabel(taxonomy.category)
          : "Not yet categorised",
      },
      { label: "Location", value: seed.location },
      { label: "Funding model", value: "All-or-Nothing" },
      { label: "Funding deadline", value: formatLongDate(seed.closesAt) },
      { label: "Funding asset", value: "USDC" },
      { label: "Campaign ID", value: seed.campaignNumber },
    ],
    faqs: seed.faqs ?? defaultFaqs(),
    featured: seed.featured ?? false,
    funding: {
      backerCount: seed.backerCount ?? null,
      closesAt: seed.closesAt,
      fundingAsset: "USDC",
      raised: optionalMoney(seed.raised),
      source: seed.fundingSource ?? (seed.raised ? "indexed" : "unavailable"),
      supportedSettlementAssets: seed.supportedSettlementAssets ?? ["USDC"],
      target: money(seed.target),
    },
    id: seed.id,
    location: seed.location,
    media: seed.media ?? [],
    milestones,
    phase: seed.phase,
    publishedAt: seed.publishedAt ?? null,
    review: seed.review ?? { status: "not-submitted" },
    slug: seed.slug,
    story: {
      ...seed.story,
      blocks: seed.story.blocks ?? [],
      media: seed.story.media ?? [],
    },
    summary: seed.summary,
    supportTiers: seed.supportTiers ?? [],
    title: seed.title,
    updates: (seed.updates ?? []).map((update) => ({
      attachments: update.attachments ?? [],
      body: update.body,
      createdAt: update.createdAt,
      id: update.id,
      milestoneId: update.milestoneId ?? null,
      title: update.title,
    })),
  };
}

function defaultFaqs(): readonly CampaignFaq[] {
  return [
    {
      answer:
        "The campaign fails. Every contribution becomes refundable in full, and a refund can be claimed without depending on the creator or on Inverge.",
      id: "target-not-reached",
      question: "What happens if the campaign does not reach its target?",
    },
    {
      answer:
        "Only after a milestone's evidence is approved. A fixed 20% working-capital tranche of the target is released at funding success; the milestone weights divide what remains, and every later tranche waits for its own approval.",
      id: "when-released",
      question: "When are funds released?",
    },
    {
      answer:
        "A claim opens a review window, and backers can object during it. If objections pass the published threshold the milestone fails, and the remaining escrow for the campaign becomes refundable pro-rata. A failed claim can be appealed.",
      id: "objections",
      question: "What if I disagree with a milestone?",
    },
  ];
}

const COVERS = {
  agroroute: "/images/ideas/agroroute.jpg",
  campusKonekt: "/images/ideas/campus-konekt.jpg",
  careBridge: "/images/ideas/care-bridge.jpg",
  cropCircle: "/images/ideas/crop-circle.jpg",
  ecochargeKiosks: "/images/ideas/ecocharge-kiosks.jpg",
  farmlink: "/images/ideas/farmlink-coldbox.jpg",
  kitchenCollective: "/images/ideas/kitchen-collective.jpg",
  naijacraft: "/images/ideas/naijacraft-collective.jpg",
  skillCircle: "/images/ideas/skill-circle.jpg",
  solarChill: "/images/ideas/solarchill.jpg",
  storyFoundry: "/images/ideas/story-foundry.jpg",
  studymate: "/images/ideas/studymate-ng.jpg",
  sungrid: "/images/ideas/sungrid-community-power.jpg",
  team: "/images/ideas/team.jpg",
} as const;

/**
 * A fixture image, with the description and caption a creator would have written.
 *
 * These are the same vendored placeholder photographs the covers use, so a
 * gallery is clearly sample content rather than a claim about a real project.
 */
function image(
  id: string,
  src: string,
  alt: string,
  caption: string | null = null,
): CampaignMedia {
  return { alt, caption, id, kind: "image", src };
}

/* -------------------------------------------------------------------------- */
/* Public campaigns                                                           */
/* -------------------------------------------------------------------------- */

const sungrid = buildCampaign({
  backerCount: 214,
  campaignNumber: "IVG-2026-0114",
  category: "clean-energy",
  taxonomy: { category: "technology", subcategory: "hardware" },
  closesAt: "2027-01-15T23:59:59.000Z",
  cover: COVERS.sungrid,
  creator: {
    bio: "GreenFlow Africa builds and maintains shared solar infrastructure with the communities that use it.",
    identityVerified: true,
    location: "Ogun State, Nigeria",
    name: "GreenFlow Africa",
    previousCampaigns: 2,
  },
  disclosures: {
    eligibility:
      "Open to backers anywhere Inverge operates. Identity verification applies only once cumulative contributions pass Inverge's configured threshold.",
    failurePlan:
      "If the target is not reached by 15 January 2027 the campaign fails and every contribution becomes refundable in full. Nothing is spent before funding succeeds.",
    risks:
      "The main risks are import lead times on pumps and inverters, and the reliability of local maintenance capacity. The plan answers both by funding a trained operator cohort inside the same milestone as the hardware.",
  },
  faqs: [
    {
      answer:
        "Six communities across two local government areas, and the small businesses that buy from them. Training runs in the communities so maintenance does not depend on a single contractor.",
      id: "who-benefits",
      question: "Who actually benefits from this?",
    },
    {
      answer:
        "The first tranche is released at funding success so the team can order hardware. The second and third are released only after the installation and the operations records are reviewed and approved.",
      id: "why-tranches",
      question: "Why is the money released in stages?",
    },
    {
      answer:
        "Yes. If the target is not reached by the deadline, the campaign fails and every contribution becomes refundable in full, claimable without Inverge's involvement.",
      id: "refund",
      question: "Can I get my money back?",
    },
  ],
  featured: true,
  id: "campaign-sungrid",
  location: "Ogun State, Nigeria",
  media: [
    image(
      "sungrid-hero-1",
      COVERS.sungrid,
      "Solar panels and a pump house serving a rural community water point",
      "The first site surveyed for the programme.",
    ),
    image(
      "sungrid-hero-2",
      COVERS.solarChill,
      "A solar array mounted beside a water storage tank",
      "Storage is sized to the demand each community already has.",
    ),
    image(
      "sungrid-hero-3",
      COVERS.ecochargeKiosks,
      "A small solar installation beside a market stall",
      null,
    ),
  ],
  milestones: [
    {
      allocationBps: 2_000,
      deliverable:
        "Order and receive the pump and inverter sets, and prepare the first three sites for installation.",
      evidence:
        "Purchase invoices, delivery notes, and dated photographs of the three prepared sites.",
      expectedAt: "2027-02-20",
      state: "upcoming",
      title: "Procure equipment and prepare sites",
    },
    {
      allocationBps: 3_000,
      deliverable:
        "Install the solar pump and storage systems at the first three sites and commission them.",
      evidence:
        "Commissioning checklist signed by the installation lead, plus photographs of each completed installation.",
      expectedAt: "2027-04-15",
      state: "upcoming",
      title: "Install and commission the first three systems",
    },
    {
      allocationBps: 3_000,
      deliverable:
        "Train and equip twelve local operators, and complete the remaining three installations.",
      evidence:
        "Training attendance register, operator names and contact details, and a site report covering all six systems.",
      expectedAt: "2027-06-10",
      state: "upcoming",
      title: "Train operators and finish the remaining sites",
    },
    {
      allocationBps: 2_000,
      deliverable:
        "Hand over a maintenance programme with six months of parts and a public progress report.",
      evidence:
        "Final report with output readings per site, a parts inventory, and a signed handover to the community association.",
      expectedAt: "2027-07-30",
      state: "upcoming",
      title: "Handover and six-month maintenance programme",
    },
  ],
  phase: "funding",
  publishedAt: "2026-11-20T09:00:00.000Z",
  raised: "1840000",
  slug: "sungrid-community-power",
  story: {
    beneficiaries:
      "Around 2,400 people across six communities, plus the traders and workshops whose working day currently ends when the light does.",
    blocks: [
      {
        id: "sungrid-block-sites",
        kind: "heading",
        text: "How a site gets chosen",
      },
      {
        id: "sungrid-block-sites-body",
        kind: "paragraph",
        text: "Every site on this list has already been surveyed, and each one is sized to the water demand the community has today rather than to a projection of what it might need later. That is deliberate. An oversized system is a system nobody can afford to maintain once the programme has moved on.\n\nSix communities are on the list for this campaign. They are the ones where the survey found both a workable site and a local group willing to hold the maintenance contract.",
      },
      {
        id: "sungrid-block-process",
        kind: "list",
        items: [
          "Survey the site and agree the demand figure with the community association.",
          "Order and receive the pump, inverter, storage, and mounting hardware.",
          "Install and commission the system with the operator cohort on site.",
          "Hand over the maintenance programme with six months of parts.",
        ],
        ordered: true,
      },
      {
        id: "sungrid-block-operators",
        kind: "heading",
        text: "Why the operators matter more than the panels",
      },
      {
        id: "sungrid-block-operators-body",
        kind: "paragraph",
        text: "Hardware is the easy half. There are solar installations across the region standing unused because the nearest qualified technician is a day's travel away and the spare part is in another country. This programme funds the operator cohort in the same milestone as the installation, so the people who maintain the system are trained before the panels are even in the ground.",
      },
      {
        id: "sungrid-block-scope",
        kind: "note",
        text: "This campaign funds the installations, the operator training, the parts inventory, and the reporting that shows each one working. The survey work is already done and is not part of the target.",
        title: "What you are funding, and what you are not",
      },
    ],
    problem:
      "Many communities in Ogun State have an intermittent grid and no reliable way to pump or store water. Households either travel long distances for it or draw from sources they know are unsafe. The same problem reaches the small businesses that keep a community running, because a workshop without dependable power cannot take on a full day of work.",
    solution:
      "Solar-powered pump and storage systems at six sites, sized to the demand each community already has rather than to an optimistic projection. The installation is the visible half; the other half is a trained local operator cohort and a parts programme, so the system is still running in five years.",
    useOfFunds: [
      {
        amount: money("1000000"),
        label: "Pumps, inverters, storage and mounting",
      },
      {
        amount: money("600000"),
        label: "Installation, commissioning and site works",
      },
      {
        amount: money("550000"),
        label: "Operator training and parts inventory",
      },
      {
        amount: money("350000"),
        label: "Programme management, reporting and audit",
      },
    ],
    media: [
      image(
        "sungrid-story-1",
        COVERS.team,
        "The site team standing together after a commissioning visit",
        "The operator cohort that keeps each site running.",
      ),
    ],
  },
  summary:
    "Solar-powered water systems bringing clean, safe water to six rural communities in Ogun State.",
  supportTiers: [
    {
      addOns: [],
      description: "A thank-you message and access to campaign updates.",
      estimatedDelivery: "Within a week of the funding deadline",
      fulfilment: "digital",
      id: "sungrid-tier-community",
      image: null,
      includes: [
        "A thank-you message from the operator cohort",
        "Access to the campaign's backer updates",
      ],
      minimum: money("1000"),
      quantityLimit: null,
      shipping: null,
      title: "Community supporter",
      variants: [],
    },
    {
      addOns: [],
      description:
        "Everything above, plus a digital postcard and your name on the supporter wall.",
      estimatedDelivery: "Four weeks after the funding deadline",
      fulfilment: "digital",
      id: "sungrid-tier-impact",
      image: null,
      includes: [
        "Everything in Community supporter",
        "A digital postcard from the first commissioned site",
        "Your name on the campaign's supporter wall",
      ],
      minimum: money("5000"),
      quantityLimit: null,
      shipping: null,
      title: "Impact supporter",
      variants: [],
    },
    {
      addOns: [
        {
          affectsShipping: true,
          description:
            "A printed, folded guide to reading a solar site's daily output, signed by the operator cohort.",
          estimatedDelivery: "With the lantern kit",
          fulfilment: "physical",
          id: "sungrid-addon-field-guide",
          image: null,
          price: money("2500"),
          title: "Signed field guide",
        },
        {
          affectsShipping: true,
          description:
            "One more lantern kit, boxed alongside the first so both arrive together.",
          estimatedDelivery: "With the lantern kit",
          fulfilment: "physical",
          id: "sungrid-addon-second-lantern",
          image: null,
          price: money("12000"),
          title: "Second lantern kit",
        },
        {
          affectsShipping: false,
          description:
            "A year of output readings from every site, as a spreadsheet, sent once the last site is commissioned.",
          estimatedDelivery: "After the final commissioning",
          fulfilment: "digital",
          id: "sungrid-addon-data-pack",
          image: null,
          price: money("1000"),
          title: "Site data pack (digital)",
        },
      ],
      description:
        "A solar reading lantern kit assembled by the operator cohort, posted to you.",
      estimatedDelivery: "Six weeks after the funding deadline",
      fulfilment: "physical",
      id: "sungrid-tier-lantern",
      // A vendored placeholder photograph, like the campaign's own gallery, so
      // the demo shows artwork on a reward without claiming this is the kit.
      image: "/images/ideas/market-basket.jpg",
      includes: [
        "One solar reading lantern kit, assembled and tested by the operator cohort",
        "A printed assembly and care card",
        "Your name on the campaign's supporter wall",
      ],
      minimum: money("15000"),
      quantityLimit: 4,
      shipping: {
        customs:
          "We declare the value of every parcel accurately and cannot mark one as a gift. Any import duty or handling charge is the backer's to pay on delivery.",
        originCountry: "NG",
        rules: [
          {
            coverage: { kind: "origin" },
            id: "sungrid-rule-origin",
            rate: { amount: money("800"), basis: "order", kind: "flat" },
          },
          {
            coverage: { kind: "zone", zoneId: "sungrid-zone-west-africa" },
            id: "sungrid-rule-west-africa",
            rate: { amount: money("1500"), basis: "order", kind: "flat" },
          },
          {
            coverage: { kind: "zone", zoneId: "sungrid-zone-europe" },
            id: "sungrid-rule-europe",
            rate: { amount: money("2200"), basis: "unit", kind: "flat" },
          },
          {
            coverage: { kind: "zone", zoneId: "sungrid-zone-north-america" },
            id: "sungrid-rule-north-america",
            rate: { amount: money("2400"), basis: "unit", kind: "flat" },
          },
          {
            coverage: { country: "BR", kind: "country" },
            id: "sungrid-rule-brazil",
            rate: {
              kind: "unavailable",
              note: "Two parcels were held in customs there last year and sent back, so we are not offering it until we have a courier that can clear them.",
            },
          },
          {
            coverage: { kind: "worldwide" },
            id: "sungrid-rule-worldwide",
            rate: {
              kind: "deferred",
              note: "We will send you a courier quote before the kit is boxed, and you can decide then.",
            },
          },
        ],
        terms:
          "Posted by courier from Lagos once the first site is commissioned, in the order the parcels are boxed.",
        zones: [
          {
            countries: ["GH", "SN", "CI", "BJ", "TG", "BF", "ML", "NE"],
            id: "sungrid-zone-west-africa",
            name: "West Africa",
          },
          {
            countries: [
              "GB",
              "IE",
              "FR",
              "DE",
              "NL",
              "ES",
              "PT",
              "IT",
              "BE",
              "AT",
              "SE",
              "DK",
              "FI",
              "NO",
              "PL",
            ],
            id: "sungrid-zone-europe",
            name: "Europe",
          },
          {
            countries: ["US", "CA", "MX"],
            id: "sungrid-zone-north-america",
            name: "North America",
          },
        ],
      },
      title: "Lantern kit",
      variants: [
        {
          id: "sungrid-variant-colour",
          label: "Lantern colour",
          options: [
            { id: "amber", label: "Amber" },
            { id: "jade", label: "Jade" },
            { id: "charcoal", label: "Charcoal" },
          ],
        },
        {
          id: "sungrid-variant-plug",
          label: "Plug",
          options: [
            { id: "plug-uk", label: "UK type G" },
            { id: "plug-eu", label: "EU type C" },
            { id: "plug-us", label: "US type A" },
          ],
        },
      ],
    },
    {
      addOns: [],
      description:
        "Everything above, plus a printed copy of the final report posted to you, an invitation to the site handover, and a named acknowledgement in that report.",
      estimatedDelivery: "After the site handover milestone is approved",
      fulfilment: "mixed",
      id: "sungrid-tier-site",
      image: null,
      includes: [
        "Everything in the Lantern kit",
        "The printed final report, posted to you",
        "An invitation to the site handover",
        "A named acknowledgement in the report",
      ],
      minimum: money("20000"),
      quantityLimit: null,
      shipping: {
        customs:
          "Duty and handling charges are the backer's. The report is sent as documents, not as goods.",
        originCountry: "NG",
        rules: [
          {
            coverage: { country: "NG", kind: "country" },
            id: "sungrid-site-rule-origin",
            rate: { kind: "free" },
          },
          {
            coverage: { kind: "zone", zoneId: "sungrid-site-zone-partners" },
            id: "sungrid-site-rule-partners",
            rate: { amount: money("3500"), basis: "order", kind: "flat" },
          },
        ],
        terms: "Posted from Lagos once the final report is approved.",
        zones: [
          {
            countries: ["GH", "KE", "ZA"],
            id: "sungrid-site-zone-partners",
            name: "Partner countries",
          },
        ],
      },
      title: "Site partner",
      variants: [],
    },
  ],
  target: "2500000",
  updates: [
    {
      body: "Two of the three pump sets are ordered and the third is on a waitlist with the supplier. Site preparation at Ijebu-Igbo and Oru has started, and the community associations have both signed off on the siting.",
      createdAt: "2026-12-18T10:15:00.000Z",
      id: "sungrid-update-sites",
      title: "Site preparation has started at two of six communities",
    },
    {
      body: "The maintenance programme now includes a shared parts store rather than each community holding its own. That reduces the parts budget and puts the saving into the operator training line, where it does more for reliability.",
      createdAt: "2026-12-02T08:40:00.000Z",
      id: "sungrid-update-parts",
      title: "We changed how spare parts are held after backer questions",
    },
    {
      body: "GreenFlow Africa has completed two previous campaigns on Inverge, both of which released every milestone tranche on approved evidence. The delivery record and the review notes are public on those campaign pages.",
      createdAt: "2026-11-20T09:05:00.000Z",
      id: "sungrid-update-launch",
      title: "Why we are publishing the full milestone plan up front",
    },
  ],
  title: "SunGrid Community Power",
});

const farmlink = buildCampaign({
  backerCount: 61,
  campaignNumber: "IVG-2027-0007",
  category: "agriculture",
  taxonomy: { category: "technology", subcategory: "hardware" },
  closesAt: "2027-02-28T23:59:59.000Z",
  cover: COVERS.farmlink,
  creator: {
    bio: "FarmLink builds cold-chain infrastructure for smallholder cooperatives in northern Nigeria.",
    identityVerified: true,
    location: "Kano State, Nigeria",
    name: "Ibrahim Musa",
    previousCampaigns: 0,
  },
  disclosures: {
    eligibility:
      "Open to backers anywhere Inverge operates. This is the creator's first campaign, so there is no delivery record to review yet — the milestone plan and the evidence definitions are the accountability.",
    failurePlan:
      "If the target is not reached by 28 February 2027 the campaign fails. Contributions become refundable in full and no unit is ordered.",
    risks:
      "Refrigeration units are imported and lead times can move. The plan excludes any commitment to dates beyond the funding window until the units are on the ground, and the second milestone is explicitly the commissioning stage rather than a delivery promise.",
  },
  id: "campaign-farmlink",
  location: "Kano State, Nigeria",
  media: [
    image(
      "farmlink-hero-1",
      COVERS.farmlink,
      "A cold-storage container beside crates of produce at a cooperative collection point",
      "The unit the first milestone orders.",
    ),
    image(
      "farmlink-hero-2",
      COVERS.cropCircle,
      "Crops growing in rows on a smallholder plot",
      "What the cold chain is meant to keep sellable for longer.",
    ),
  ],
  milestones: [
    {
      allocationBps: 3_500,
      deliverable:
        "Order and receive two solar cold-storage units, and confirm the cooperative sites that will host them.",
      evidence:
        "Supplier invoice and shipping documents, plus signed site agreements from the two cooperatives.",
      expectedAt: "2027-04-10",
      state: "upcoming",
      title: "Order units and confirm host sites",
    },
    {
      allocationBps: 4_000,
      deliverable:
        "Install and commission both units, and run a first full cooling cycle with a recorded temperature log.",
      evidence:
        "Commissioning report with a 72-hour temperature log, installation photographs, and the installer's sign-off.",
      expectedAt: "2027-06-05",
      state: "upcoming",
      title: "Install, commission and verify performance",
    },
    {
      allocationBps: 2_500,
      deliverable:
        "Train cooperative operators and publish the first month of utilisation and spoilage figures.",
      evidence:
        "Operator training register and a first-month utilisation report countersigned by each cooperative.",
      expectedAt: "2027-07-25",
      state: "upcoming",
      title: "Train operators and report first-month results",
    },
  ],
  phase: "funding",
  publishedAt: "2027-01-05T07:30:00.000Z",
  raised: "420000",
  slug: "farmlink-coldbox",
  story: {
    beneficiaries:
      "Around 340 smallholder farmers in two cooperatives, and the market traders who buy from them.",
    problem:
      "Smallholder farmers in Kano lose a meaningful share of every harvest because there is nowhere to store produce safely after picking. The loss is not evenly spread: it lands hardest on the farmers with the smallest volumes, who cannot absorb a spoiled week and cannot afford to wait for a better price.",
    solution:
      "Two solar-powered cold-storage units hosted by cooperatives rather than owned by a single operator. Each unit is sized to the volume the two cooperatives already handle, so the first month of operation is measured against a real baseline rather than a projection.",
    useOfFunds: [
      { amount: money("1950000"), label: "Two solar cold-storage units" },
      {
        amount: money("550000"),
        label: "Installation, foundations and electrical works",
      },
      {
        amount: money("300000"),
        label: "Operator training and first-month monitoring",
      },
      { amount: money("200000"), label: "Logistics, compliance and reporting" },
    ],
  },
  summary:
    "Solar cold storage hosted by farmer cooperatives in Kano, so a good harvest is not lost in the first week.",
  target: "3000000",
  title: "FarmLink ColdBox",
});

const ibadanCreativeLab = buildCampaign({
  backerCount: null,
  campaignNumber: "IVG-2027-0019",
  category: "creative",
  taxonomy: { category: "art", subcategory: "mixed-media" },
  closesAt: "2027-03-10T23:59:59.000Z",
  cover: COVERS.storyFoundry,
  creator: {
    bio: "Story Foundry is a collective of illustrators, animators and writers working out of Ibadan.",
    identityVerified: true,
    location: "Oyo State, Nigeria",
    name: "Fúnmiláyọ̀ Ojó",
    previousCampaigns: 1,
  },
  fundingSource: "reconciling",
  id: "campaign-ibadan-creative-lab",
  location: "Oyo State, Nigeria",
  milestones: [
    {
      allocationBps: 3_000,
      deliverable:
        "Lease and fit out the studio space, including power, benches and shared equipment.",
      evidence:
        "Signed lease, fit-out invoices, and dated photographs of the completed space.",
      expectedAt: "2027-04-20",
      state: "upcoming",
      title: "Fit out the shared studio",
    },
    {
      allocationBps: 4_000,
      deliverable:
        "Run two paid production cohorts and publish the work they produce.",
      evidence:
        "Cohort rosters, attendance records, and a published catalogue of the finished work.",
      expectedAt: "2027-06-30",
      state: "upcoming",
      title: "Run two production cohorts",
    },
    {
      allocationBps: 3_000,
      deliverable:
        "Deliver an open commissioning fund and publish a public report on the first year.",
      evidence:
        "Commissioning decisions with named recipients and amounts, and the published year-one report.",
      expectedAt: "2027-08-15",
      state: "upcoming",
      title: "Open commissioning fund and report",
    },
  ],
  phase: "funding",
  publishedAt: "2026-12-28T11:00:00.000Z",
  slug: "ibadan-creative-lab",
  story: {
    beneficiaries:
      "Around 40 working illustrators, animators and writers in Oyo State, and the clients who commission them.",
    problem:
      "Creative work in Ibadan happens in bedrooms and borrowed rooms, with unreliable power and no shared equipment. Talent is not the constraint. The constraint is that a single power cut in the wrong hour can wipe out a week of animation work, and that there is nowhere to meet a client that is not someone's front room.",
    solution:
      "A shared studio with dependable power, benches, and equipment that no individual could justify buying. The second milestone pays the first two cohorts rather than inviting people to attend for free, because unpaid training selects for people who can afford to work for nothing.",
    useOfFunds: [
      { amount: money("480000"), label: "Studio lease and fit-out" },
      {
        amount: money("300000"),
        label: "Power, inverters and shared equipment",
      },
      { amount: money("280000"), label: "Two paid production cohorts" },
      { amount: money("140000"), label: "Commissioning fund and reporting" },
    ],
  },
  summary:
    "A shared, powered studio in Ibadan so creative work does not depend on whether the light is on.",
  target: "1200000",
  title: "Ìbàdàn Creative Lab",
});

const studymate = buildCampaign({
  backerCount: 388,
  campaignNumber: "IVG-2026-0071",
  category: "technology",
  taxonomy: { category: "technology", subcategory: "software" },
  closesAt: "2026-09-30T23:59:59.000Z",
  cover: COVERS.studymate,
  creator: {
    bio: "StudyMate builds offline-first learning tools for secondary schools without reliable connectivity.",
    identityVerified: true,
    location: "Federal Capital Territory, Nigeria",
    name: "Zainab Bello",
    previousCampaigns: 1,
  },
  disclosures: {
    eligibility:
      "Open to backers anywhere Inverge operates. School deployments are agreed with each state education board before installation.",
    failurePlan:
      "Funding already succeeded, so the campaign cannot fail. If a milestone's evidence is rejected, the remaining escrow for that contract becomes refundable pro-rata.",
    risks:
      "The dependency is school calendars: deployment windows are fixed by term dates, and a shift can move a commissioning date. The plan sequences content work in the first tranche so the schedule has slack at the deployment stage.",
  },
  id: "campaign-studymate",
  location: "Federal Capital Territory, Nigeria",
  milestones: [
    {
      allocationBps: 2_500,
      deliverable:
        "Build and review the offline lesson catalogue for the first three subjects.",
      evidence:
        "Subject-by-subject content inventory, reviewer sign-off from two practising teachers, and a working offline build.",
      expectedAt: "2026-09-20",
      state: "released",
      decision: {
        decidedAt: "2026-09-28T12:00:00.000Z",
        summary:
          "Approved with no objections. The reviewer sign-offs and the offline build were both attached to the claim.",
        transaction: null,
      },
      submission: {
        evidence: [
          {
            description:
              "The full content inventory, listed by subject and lesson, with the mapping to the national curriculum.",
            id: "studymate-m1-evidence-inventory",
            kind: "link",
            label: "Content inventory",
          },
          {
            description:
              "Two practising secondary teachers reviewed the catalogue and recorded their sign-off in writing.",
            id: "studymate-m1-evidence-reviewers",
            kind: "note",
            label: "Reviewer sign-off",
          },
        ],
        submittedAt: "2026-09-21T09:30:00.000Z",
      },
      title: "Offline lesson catalogue for three subjects",
    },
    {
      allocationBps: 2_500,
      deliverable:
        "Deploy to the first twelve schools, including device setup and teacher onboarding.",
      evidence:
        "A deployment log per school with the date, the devices configured, and the named teacher who completed onboarding.",
      expectedAt: "2026-10-12",
      objectionBps: 1_200,
      objectionClosesAt: "2026-10-22T23:59:59.000Z",
      state: "objection-window",
      submission: {
        evidence: [
          {
            description:
              "Deployment logs from all twelve schools, each countersigned by the teacher who completed onboarding.",
            id: "studymate-m2-evidence-deployments",
            kind: "note",
            label: "School deployment logs",
          },
          {
            description:
              "Photographs of the configured devices at six of the twelve schools.",
            id: "studymate-m2-evidence-photos",
            kind: "photo",
            label: "Device setup photographs",
          },
        ],
        submittedAt: "2026-10-15T14:05:00.000Z",
      },
      title: "Deploy to the first twelve schools",
    },
    {
      allocationBps: 2_500,
      deliverable:
        "Deploy to a further twenty schools and publish first-term usage figures.",
      evidence:
        "Second deployment log and a usage report on lesson completions per school.",
      expectedAt: "2026-12-08",
      state: "upcoming",
      title: "Deploy to twenty more schools",
    },
    {
      allocationBps: 2_500,
      deliverable:
        "Ship the teacher authoring tools and publish the maintenance and support plan.",
      evidence:
        "Released authoring tool, a support runbook, and a summary of the first fifty teacher-authored lessons.",
      expectedAt: "2027-02-20",
      state: "upcoming",
      title: "Teacher authoring tools and support plan",
    },
  ],
  phase: "delivering",
  publishedAt: "2026-08-02T08:00:00.000Z",
  raised: "3240000",
  slug: "studymate-ng",
  story: {
    beneficiaries:
      "Around 9,000 students across 32 secondary schools, and the teachers who currently teach a shared curriculum from a single textbook.",
    problem:
      "Secondary schools outside the major cities often have devices and no content, or content and no connectivity. Lesson material is either online and unusable during a network outage, or printed and impossible to update when the curriculum changes.",
    solution:
      "An offline-first lesson catalogue with a teacher authoring layer. Installation is scheduled around term dates rather than in bulk, because a deployment that lands mid-term disrupts the term it was meant to help.",
    useOfFunds: [
      { amount: money("750000"), label: "Content development and review" },
      { amount: money("900000"), label: "School deployments and device setup" },
      { amount: money("800000"), label: "Teacher onboarding and training" },
      {
        amount: money("550000"),
        label: "Authoring tools, support and reporting",
      },
    ],
  },
  summary:
    "Offline-first learning resources for secondary schools without reliable connectivity, deployed around term dates.",
  target: "3000000",
  title: "StudyMate for Nigerian secondary schools",
  updates: [
    {
      body: "Twelve schools are live and the second claim has been submitted with per-school deployment logs and photographs. The objection window is open until 22 October, and every backer has been notified.",
      createdAt: "2026-10-15T14:20:00.000Z",
      id: "studymate-update-claim2",
      milestoneId: "studymate-ng-m2",
      title: "Second milestone claim submitted for review",
    },
    {
      body: "The first tranche was approved and released. Reviewer sign-offs from two practising teachers were attached to the claim, and no objections were registered during the review window.",
      createdAt: "2026-09-28T12:30:00.000Z",
      id: "studymate-update-milestone1",
      milestoneId: "studymate-ng-m1",
      title: "Milestone one approved and released",
    },
    {
      body: "The catalogue now covers three subjects rather than two. Reviewers asked for the third to be added before deployment so teachers would not have to teach a hybrid curriculum during the pilot.",
      createdAt: "2026-09-05T10:00:00.000Z",
      id: "studymate-update-scope",
      title: "Scope changed after reviewer feedback",
    },
    {
      body: "Funding succeeded at USDC 32,400 against a target of USDC 30,000. Escrow is active, terms are locked, and the milestone plan is unchanged from the version published before the window opened.",
      createdAt: "2026-10-01T09:00:00.000Z",
      id: "studymate-update-funded",
      title: "Funding succeeded — escrow is active",
    },
  ],
});

const lagosKitchen = buildCampaign({
  backerCount: 143,
  campaignNumber: "IVG-2026-0058",
  category: "food-retail",
  taxonomy: { category: "food", subcategory: "restaurants" },
  closesAt: "2026-09-15T23:59:59.000Z",
  cover: COVERS.kitchenCollective,
  creator: {
    bio: "Lagos Kitchen Collective is a shared commercial kitchen serving small food producers across the mainland.",
    identityVerified: true,
    location: "Lagos State, Nigeria",
    name: "Chidi Okeke",
    previousCampaigns: 0,
  },
  disclosures: {
    eligibility:
      "Open to backers anywhere Inverge operates. Producer onboarding requires a food-handling certificate, which is a regulatory condition and not an eligibility gate for backers.",
    failurePlan:
      "The target was not reached by 15 September 2026. Every contribution of USDC 9,800 is refundable in full and can be claimed indefinitely.",
    risks:
      "The main risk was timeline: the lease agreement was contingent on hitting the funding target, and equipment lead times sat inside the funding window rather than after it.",
  },
  faqs: [
    {
      answer:
        "The campaign failed, so nothing was released and nothing was spent. Every contribution is refundable in full, and the escrow for this campaign is untouched.",
      id: "what-happened",
      question: "What happened to the money?",
    },
    {
      answer:
        "Refunds are claim-based rather than automatic. Nothing is pushed to you, and unclaimed funds remain claimable indefinitely, so there is no deadline to act by.",
      id: "how-refund",
      question: "How do I get my contribution back?",
    },
    {
      answer:
        "No. On this campaign no milestone was ever reached and no tranche was released, so there is no working-capital tranche to exclude from the refundable amount.",
      id: "working-capital",
      question: "Was any of it released early?",
    },
  ],
  id: "campaign-lagos-kitchen",
  location: "Lagos State, Nigeria",
  milestones: [
    {
      allocationBps: 3_000,
      deliverable:
        "Sign the lease and complete the fit-out of the shared kitchen space.",
      evidence:
        "Signed lease, fit-out invoices, and a food-safety inspection report for the completed space.",
      expectedAt: "2026-10-30",
      state: "upcoming",
      title: "Secure and fit out the kitchen",
    },
    {
      allocationBps: 4_000,
      deliverable:
        "Install and commission the commercial cooking and cold-storage equipment.",
      evidence:
        "Commissioning report, equipment invoices, and photographs of each installed unit in operation.",
      expectedAt: "2026-12-15",
      state: "upcoming",
      title: "Install and commission equipment",
    },
    {
      allocationBps: 3_000,
      deliverable:
        "Onboard the first twenty producers and publish first-quarter utilisation.",
      evidence:
        "Producer roster with certification references, and a utilisation report covering the first quarter.",
      expectedAt: "2027-02-28",
      state: "upcoming",
      title: "Onboard producers and report utilisation",
    },
  ],
  phase: "funding-failed",
  publishedAt: "2026-08-01T09:00:00.000Z",
  raised: "980000",
  slug: "lagos-kitchen-collective",
  story: {
    beneficiaries:
      "Around 60 small food producers on the Lagos mainland, and their customers.",
    problem:
      "Small food producers in Lagos cannot legally or safely scale past a home kitchen. Renting certified commercial space by the hour is expensive, and the certification a shop needs is out of reach for someone selling from a home kitchen.",
    solution:
      "One shared, certified commercial kitchen with bookings by the hour and cold storage in the same building. Producers pay for what they use, which keeps the barrier to entry at the level of a single batch rather than a lease.",
    useOfFunds: [
      { amount: money("1200000"), label: "Lease and fit-out" },
      {
        amount: money("1600000"),
        label: "Commercial cooking and cold-storage equipment",
      },
      {
        amount: money("800000"),
        label: "Producer onboarding and certification support",
      },
      { amount: money("400000"), label: "Compliance, insurance and reporting" },
    ],
  },
  summary:
    "A shared, certified commercial kitchen on the Lagos mainland, bookable by the hour by small food producers.",
  target: "4000000",
  title: "Lagos Kitchen Collective",
  updates: [
    {
      body: "The funding window closed at USDC 9,800 against a target of USDC 40,000. The campaign has failed and no funds were released. Every contribution is now refundable in full, and refunds are claim-based so nothing expires.",
      createdAt: "2026-09-16T08:00:00.000Z",
      id: "lagos-kitchen-update-closed",
      title: "Funding closed below target — refunds are available",
    },
    {
      body: "We moved the producer onboarding line later in the plan after backers asked why it was funded before the kitchen existed. Onboarding now happens in the third tranche, after commissioning.",
      createdAt: "2026-08-22T11:30:00.000Z",
      id: "lagos-kitchen-update-plan",
      title: "Milestone plan adjusted after feedback",
    },
  ],
});

const healthreach = buildCampaign({
  backerCount: 96,
  campaignNumber: "IVG-2027-0026",
  category: "community",
  closesAt: "2027-01-31T23:59:59.000Z",
  cover: COVERS.careBridge,
  creator: {
    bio: "HealthReach runs mobile primary-care clinics in Kaduna State with a nursing-led model.",
    identityVerified: true,
    location: "Kaduna State, Nigeria",
    name: "Dr. Halima Yusuf",
    previousCampaigns: 1,
  },
  id: "campaign-healthreach",
  location: "Kaduna State, Nigeria",
  milestones: [
    {
      allocationBps: 4_000,
      deliverable:
        "Procure and equip two mobile clinic vehicles, including a working cold chain for vaccines.",
      evidence:
        "Vehicle invoices and registration, equipment inventory, and a cold-chain temperature verification log.",
      expectedAt: "2027-03-20",
      state: "upcoming",
      title: "Equip two mobile clinics",
    },
    {
      allocationBps: 3_000,
      deliverable:
        "Run the first twelve community clinic days and record patient volumes.",
      evidence:
        "Clinic-day log with dates, locations, and anonymised patient counts by service.",
      expectedAt: "2027-05-30",
      state: "upcoming",
      title: "Run twelve community clinic days",
    },
    {
      allocationBps: 3_000,
      deliverable:
        "Publish the six-month health-outcome report and a referral evaluation.",
      evidence:
        "Published outcome report with referral completion rates, countersigned by the state primary health board.",
      expectedAt: "2027-08-10",
      state: "upcoming",
      title: "Publish outcomes and referral evaluation",
    },
  ],
  phase: "paused",
  publishedAt: "2026-12-05T09:00:00.000Z",
  raised: "730000",
  slug: "healthreach-clinic",
  story: {
    beneficiaries:
      "Around 40,000 people across the rural wards the two clinics would serve, and the health workers who currently cover them by motorbike.",
    problem:
      "Rural wards in Kaduna State are served by health workers travelling by motorbike with a cold box. The distance is manageable; keeping a vaccine cold chain intact across it is not, so immunisation days are either cancelled or run with a shortened window.",
    solution:
      "Two mobile clinic vehicles with a proper cold chain and a nursing-led staffing model, running fixed community clinic days so a village knows when the clinic arrives. The outcome report is a published deliverable, not an afterthought, because that is what makes the referral rate checkable.",
    useOfFunds: [
      { amount: money("720000"), label: "Two mobile clinic vehicles" },
      { amount: money("480000"), label: "Cold chain, equipment and medicines" },
      { amount: money("400000"), label: "Nursing and driver staffing" },
      {
        amount: money("200000"),
        label: "Monitoring, referral follow-up and reporting",
      },
    ],
  },
  summary:
    "Two mobile primary-care clinics for rural Kaduna State, with a cold chain that reaches the last settlement.",
  target: "1800000",
  title: "HealthReach Mobile Clinics",
  updates: [
    {
      body: "This campaign is paused while Inverge reviews a query about the vaccine cold chain specification. Contributions are not being accepted and no funds have been released. We will publish the outcome of the review on this page.",
      createdAt: "2026-12-20T15:00:00.000Z",
      id: "healthreach-update-paused",
      title: "Campaign paused pending an Inverge review",
    },
  ],
});

/* -------------------------------------------------------------------------- */
/* The viewer's own campaigns                                                 */
/* -------------------------------------------------------------------------- */

const campusKonekt = buildCampaign({
  backerCount: 176,
  campaignNumber: "IVG-2026-0042",
  category: "technology",
  taxonomy: { category: "technology", subcategory: "web" },
  closesAt: "2026-08-15T23:59:59.000Z",
  cover: COVERS.campusKonekt,
  creator: {
    bio: "Building CampusKonekt, a marketplace that connects campus businesses with the students already around them.",
    identityVerified: true,
    location: "Lagos State, Nigeria",
    name: "Amara Okonkwo",
    previousCampaigns: 1,
  },
  disclosures: {
    eligibility:
      "Open to backers anywhere Inverge operates. Campus businesses listed on the marketplace have to provide a trading reference, which is a marketplace rule rather than a gate for backers.",
    failurePlan:
      "Funding already succeeded. If a milestone's evidence is rejected, the remaining escrow becomes refundable pro-rata; released tranches are not clawed back.",
    risks:
      "The dependency is campus term cycles. Business onboarding is concentrated in the first weeks of a semester, so a missed window costs a full term. The plan front-loads onboarding tooling so a missed window is recoverable.",
  },
  id: "campaign-campus-konekt",
  location: "Lagos State, Nigeria",
  milestones: [
    {
      allocationBps: 2_500,
      deliverable:
        "Ship vendor onboarding and the order-acceptance flow, and list the first 40 campus businesses.",
      evidence:
        "A list of the 40 listed businesses with their trading references, and a recorded walkthrough of the onboarding flow.",
      expectedAt: "2026-09-10",
      state: "released",
      decision: {
        decidedAt: "2026-09-17T10:00:00.000Z",
        summary:
          "Approved. The business list and the onboarding walkthrough were both attached, and no objections were registered.",
        transaction: null,
      },
      submission: {
        evidence: [
          {
            description:
              "The list of 40 businesses with a trading reference for each, in the order they were onboarded.",
            id: "campus-m1-evidence-list",
            kind: "note",
            label: "First 40 businesses onboarded",
          },
          {
            description:
              "A recorded walkthrough of the vendor onboarding flow, from application to first order accepted.",
            id: "campus-m1-evidence-walkthrough",
            kind: "link",
            label: "Onboarding walkthrough",
          },
        ],
        submittedAt: "2026-09-11T16:40:00.000Z",
      },
      title: "Vendor onboarding and first 40 businesses",
    },
    {
      allocationBps: 2_500,
      deliverable:
        "Ship payments settlement for vendors, including payout reconciliation and dispute handling.",
      evidence:
        "Released settlement module, a reconciliation report covering 30 days of payouts, and the dispute-handling runbook.",
      expectedAt: "2027-01-20",
      state: "upcoming",
      title: "Vendor payments and reconciliation",
    },
    {
      allocationBps: 2_500,
      deliverable:
        "Launch student-side discovery and reach 1,500 active student accounts.",
      evidence:
        "Discovery release notes and a growth report showing active accounts against the target, with the measurement window stated.",
      expectedAt: "2027-04-30",
      state: "upcoming",
      title: "Student discovery and 1,500 active accounts",
    },
    {
      allocationBps: 2_500,
      deliverable:
        "Publish the campus partnership model and the operating runbook for a second campus.",
      evidence:
        "Published partnership terms and a runbook covering recruitment, onboarding and support for a new campus.",
      expectedAt: "2027-07-15",
      state: "upcoming",
      title: "Campus expansion playbook",
    },
  ],
  phase: "delivering",
  publishedAt: "2026-07-01T08:00:00.000Z",
  raised: "1620000",
  slug: "campus-konekt",
  story: {
    beneficiaries:
      "Around 180 campus businesses and the students who buy from them.",
    problem:
      "Campus businesses live on foot traffic and word of mouth, and students have no way to find what is available on their own campus without walking it. Both sides lose: a business cannot plan stock, and a student cannot plan a day.",
    solution:
      "A campus-scoped marketplace with vendor onboarding designed for someone who has never used a dashboard, and settlement that pays out on a schedule a vendor can predict. Payments are the hard part, which is why they are their own milestone rather than a line inside another one.",
    useOfFunds: [
      {
        amount: money("420000"),
        label: "Engineering: onboarding and ordering",
      },
      {
        amount: money("450000"),
        label: "Engineering: payments and settlement",
      },
      { amount: money("380000"), label: "Student discovery and growth" },
      { amount: money("250000"), label: "Operations, support and reporting" },
    ],
  },
  summary:
    "A campus-scoped marketplace that connects campus businesses with the students already around them.",
  target: "1500000",
  title: "CampusKonekt",
  updates: [
    {
      body: "Milestone one was approved and released. The 40 businesses are listed, the onboarding walkthrough is attached to the claim, and no objections were registered during the review window.",
      createdAt: "2026-09-17T10:30:00.000Z",
      id: "campus-update-milestone1",
      milestoneId: "campus-konekt-m1",
      title: "Milestone one approved and released",
    },
    {
      body: "Payments settlement is now in build as its own milestone. It was a line item inside milestone two in the original plan, which would have made the evidence definition ambiguous.",
      createdAt: "2026-09-02T09:00:00.000Z",
      id: "campus-update-scope",
      title: "Payments moved into their own milestone",
    },
    {
      body: "Funding succeeded at USDC 16,200 against a target of USDC 15,000. Terms are locked and the milestone plan is unchanged from the published version.",
      createdAt: "2026-08-16T09:00:00.000Z",
      id: "campus-update-funded",
      title: "Funding succeeded — escrow is active",
    },
  ],
});

const skillCircle = buildCampaign({
  backerCount: null,
  campaignNumber: "DRAFT",
  category: "community",
  closesAt: "2027-04-30T23:59:59.000Z",
  cover: COVERS.skillCircle,
  creator: {
    bio: "Running Skill Circle, a peer learning network for tradespeople in Lagos.",
    identityVerified: true,
    location: "Lagos State, Nigeria",
    name: "Amara Okonkwo",
    previousCampaigns: 1,
  },
  disclosures: {
    eligibility: "",
    failurePlan: "",
    risks: "",
  },
  escrow: {
    objectionThresholdBps: null,
    objectionWindowDays: null,
    perWalletObjectionCapBps: null,
    successFeeBps: null,
    workingCapitalBps: null,
  },
  id: "campaign-skill-circle",
  location: "Lagos State, Nigeria",
  milestones: [
    {
      allocationBps: 3_000,
      deliverable: "",
      evidence: "",
      expectedAt: "2027-06-30",
      state: "upcoming",
      title: "Open the first two learning hubs",
    },
    {
      allocationBps: 4_000,
      deliverable: "",
      evidence: "",
      expectedAt: "2027-08-31",
      state: "upcoming",
      title: "Run the first twelve-week curriculum",
    },
    {
      allocationBps: 3_000,
      deliverable: "",
      evidence: "",
      expectedAt: "2027-11-15",
      state: "upcoming",
      title: "Publish outcomes and the second-cycle plan",
    },
  ],
  phase: "draft",
  slug: "skill-circle",
  story: {
    beneficiaries:
      "Around 120 tradespeople a year, and the apprentices they take on.",
    problem:
      "Tradespeople in Lagos learn their trade by apprenticeship and then stop learning. There is no affordable way to pick up the business side — pricing, records, contracts — that decides whether a good tradesperson stays solvent.",
    solution:
      "Two learning hubs with a twelve-week curriculum taught by working tradespeople rather than trainers. The curriculum is the deliverable, and the outcome report is what makes the second cycle fundable.",
    useOfFunds: [
      { amount: money("360000"), label: "Two learning hub leases and fit-out" },
      {
        amount: money("300000"),
        label: "Curriculum development and facilitator fees",
      },
      {
        amount: money("140000"),
        label: "Materials, tools and learner support",
      },
      {
        amount: money("100000"),
        label: "Monitoring, evaluation and reporting",
      },
    ],
  },
  summary:
    "A peer learning network for Lagos tradespeople, covering the business side of a trade.",
  target: "900000",
  title: "Skill Circle",
});

const naijaCraft = buildCampaign({
  backerCount: null,
  campaignNumber: "IVG-2027-0033",
  category: "creative",
  taxonomy: { category: "crafts", subcategory: null },
  closesAt: "2027-04-15T23:59:59.000Z",
  cover: COVERS.naijacraft,
  creator: {
    bio: "NaijaCraft brings Nigerian artisans to international buyers without a middle layer taking the margin.",
    identityVerified: true,
    location: "Rivers State, Nigeria",
    name: "Amara Okonkwo",
    previousCampaigns: 1,
  },
  id: "campaign-naija-craft",
  location: "Rivers State, Nigeria",
  milestones: [
    {
      allocationBps: 2_500,
      deliverable:
        "Onboard 60 artisans with photographed catalogues and agreed pricing.",
      evidence:
        "Artisan roster with catalogue photographs and signed pricing agreements.",
      expectedAt: "2027-06-15",
      state: "upcoming",
      title: "Onboard 60 artisans",
    },
    {
      allocationBps: 2_500,
      deliverable:
        "Ship export compliance: documentation, packaging standards and shipping partners.",
      evidence:
        "Compliance pack, packaging specification, and signed terms with at least two shipping partners.",
      expectedAt: "2027-08-15",
      state: "upcoming",
      title: "Export compliance and logistics",
    },
    {
      allocationBps: 2_500,
      deliverable:
        "Launch the storefront and complete the first hundred international orders.",
      evidence:
        "Storefront release notes and an order report showing 100 completed orders with destinations.",
      expectedAt: "2027-11-30",
      state: "upcoming",
      title: "Storefront launch and first 100 orders",
    },
    {
      allocationBps: 2_500,
      deliverable:
        "Publish artisan earnings and the second-year sourcing plan.",
      evidence:
        "Earnings report per artisan, and a published sourcing plan with named new regions.",
      expectedAt: "2028-02-28",
      state: "upcoming",
      title: "Earnings report and sourcing plan",
    },
  ],
  phase: "in-review",
  review: { status: "in-review", submittedAt: "2026-10-10T09:00:00.000Z" },
  slug: "naija-craft-marketplace",
  story: {
    beneficiaries:
      "Around 60 artisans in Rivers State and the wider south-east, and the buyers who currently cannot reach them.",
    problem:
      "Nigerian craft sells internationally through intermediaries who take most of the margin and set the price. An artisan with a full order book can still be earning less than the cost of materials, because the price was set by someone three steps away.",
    solution:
      "A direct storefront with export compliance handled once, centrally, rather than by each artisan. The compliance milestone comes before the storefront because an order that cannot be shipped legally is worse than no order.",
    useOfFunds: [
      {
        amount: money("550000"),
        label: "Artisan onboarding and catalogue photography",
      },
      {
        amount: money("550000"),
        label: "Export compliance and packaging standards",
      },
      { amount: money("700000"), label: "Storefront engineering and launch" },
      {
        amount: money("400000"),
        label: "Logistics partnerships and reporting",
      },
    ],
  },
  summary:
    "A direct storefront for Nigerian artisans, with export compliance handled centrally instead of by each maker.",
  target: "2200000",
  title: "NaijaCraft Marketplace",
});

const greenMiles = buildCampaign({
  backerCount: null,
  campaignNumber: "IVG-2027-0041",
  category: "agriculture",
  taxonomy: { category: "food", subcategory: "farms" },
  closesAt: "2027-05-20T23:59:59.000Z",
  cover: COVERS.agroroute,
  creator: {
    bio: "Green Miles moves agricultural produce from farm clusters to markets with a shared logistics fleet.",
    identityVerified: true,
    location: "Benue State, Nigeria",
    name: "Amara Okonkwo",
    previousCampaigns: 1,
  },
  id: "campaign-green-miles",
  location: "Benue State, Nigeria",
  milestones: [
    {
      allocationBps: 3_000,
      deliverable:
        "Acquire and fit out four refrigerated vans for the Benue corridor.",
      evidence:
        "Vehicle invoices and registrations, refrigeration fit-out certificates, and photographs of each completed van.",
      expectedAt: "2027-07-20",
      state: "upcoming",
      title: "Acquire four refrigerated vans",
    },
    {
      allocationBps: 4_000,
      deliverable:
        "Run the first fifty scheduled collection routes with temperature logs.",
      evidence:
        "Route log with dates, collection points and payload, plus the temperature record for each trip.",
      expectedAt: "2027-10-15",
      state: "upcoming",
      title: "First fifty scheduled collection routes",
    },
    {
      allocationBps: 3_000,
      deliverable:
        "Publish spoilage reduction and farmer earnings for the first season.",
      evidence:
        "Season report comparing spoilage and farmgate earnings against the recorded baseline.",
      expectedAt: "2028-01-31",
      state: "upcoming",
      title: "Publish season results against baseline",
    },
  ],
  phase: "changes-requested",
  review: {
    requestedAt: "2026-10-12T14:00:00.000Z",
    status: "changes-requested",
    summary:
      "The second milestone's evidence definition does not say how the temperature record is produced or who can verify it, so a claim could not be assessed against it. State the instrument, the recording interval, and the counter-signatory. The target also needs a cost breakdown that matches the two lines that currently exceed it.",
  },
  slug: "green-miles-logistics",
  story: {
    beneficiaries:
      "Around 700 farmers across three clusters in Benue State, and the traders at the receiving markets.",
    problem:
      "Produce leaves Benue in open vehicles and arrives at market having lost a meaningful share of its value. The farmer bears the loss because the buyer prices the produce on arrival, not on dispatch.",
    solution:
      "A shared refrigerated fleet running fixed collection routes, priced per crate rather than per trip so a farmer with a small volume can use it. The evidence definition for each route is deliberately mechanical, because a claim has to be assessable by someone who was not there.",
    useOfFunds: [
      { amount: money("1400000"), label: "Four refrigerated vans and fit-out" },
      {
        amount: money("1050000"),
        label: "Route operations and driver training",
      },
      {
        amount: money("600000"),
        label: "Cold-chain monitoring and verification",
      },
      {
        amount: money("450000"),
        label: "Farmer onboarding and season reporting",
      },
    ],
  },
  summary:
    "A shared refrigerated collection fleet running fixed routes from Benue farm clusters to market.",
  target: "3500000",
  title: "Green Miles Cold Logistics",
});

const harmattanKiosks = buildCampaign({
  backerCount: 231,
  campaignNumber: "IVG-2026-0011",
  category: "community",
  closesAt: "2026-03-31T23:59:59.000Z",
  cover: COVERS.ecochargeKiosks,
  creator: {
    bio: "Harmattan Health Kiosks place nurse-led consultation points in markets and transport hubs.",
    identityVerified: true,
    location: "Katsina State, Nigeria",
    name: "Amara Okonkwo",
    previousCampaigns: 1,
  },
  disclosures: {
    eligibility:
      "Open to backers anywhere Inverge operates. Kiosk locations are agreed with the local government health authority before installation.",
    failurePlan:
      "Funding already succeeded and every milestone was released, so there is no refundable balance left for this campaign.",
    risks:
      "The main risk is sustained nurse staffing, which is why the third milestone funds a recruitment and retention plan rather than a handover as an afterthought.",
  },
  id: "campaign-harmattan-kiosks",
  location: "Katsina State, Nigeria",
  milestones: [
    {
      allocationBps: 3_000,
      deliverable: "Build and equip four kiosks in markets and transport hubs.",
      evidence:
        "Build invoice, equipment inventory, and dated photographs of each completed kiosk.",
      expectedAt: "2026-05-15",
      state: "released",
      decision: {
        decidedAt: "2026-05-24T11:00:00.000Z",
        summary:
          "Approved. All four kiosks were photographed with their equipment inventories attached. No objections were registered.",
        transaction: null,
      },
      submission: {
        evidence: [
          {
            description:
              "Photographs of all four completed kiosks, taken on the same day, with location captions.",
            id: "harmattan-m1-evidence-photos",
            kind: "photo",
            label: "Kiosk completion photographs",
          },
          {
            description:
              "Equipment inventory for each kiosk, listing every item and its serial number where applicable.",
            id: "harmattan-m1-evidence-inventory",
            kind: "note",
            label: "Equipment inventory",
          },
        ],
        submittedAt: "2026-05-16T09:00:00.000Z",
      },
      title: "Build and equip four kiosks",
    },
    {
      allocationBps: 4_000,
      deliverable:
        "Operate the kiosks for six months and record consultations by service type.",
      evidence:
        "Six-month consultation log with anonymised counts by service, and the referral register.",
      expectedAt: "2026-11-20",
      state: "released",
      decision: {
        decidedAt: "2026-11-28T10:00:00.000Z",
        summary:
          "Approved after review. Two objections were raised about the referral register format, both resolved in the discussion and withdrawn before the window closed.",
        transaction: null,
      },
      submission: {
        evidence: [
          {
            description:
              "The six-month consultation log, with anonymised patient counts by service type.",
            id: "harmattan-m2-evidence-log",
            kind: "note",
            label: "Consultation log",
          },
          {
            description:
              "The referral register showing where each referral went and whether it completed.",
            id: "harmattan-m2-evidence-referrals",
            kind: "note",
            label: "Referral register",
          },
        ],
        submittedAt: "2026-11-21T13:00:00.000Z",
      },
      title: "Operate for six months and record outcomes",
    },
    {
      allocationBps: 3_000,
      deliverable:
        "Publish the outcome report and hand the kiosks to a staffing and maintenance plan.",
      evidence:
        "Published outcome report, a signed staffing agreement, and a maintenance schedule for each kiosk.",
      expectedAt: "2027-02-28",
      state: "released",
      decision: {
        decidedAt: "2027-03-08T09:30:00.000Z",
        summary:
          "Approved. The outcome report, the staffing agreement and the maintenance schedule were all attached. No objections were registered and the campaign is complete.",
        transaction: null,
      },
      submission: {
        evidence: [
          {
            description:
              "The published outcome report, covering consultation volumes and referral completion.",
            id: "harmattan-m3-evidence-report",
            kind: "link",
            label: "Outcome report",
          },
          {
            description:
              "Signed staffing agreement and the maintenance schedule for each of the four kiosks.",
            id: "harmattan-m3-evidence-agreement",
            kind: "note",
            label: "Staffing agreement and maintenance schedule",
          },
        ],
        submittedAt: "2027-03-01T10:00:00.000Z",
      },
      title: "Publish outcomes and hand over staffing",
    },
  ],
  phase: "completed",
  publishedAt: "2026-01-20T08:00:00.000Z",
  raised: "2150000",
  slug: "harmattan-health-kiosks",
  story: {
    beneficiaries:
      "Around 14,000 market and transport-hub users across four sites in Katsina State.",
    problem:
      "Getting a basic consultation means leaving work for most of a day and travelling to a facility. For someone selling in a market, that day is the day's income, so a treatable problem is ignored until it is neither treatable nor cheap.",
    solution:
      "Nurse-led consultation kiosks inside markets and transport hubs, open during trading hours. Anything beyond a basic consultation becomes a documented referral, and the referral register is what makes the second milestone verifiable rather than anecdotal.",
    useOfFunds: [
      { amount: money("600000"), label: "Four kiosks: build and fit-out" },
      {
        amount: money("800000"),
        label: "Equipment, medicines and consumables",
      },
      { amount: money("400000"), label: "Nurse staffing for six months" },
      {
        amount: money("200000"),
        label: "Monitoring, evaluation and reporting",
      },
    ],
  },
  summary:
    "Nurse-led consultation kiosks inside four Katsina markets and transport hubs, open during trading hours.",
  target: "2000000",
  title: "Harmattan Health Kiosks",
  updates: [
    {
      body: "All three milestones have been approved and released. The outcome report, the staffing agreement and the maintenance schedule are attached to the final claim. Thank you to the 231 backers who made this possible.",
      createdAt: "2027-03-08T10:00:00.000Z",
      id: "harmattan-update-complete",
      milestoneId: "harmattan-health-kiosks-m3",
      title: "Campaign complete — every tranche released",
    },
    {
      body: "The six-month consultation log and referral register were submitted. Two objections about the register format were resolved in the discussion and withdrawn before the window closed.",
      createdAt: "2026-11-21T13:30:00.000Z",
      id: "harmattan-update-milestone2",
      milestoneId: "harmattan-health-kiosks-m2",
      title: "Milestone two submitted, then approved",
    },
    {
      body: "HealthReach's four kiosks are open. Consultation volumes for the first month are recorded in the log attached to the next claim.",
      createdAt: "2026-06-02T09:00:00.000Z",
      id: "harmattan-update-open",
      milestoneId: "harmattan-health-kiosks-m1",
      title: "The kiosks are open",
    },
  ],
});

/**
 * Every campaign in the preview, public and creator-owned.
 *
 * Order is irrelevant to the UI: discovery sorts, and the creator list sorts by
 * update recency in its own reader.
 */
export const previewCampaigns: readonly Campaign[] = [
  sungrid,
  farmlink,
  ibadanCreativeLab,
  studymate,
  lagosKitchen,
  healthreach,
  campusKonekt,
  skillCircle,
  naijaCraft,
  greenMiles,
  harmattanKiosks,
];

/** The signed-in viewer's campaigns, by id. */
export const viewerCampaignIds: readonly string[] = [
  "campaign-skill-circle",
  "campaign-naija-craft",
  "campaign-green-miles",
  "campaign-campus-konekt",
  "campaign-harmattan-kiosks",
];

export function findPreviewCampaign(slug: string): Campaign | undefined {
  return previewCampaigns.find((campaign) => campaign.slug === slug);
}

export function findPreviewCampaignById(id: string): Campaign | undefined {
  return previewCampaigns.find((campaign) => campaign.id === id);
}
