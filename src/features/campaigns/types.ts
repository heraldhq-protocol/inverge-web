import type { DiscoveryCategory } from "@/features/home/discovery-categories";
import type { MoneyAmount } from "@/lib/money";

/**
 * Campaign domain model.
 *
 * Every field here is either something the product genuinely knows or an
 * explicit "we do not know". Amounts are `MoneyAmount` — integer atomic units,
 * string maths, never a JS number — and every percentage is stored as integer
 * basis points, so no money or share is ever computed in floating point.
 *
 * The lifecycle is modelled as small closed unions rather than one flat status
 * string, because the product keeps these questions apart on purpose (briefing
 * §4): a listing can be approved and still closed, an escrow tranche can be
 * approved and not yet released, and a payment can succeed while the on-chain
 * contribution is still pending. Collapsing them into one status is how a UI
 * ends up claiming money moved when it has not.
 */

/** The asset a campaign is denominated in (SRS §5, FR-301). USDC is 1:1 with the USD money model. */
export type FundingAsset = "USDC";

/**
 * An asset a contribution may settle in.
 *
 * `cNGN` is modelled because FR-401 names it "where supported"; a campaign that
 * does not support it simply does not list it. Nothing here implies an exchange
 * rate, and no cNGN amount is ever derived from a USD figure.
 */
export type SettlementAsset = "USDC" | "cNGN";

/** Where the funding figures come from. Chain totals are an indexer projection (NFR-08). */
export type FundingSource = "indexed" | "reconciling" | "unavailable";

/** A completed, curtained review of a self-attested creator listing (D-005). */
export type CampaignReview =
  | { status: "not-submitted" }
  | { status: "in-review"; submittedAt: string }
  | {
      status: "changes-requested";
      requestedAt: string;
      /** The reviewer's own words. Never paraphrased by the UI. */
      summary: string;
    }
  | { status: "rejected"; decidedAt: string; reason: string }
  | { status: "approved"; approvedAt: string };

/**
 * The listing's lifecycle position.
 *
 * `unknown` exists so an unrecognised server value fails safe: it renders a
 * neutral "status unavailable" state and never the optimistic branch.
 */
export type CampaignPhase =
  | "draft"
  | "in-review"
  | "changes-requested"
  | "rejected"
  | "funding"
  | "funding-failed"
  | "delivering"
  | "completed"
  | "paused"
  | "unknown";

/**
 * A milestone's lifecycle position (FR-601…FR-607).
 *
 * `approved` and `released` are deliberately separate: approval decides, release
 * moves funds, and they are different events.
 */
export type MilestoneState =
  | "upcoming"
  | "claim-submitted"
  | "objection-window"
  | "approved"
  | "released"
  | "failed"
  | "disputed"
  | "refund-available"
  | "unknown";

/** The provider leg of a payment (FR-402 on-ramp, card/bank rails). */
export type PaymentState =
  | "not-started"
  | "awaiting-provider"
  | "user-action-required"
  | "processing"
  | "succeeded"
  | "failed"
  | "quote-expired"
  | "provider-unavailable";

/** The escrow leg of a contribution — distinct from `PaymentState` by design (FR-503). */
export type ContributionState =
  "none" | "pending" | "confirmed" | "failed" | "reconciling";

/** Refund lifecycle for an all-or-nothing campaign that missed its target (FR-502, FR-506). */
export type RefundState =
  | "not-applicable"
  | "available"
  | "claim-submitted"
  | "processing"
  | "confirmed"
  | "failed";

/** How a creator's released tranche leaves the platform (FR-604/§9 off-ramp). */
export type PayoutState = "not-started" | "pending" | "settled" | "unavailable";

/**
 * A chain reference. Always `null` in this repository: no chain is connected and
 * a signature is never fabricated. The type exists so the field has an honest
 * home the moment the indexer lands.
 */
export type TransactionRef = {
  network: "devnet" | "mainnet-beta";
  signature: string;
};

export type PublicCreator = {
  bio: string;
  /** FR-103 identity verification. Shown as a labelled badge, never as an unqualified "verified". */
  identityVerified: boolean;
  location: string;
  name: string;
  /** Creator's own campaign count, for the accountability strip. */
  previousCampaigns: number;
};

export type MilestoneEvidence = {
  id: string;
  /** "link" opens an external artefact; the other kinds are statements only. */
  kind: "link" | "note" | "photo";
  label: string;
  /** Present only for `link`. Never a fabricated URL. */
  href?: string;
  /** The creator's own description of the proof. */
  description: string;
};

export type MilestoneDecision = {
  decidedAt: string;
  /** Plain-language outcome, authored by the backend, shown verbatim. */
  summary: string;
  /** Null until a finalized transaction exists. */
  transaction: TransactionRef | null;
};

export type CampaignMilestone = {
  id: string;
  sequence: number;
  title: string;
  /** What the milestone actually delivers, in the creator's words. */
  deliverable: string;
  /**
   * Share of the original escrow total (FR-302). Integer basis points so the
   * tranches are exact and sum to 10000 by construction.
   */
  allocationBps: number;
  /** Fixed at approval and immutable afterwards (FR-302). */
  evidence: string;
  /** When the claim is expected; null when the plan is not dated. */
  expectedAt: string | null;
  state: MilestoneState;
  submission: {
    submittedAt: string;
    evidence: readonly MilestoneEvidence[];
  } | null;
  /** FR-602 — the window in which backers may object. */
  objectionClosesAt: string | null;
  /** Weight of objections raised so far, in basis points of that milestone's backers. */
  objectionBps: number;
  decision: MilestoneDecision | null;
};

export type UseOfFundsLine = {
  label: string;
  /** Rounded to the nearest cent; the fixture totals are asserted by test. */
  amount: MoneyAmount;
};

/**
 * How a video is addressed.
 *
 * The kinds are kept apart because they mean different things about the bytes
 * and they render differently: an `upload` is a file Inverge stores, a `direct`
 * link points at a file on someone else's host, and an embed is a player page on
 * a third party's site. The UI must not present a link as though a file had been
 * uploaded, and it never hands a creator's string to an `<iframe>` — a player URL
 * is built from an id that has been parsed and validated.
 */
export type VideoSource =
  /** A file Inverge stores. Only an upload control can produce this. */
  | { kind: "upload"; src: string }
  /** A direct link to a video file on another host. */
  | { kind: "direct"; src: string }
  | { kind: "youtube"; videoId: string }
  | { kind: "vimeo"; videoId: string };

export type CampaignImage = {
  kind: "image";
  id: string;
  /** A same-origin asset path or an `https` URL. Never empty. */
  src: string;
  /** Written for a screen reader, not for a sighted reader. Required. */
  alt: string;
  caption: string | null;
};

export type CampaignVideo = {
  kind: "video";
  id: string;
  source: VideoSource;
  alt: string;
  caption: string | null;
  /** Shown before playback. Null when the creator supplied none. */
  poster: string | null;
};

/**
 * One item of campaign media.
 *
 * An image or a video, and nothing else. A "video" that is only a link to a web
 * page is not playable media, so it has no member here.
 */
export type CampaignMedia = CampaignImage | CampaignVideo;

/**
 * One creator-authored story block.
 *
 * `problem`, `solution`, `beneficiaries`, and `useOfFunds` are the reviewed
 * summary a campaign is approved on, and they stay required. `blocks` is
 * additive: it is the long-form narrative the creator writes themselves, in the
 * order that tells their story. A record with no blocks renders the structured
 * overview exactly as it always has, which is what makes the extension safe for
 * the campaign records that already exist.
 *
 * The vocabulary is closed and has no `html` member: creator content is data the
 * page decides how to render, never a document the page trusts.
 */
export type StoryBlock =
  | { id: string; kind: "heading"; text: string }
  | { id: string; kind: "paragraph"; text: string }
  | { id: string; kind: "list"; ordered: boolean; items: readonly string[] }
  | { id: string; kind: "quote"; text: string; attribution: string | null }
  | { id: string; kind: "note"; title: string; text: string }
  | { id: string; kind: "image"; image: CampaignImage }
  | { id: string; kind: "video"; video: CampaignVideo }
  | { id: string; kind: "gallery"; images: readonly CampaignImage[] };

export type CampaignStory = {
  problem: string;
  solution: string;
  beneficiaries: string;
  useOfFunds: readonly UseOfFundsLine[];
  /** Media the creator attached inside the story. Empty hides the block. */
  media: readonly CampaignMedia[];
  /** The creator's long-form narrative, in their order. Empty renders none. */
  blocks: readonly StoryBlock[];
};

export type CampaignUpdate = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  /** Empty for a general update; set when the update reports on a milestone. */
  milestoneId: string | null;
  attachments: readonly { id: string; label: string; href: string }[];
};

export type CampaignFact = { label: string; value: string };

/**
 * What a reward sends.
 *
 * `mixed` is not two rewards: it is one promise with a digital part and a
 * physical part (a printed report plus digital handover access, say). The flow
 * has to ask for a delivery destination for the physical part without asking the
 * wrong questions about the digital one, so the distinction is in the model
 * rather than left to a description.
 */
export type RewardFulfilment = "digital" | "physical" | "mixed";

/** ISO 3166-1 alpha-2. Validated against `@/lib/countries`; never free text. */
export type CountryCode = string;

/**
 * A creator-named group of countries — "West Africa", "the EU", "diaspora by
 * post".
 *
 * Inverge ships no continent table of its own, so a region is only ever the
 * creator's own definition of one. That is deliberate: a hand-maintained
 * country-to-continent mapping is exactly the kind of dataset that quietly
 * mis-classifies a country, and a mis-classified destination is a parcel that
 * does not arrive.
 */
export type ShippingZone = {
  id: string;
  name: string;
  countries: readonly CountryCode[];
};

/**
 * What one shipping rule covers.
 *
 * `origin` is the creator's own country, which is why it is a member rather than
 * a note: shipping inside Nigeria is a different price from shipping to Ghana,
 * and the creator should not have to retype the country they are already in.
 */
export type ShippingCoverage =
  | { kind: "worldwide" }
  | { kind: "zone"; zoneId: string }
  | { kind: "country"; country: CountryCode }
  | { kind: "origin" };

/**
 * What a covered destination is charged for postage.
 *
 * Only `free` and `flat` carry a figure. `deferred` is the creator saying they
 * will bill postage later — it is never used as a fallback because a rate failed
 * to load. `unavailable` is how a creator excludes a destination, and `note` is
 * where they say why, so the exclusion is explained rather than merely refused.
 *
 * `basis` exists because neither assumption is safe: some creators add postage
 * per parcel and some absorb it into one shipment. It is the creator's
 * declaration, never something inferred from a quantity.
 */
export type ShippingRate =
  | { kind: "free" }
  | { kind: "flat"; amount: MoneyAmount; basis: "order" | "unit" }
  | { kind: "deferred"; note: string | null }
  | { kind: "unavailable"; note: string | null };

/**
 * One row of a reward's shipping policy.
 *
 * Rules are evaluated in order and the first match wins, which is what makes an
 * exclusion possible: a creator puts "Brazil — we cannot ship there" above a
 * worldwide rule, and the worldwide rule can never silently override it.
 */
export type ShippingRule = {
  id: string;
  coverage: ShippingCoverage;
  rate: ShippingRate;
};

/**
 * How a creator will send a physical reward.
 *
 * Everything here is creator-declared. Inverge holds no carrier integration, so
 * it never quotes a destination itself — it applies the policy the creator
 * published, and a destination the policy does not cover is reported as not
 * covered rather than priced with a guess.
 *
 * `customs` is a statement, never an amount. Inverge does not calculate duties
 * and does not collect or remit them.
 */
export type RewardShipping = {
  /**
   * The creator's own country, so a rule can say "inside my country" without the
   * creator retyping it. Null when they have not said.
   */
  originCountry: CountryCode | null;
  /** The named groups of countries a rule can cover. */
  zones: readonly ShippingZone[];
  /** The policy, in priority order. First match wins. */
  rules: readonly ShippingRule[];
  /** The creator's own fulfilment terms, e.g. "posted from Lagos in April". */
  terms: string | null;
  /** What the creator says about import duty, verbatim. Never a derived figure. */
  customs: string | null;
};

/** One choice inside a variant group, e.g. "Amber" inside "Lantern colour". */
export type RewardVariantOption = { id: string; label: string };

/**
 * A choice a backer must make before the reward can be sent, e.g. size or
 * colour. A group exists only where the creator added one, and a group that
 * exists must be chosen from: an unanswered variant is not a default we pick.
 */
export type RewardVariantGroup = {
  id: string;
  /** What is being chosen, e.g. "Size". */
  label: string;
  options: readonly RewardVariantOption[];
};

/**
 * Something a backer can take on top of a reward.
 *
 * Add-ons belong to the reward rather than to the campaign because they are
 * priced and shipped under that reward's own policy. `affectsShipping` is the
 * creator saying whether taking one needs its own parcel; a digital add-on can
 * never set it, so a download is never charged postage.
 */
export type RewardAddOn = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  price: MoneyAmount;
  fulfilment: RewardFulfilment;
  /** True only when this add-on needs postage of its own. */
  affectsShipping: boolean;
  estimatedDelivery: string | null;
};

/**
 * An optional reward tier.
 *
 * Campaigns are rewards- or donation-based (SRS §5). A campaign with no tiers is
 * donation-based and the UI says so rather than showing an empty box. The tier
 * changes what the creator promises to send, never the amount that is charged —
 * a contribution is valid at any amount either way.
 *
 * Delivery is the creator's own estimate, so it is rendered as an estimate and
 * never as a guarantee. `image` is a same-origin asset path or an `https` URL;
 * when a tier has no artwork the card draws its own mark rather than
 * substituting a stock photograph that belongs to another project.
 */
export type SupportTier = {
  id: string;
  title: string;
  minimum: MoneyAmount;
  description: string;
  /** What the backer gets, one line each. Empty when the description says it all. */
  includes: readonly string[];
  image: string | null;
  /** What the campaign sends, when the creator said. A reward is never equity. */
  fulfilment: RewardFulfilment | null;
  /** The creator's own estimate, e.g. "2 weeks after the funding deadline". */
  estimatedDelivery: string | null;
  /**
   * Non-null exactly when something has to be posted: the reward is `physical`
   * or `mixed`, or one of its add-ons needs a parcel of its own. A reward with
   * nothing physical carries `null`, so a shipping line can never appear where
   * nothing ships — and a download with a printed add-on still gets the policy
   * that add-on needs.
   */
  shipping: RewardShipping | null;
  /**
   * Choices the backer must make, e.g. size. Empty when there are none, and the
   * backing flow then asks for no variant at all.
   */
  variants: readonly RewardVariantGroup[];
  /** Extras that can be added to this reward. Empty hides the section entirely. */
  addOns: readonly RewardAddOn[];
  /**
   * The most units one backer may take. Null or 1 means a single unit and the
   * backing flow shows no quantity control, so a number is only ever the
   * creator's own limit rather than one the platform invented.
   */
  quantityLimit: number | null;
};

/** A question the campaign answers itself. Authored upstream; shown verbatim. */
export type CampaignFaq = { id: string; question: string; answer: string };

/**
 * Eligibility and risk disclosure, authored by the creator and reviewed before
 * publication. Present so a backer can read the constraints without asking.
 */
export type CampaignDisclosures = {
  /** Who may contribute and any regional restriction. */
  eligibility: string;
  /** What has to be true for the plan to work. */
  risks: string;
  /** What happens to a contribution if the campaign fails (FR-502). */
  failurePlan: string;
};

/**
 * The escrow rules a campaign publishes.
 *
 * Held per campaign rather than as module constants: the SRS gives ranges, and
 * a UI that prints a platform-wide "20%" would be inventing a term. A campaign
 * that has not published a term uses `null` and the UI says so.
 */
export type EscrowTerms = {
  /** Working-capital advance against milestone one, sized to its budget (FR-503a). */
  workingCapitalBps: number | null;
  /** The cap the advance may not exceed. */
  workingCapitalCapBps: number | null;
  /** Backer objection window in days (FR-602). */
  objectionWindowDays: number | null;
  /** Objection weight that fails a claim (FR-603). */
  objectionThresholdBps: number | null;
  /** Per-wallet cap on objection weight (FR-604). */
  perWalletObjectionCapBps: number | null;
  /** Fee transferred to the platform treasury on tranche release (FR-505). */
  successFeeBps: number | null;
};

export type Campaign = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: DiscoveryCategory;
  location: string;
  /** Local artwork path or null; `Cover` renders the branded fallback either way. */
  cover: string | null;
  creator: PublicCreator;
  phase: CampaignPhase;
  review: CampaignReview;
  funding: {
    source: FundingSource;
    /** Null when `source` is not `indexed` — never a stand-in zero. */
    raised: MoneyAmount | null;
    backerCount: number | null;
    target: MoneyAmount;
    fundingAsset: FundingAsset;
    supportedSettlementAssets: readonly SettlementAsset[];
    /** ISO UTC close of the funding window (FR-305). */
    closesAt: string;
  };
  milestones: readonly CampaignMilestone[];
  /**
   * The hero gallery, in the creator's own order. A video is preferred at the
   * top but never required. Empty falls back to `cover`, and an absent cover
   * falls back to the branded placeholder, so an image-less campaign still
   * renders.
   */
  media: readonly CampaignMedia[];
  story: CampaignStory;
  /** Empty for a donation-based campaign. */
  supportTiers: readonly SupportTier[];
  faqs: readonly CampaignFaq[];
  disclosures: CampaignDisclosures;
  updates: readonly CampaignUpdate[];
  escrow: EscrowTerms;
  /** Narrative facts shown on the detail page. Prose labels, no invented figures. */
  facts: readonly CampaignFact[];
  /** Explicit editorial designation, never inferred from performance (FR-206a). */
  featured: boolean;
  publishedAt: string | null;
  /** True for every record in this repository. Drives the preview notices. */
  demo: true;
};

/** A backer's contribution and each leg of its lifecycle. */
export type Contribution = {
  id: string;
  campaignId: string;
  campaignSlug: string;
  campaignTitle: string;
  cover: string | null;
  creator: string;
  submittedAt: string;
  amount: MoneyAmount;
  fundingAsset: FundingAsset;
  /** How the money was tendered. `usdc-wallet` needs no conversion and no rate. */
  route: "usdc-wallet" | "fiat-on-ramp";
  /** The fiat leg, present only when the route is an on-ramp. */
  fiatLeg: {
    currency: "NGN";
    /** Kobo, integer, string. Present only when a real quote existed. */
    atomic: string;
    /** The quote's expiry, so a stale total can never be shown as current. */
    quoteExpiresAt: string;
    quoteStatus: "current" | "expired" | "unavailable";
  } | null;
  payment: {
    state: PaymentState;
    /** Coarse, non-identifying label, e.g. "Naira card". Null when not applicable. */
    method: string | null;
    /** The provider's own reference. Null in this repository. */
    providerReference: string | null;
  };
  contribution: {
    state: ContributionState;
    confirmedAt: string | null;
    transaction: TransactionRef | null;
  };
  refund: {
    state: RefundState;
    reason: string | null;
    eligibleAmount: MoneyAmount | null;
    claimSubmittedAt: string | null;
    confirmedAt: string | null;
    transaction: TransactionRef | null;
  };
  /** Frustration paths — what a backer can actually do from this record. */
  support: {
    /** Ids of posts in the campaign's update feed related to this record. */
    relatedUpdateIds: readonly string[];
  };
};

/** A creator-owned campaign row, as the workspace list needs it. */
export type CreatorCampaignSummary = {
  campaignId: string;
  slug: string;
  title: string;
  category: DiscoveryCategory;
  phase: CampaignPhase;
  cover: string | null;
  target: MoneyAmount;
  raised: MoneyAmount | null;
  backerCount: number | null;
  closesAt: string;
  publishedAt: string | null;
  /** Plain-language next action, authored upstream. Drives the row's primary link. */
  nextAction: string;
  /** Set when the review union has something the creator must answer. */
  reviewNote: string | null;
  milestoneProgress: { released: number; total: number } | null;
  updatedAt: string;
};

/** Creator escrow summary: released stablecoin is not the same as settled fiat (FR-604/§9). */
export type CreatorEscrowSummary = {
  campaignId: string;
  target: MoneyAmount;
  raised: MoneyAmount | null;
  totalReleased: MoneyAmount;
  totalPending: MoneyAmount;
  totalRefunded: MoneyAmount;
  payout: {
    state: PayoutState;
    /** Non-identifying destination label, e.g. "Your connected wallet". */
    destinationLabel: string;
    lastSettledAt: string | null;
  };
};

/** One milestone's live workload, as the milestone manager needs it. */
export type MilestoneWorkload = {
  milestoneId: string;
  sequence: number;
  title: string;
  allocationBps: number;
  tranche: MoneyAmount;
  state: MilestoneState;
  /** What the creator must supply next, in plain language. */
  requiredAction: string;
  /** True when the deliverable can be submitted from this screen today. */
  canSubmit: boolean;
  /** Explains why submission is closed when `canSubmit` is false. */
  blockedReason: string | null;
};

/** Discovery filters, all serialisable to the query string. */
export type CampaignSort =
  "ending-soon" | "most-funded" | "newest" | "recently-updated";

export type CampaignPhaseFilter =
  "all" | "funding" | "live-delivery" | "successful" | "unsuccessful";

export type CampaignCategoryFilter = "all" | DiscoveryCategory;

export type CampaignFilters = {
  category: CampaignCategoryFilter;
  phase: CampaignPhaseFilter;
  query: string;
  sort: CampaignSort;
  view: "grid" | "list";
};

/** Shared data-source flag. Every `server/` reader returns this so every surface can label itself. */
export type DataSource = "preview";

export const CAMPAIGN_SORTS = [
  "ending-soon",
  "most-funded",
  "newest",
  "recently-updated",
] as const satisfies readonly CampaignSort[];

export const CAMPAIGN_PHASE_FILTERS = [
  "all",
  "funding",
  "live-delivery",
  "successful",
  "unsuccessful",
] as const satisfies readonly CampaignPhaseFilter[];

export const CAMPAIGN_VIEWS = ["grid", "list"] as const satisfies readonly (
  "grid" | "list"
)[];

export function isCampaignSort(value: string): value is CampaignSort {
  return (CAMPAIGN_SORTS as readonly string[]).includes(value);
}

export function isCampaignPhaseFilter(
  value: string,
): value is CampaignPhaseFilter {
  return (CAMPAIGN_PHASE_FILTERS as readonly string[]).includes(value);
}

export function isCampaignView(value: string): value is "grid" | "list" {
  return (CAMPAIGN_VIEWS as readonly string[]).includes(value);
}
