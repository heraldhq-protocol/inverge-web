import {
  bpsOf,
  formatBps,
  parsePercentToBps,
  sumBps,
  TOTAL_BPS,
} from "@/features/campaigns/lib/amounts";
import {
  WORKING_CAPITAL_BPS,
  WORKING_CAPITAL_PERCENT,
} from "@/features/campaigns/lib/escrow";
import {
  MAX_HERO_MEDIA,
  MAX_STORY_MEDIA,
  MIN_MEDIA_ALT,
  parseImageSource,
  parseVideoSource,
} from "@/features/campaigns/lib/media";
import { hasPhysicalPart } from "@/features/campaigns/lib/shipping";
import type {
  Campaign,
  CampaignMedia,
  CountryCode,
  RewardAddOn,
  RewardFulfilment,
  RewardShipping,
  RewardVariantGroup,
  ShippingCoverage,
  ShippingRate,
  ShippingRule,
  ShippingZone,
  SupportTier,
  VideoSource,
} from "@/features/campaigns/types";
import {
  isCampaignCategorySlug,
  isCampaignSubcategoryOf,
  type CampaignCategorySlug,
  type CampaignSubcategorySlug,
} from "@/features/campaigns/lib/taxonomy";
import { parseUsdAmount, sumMoneyAmounts, type MoneyAmount } from "@/lib/money";

/**
 * The creator's campaign draft and its validation.
 *
 * The draft is the shape the wizard edits and the shape an edit screen loads
 * back from a published campaign. Percentages are held as the creator's raw
 * input and converted to basis points for every calculation, so the plan total
 * is an exact integer rather than an accumulation of float error.
 *
 * Two product rules the wizard must respect rather than work around: a campaign
 * needs an ordered 2–6 milestone plan whose tranches total 100% (FR-301,
 * FR-302), and a published campaign's milestone and evidence definitions are
 * immutable (FR-303), so edit mode locks them.
 *
 * Media is held as a list of links because no file storage is connected yet. The
 * step is optional — a campaign without media falls back to its cover — but any
 * item that is attached has to parse and be described.
 */

export type CampaignWizardStepId =
  | "basics"
  | "media"
  | "funding"
  | "milestones"
  | "rewards"
  | "terms"
  | "review";

export type CampaignWizardStep = {
  id: CampaignWizardStepId;
  title: string;
  description: string;
};

export const campaignWizardSteps: readonly CampaignWizardStep[] = [
  {
    description: "What you are building, who it is for, and where it happens.",
    id: "basics",
    title: "The campaign",
  },
  {
    description:
      "A video or photo for the top of the page, and anything you want to show inside the story.",
    id: "media",
    title: "Media",
  },
  {
    description:
      "Your target in USDC, the deadline, and how the money would be spent.",
    id: "funding",
    title: "Funding",
  },
  {
    description:
      "Two to six milestones, each with a deliverable and the evidence you will submit. The weights divide what remains after the fixed 20% working-capital tranche.",
    id: "milestones",
    title: "Milestone plan",
  },
  {
    description:
      "Optional. What a backer may receive, and how a physical one reaches them.",
    id: "rewards",
    title: "Rewards",
  },
  {
    description:
      "Eligibility, risks, and what happens if the target is not reached.",
    id: "terms",
    title: "Terms and disclosures",
  },
  {
    description: "Check everything, then see what submission requires.",
    id: "review",
    title: "Review",
  },
];

export type DraftMilestone = {
  id: string;
  title: string;
  deliverable: string;
  /** The creator's own percentage input, converted to bps for every calculation. */
  allocationPercent: string;
  evidence: string;
  expectedAt: string;
};

export type DraftUseOfFunds = {
  id: string;
  label: string;
  amountInput: string;
};

/** A named group of countries as the wizard edits it. */
export type DraftShippingZone = {
  id: string;
  name: string;
  /** ISO 3166-1 alpha-2 codes, chosen from the shared country list. */
  countries: readonly CountryCode[];
};

/**
 * A rule's coverage as the wizard edits it.
 *
 * A country rule can be half-finished — the creator chose "one country" before
 * choosing which — so the code is allowed to be empty here and is rejected by
 * validation rather than by the type. Everything else about the coverage is a
 * closed choice, because there is no other kind of destination.
 */
export type DraftShippingCoverage =
  | { kind: "worldwide" }
  | { kind: "origin" }
  | { kind: "country"; country: CountryCode | "" }
  | { kind: "zone"; zoneId: string };

export type DraftShippingRateKind =
  "free" | "flat" | "deferred" | "unavailable";

/**
 * One shipping rule as the wizard edits it.
 *
 * The price model and its amount are two fields rather than one union so that
 * switching a rule from "flat rate" to "billed later" and back does not lose the
 * number the creator typed. `amountInput` is raw for the same reason every other
 * amount in this file is: the field has to show what was typed, including a
 * value that is not yet valid.
 */
export type DraftShippingRule = {
  id: string;
  coverage: DraftShippingCoverage;
  rateKind: DraftShippingRateKind;
  amountInput: string;
  /** Whether a flat rate is for the whole order or for each unit in it. */
  basis: "order" | "unit";
  /** The creator's own words for a deferred or refused destination. */
  note: string;
};

/**
 * A reward as the wizard edits it.
 *
 * `imageInput` is held raw, like a media source, so an unfinished or invalid
 * address stays visible instead of being silently dropped. Destinations are
 * structured — countries from the shared list, in rules the creator orders —
 * because a destination that is not a real place is a parcel that does not
 * arrive, and because the order of the rules is what makes an exclusion work.
 *
 * Variants and add-ons are carried rather than edited: the wizard has no control
 * for creating them yet, so a published reward that has them must not lose them
 * by round-tripping through an edit screen.
 */
export type DraftSupportTier = {
  id: string;
  title: string;
  minimumInput: string;
  description: string;
  /** A reward image link or asset path. Empty means no artwork. */
  imageInput: string;
  /** What the reward sends. Empty until the creator chooses. */
  fulfilment: "" | RewardFulfilment;
  estimatedDelivery: string;
  /** What the backer gets, one per line; converted with `parseLines`. */
  includesInput: string;
  /** Blank means a single unit. Converted with `parseQuantityLimit`. */
  quantityLimitInput: string;
  /** Preserved from the campaign. Not editable in the wizard. */
  variants: readonly RewardVariantGroup[];
  /** Preserved from the campaign. Not editable in the wizard. */
  addOns: readonly RewardAddOn[];
  /** The country the creator posts from, or empty when they have not said. */
  shippingOriginCountry: CountryCode | "";
  shippingZones: DraftShippingZone[];
  shippingRules: DraftShippingRule[];
  /** The creator's own fulfilment terms. Only meaningful for a physical part. */
  shippingTerms: string;
  /** What the creator says about import duty, verbatim. Never a figure. */
  shippingCustoms: string;
};

/**
 * Media as the wizard edits it.
 *
 * The source is held as the creator's raw input rather than as a parsed
 * `VideoSource`, for the same reason percentages are held as the creator's own
 * string: the field has to show exactly what was typed, including a value that is
 * not yet valid, and parsing happens once at the point the value is used.
 */
export type DraftMedia = {
  id: string;
  kind: "image" | "video";
  /** An image link or asset path, or a video link, depending on `kind`. */
  srcInput: string;
  alt: string;
  caption: string;
  /** An optional poster image for a video. Ignored for an image. */
  posterInput: string;
};

export type CampaignDraft = {
  title: string;
  summary: string;
  category: CampaignCategorySlug | "";
  subcategory: CampaignSubcategorySlug | "";
  location: string;
  problem: string;
  solution: string;
  beneficiaries: string;
  /** The hero gallery. The first item is the poster a backer sees first. */
  heroMedia: DraftMedia[];
  /** Media placed inside the story. */
  storyMedia: DraftMedia[];
  targetInput: string;
  /** ISO date, `yyyy-mm-dd`, as a date input produces. */
  deadline: string;
  useOfFunds: DraftUseOfFunds[];
  milestones: DraftMilestone[];
  supportTiers: DraftSupportTier[];
  eligibility: string;
  risks: string;
  failurePlan: string;
  workingCapitalPercent: string;
  objectionWindowDays: string;
  successFeePercent: string;
  updatedAt: string;
};

let draftSequence = 0;

/** Stable ids without a dependency, so React keys and edits survive re-renders. */
export function nextDraftId(prefix: string): string {
  draftSequence += 1;
  return `${prefix}-${draftSequence}`;
}

export function createDraftMilestone(allocationPercent = ""): DraftMilestone {
  return {
    allocationPercent,
    deliverable: "",
    evidence: "",
    expectedAt: "",
    id: nextDraftId("milestone"),
    title: "",
  };
}

export function createDraftMedia(
  kind: DraftMedia["kind"] = "image",
): DraftMedia {
  return {
    alt: "",
    caption: "",
    id: nextDraftId("media"),
    kind,
    posterInput: "",
    srcInput: "",
  };
}

export function createDraftTier(): DraftSupportTier {
  return {
    addOns: [],
    description: "",
    estimatedDelivery: "",
    fulfilment: "",
    id: nextDraftId("tier"),
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
  };
}

export function createDraftShippingZone(): DraftShippingZone {
  return { countries: [], id: nextDraftId("zone"), name: "" };
}

export function createDraftShippingRule(): DraftShippingRule {
  return {
    amountInput: "",
    basis: "order",
    coverage: { kind: "worldwide" },
    id: nextDraftId("rule"),
    note: "",
    rateKind: "flat",
  };
}

/**
 * The creator's own lines as the model holds them.
 *
 * One entry per line, blanks dropped. Used for what a backer receives, where the
 * order and the wording are the creator's and there is nothing to normalise.
 */
export function parseLines(input: string): string[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * How many of a reward one backer may take, or null for the single-unit default.
 *
 * A blank field, and a field holding "1", both mean one — the creator who does
 * not think about quantity is never blocked by a question they did not ask. A
 * value that is not a whole number of at least one is null here and reported by
 * the rewards step, so the model can never hold a limit the creator did not mean.
 */
export function parseQuantityLimit(input: string): number | null {
  const trimmed = input.trim();
  if (!/^\d+$/.test(trimmed)) return null;

  const value = Number(trimmed);
  return value >= 2 ? value : null;
}

export const emptyCampaignDraft: CampaignDraft = {
  beneficiaries: "",
  category: "",
  subcategory: "",
  deadline: "",
  eligibility: "",
  failurePlan: "",
  heroMedia: [],
  location: "",
  milestones: [createDraftMilestone("50"), createDraftMilestone("50")],
  objectionWindowDays: "7",
  problem: "",
  risks: "",
  solution: "",
  storyMedia: [],
  successFeePercent: "5",
  summary: "",
  supportTiers: [],
  targetInput: "",
  title: "",
  updatedAt: "",
  useOfFunds: [],
  workingCapitalPercent: WORKING_CAPITAL_PERCENT,
};

/** Load a published campaign back into the wizard for editing (FR-303 locks the plan). */
export function draftFromCampaign(campaign: Campaign): CampaignDraft {
  return {
    beneficiaries: campaign.story.beneficiaries,
    category: campaign.taxonomy?.category ?? "",
    subcategory: campaign.taxonomy?.subcategory ?? "",
    deadline: campaign.funding.closesAt.slice(0, 10),
    eligibility: campaign.disclosures.eligibility,
    failurePlan: campaign.disclosures.failurePlan,
    heroMedia: draftMediaFrom(campaign.media),
    location: campaign.location,
    milestones: campaign.milestones.map((milestone) => ({
      allocationPercent: formatBpsNumber(milestone.allocationBps),
      deliverable: milestone.deliverable,
      evidence: milestone.evidence,
      expectedAt: milestone.expectedAt?.slice(0, 10) ?? "",
      id: milestone.id,
      title: milestone.title,
    })),
    objectionWindowDays:
      campaign.escrow.objectionWindowDays === null
        ? ""
        : String(campaign.escrow.objectionWindowDays),
    problem: campaign.story.problem,
    risks: campaign.disclosures.risks,
    solution: campaign.story.solution,
    storyMedia: draftMediaFrom(campaign.story.media),
    successFeePercent:
      campaign.escrow.successFeeBps === null
        ? ""
        : formatBpsNumber(campaign.escrow.successFeeBps),
    summary: campaign.summary,
    supportTiers: campaign.supportTiers.map(draftTierFrom),
    targetInput: wholeUnits(campaign.funding.target),
    title: campaign.title,
    updatedAt: campaign.publishedAt ?? "",
    useOfFunds: campaign.story.useOfFunds.map((line) => ({
      amountInput: wholeUnits(line.amount),
      id: nextDraftId("funds"),
      label: line.label,
    })),
    workingCapitalPercent: WORKING_CAPITAL_PERCENT,
  };
}

/** A percentage string without a trailing `%`, e.g. "20" or "12.5". */
export function formatBpsNumber(bps: number): string {
  return (bps / 100).toFixed(2).replace(/\.?0+$/, "");
}

export function wholeUnits(amount: MoneyAmount): string {
  return (BigInt(amount.atomic) / 10n ** BigInt(amount.decimals)).toString();
}

/**
 * Loads a published or persisted reward tier back into the wizard's editable
 * shape. The inverse of `toSupportTiers`; shared by edit mode and by resuming a
 * saved draft so both paths round-trip through the same mapping.
 */
export function draftTierFrom(tier: SupportTier): DraftSupportTier {
  return {
    addOns: tier.addOns,
    description: tier.description,
    estimatedDelivery: tier.estimatedDelivery ?? "",
    fulfilment: tier.fulfilment ?? "",
    id: tier.id,
    imageInput: tier.image ?? "",
    includesInput: tier.includes.join("\n"),
    minimumInput: wholeUnits(tier.minimum),
    quantityLimitInput:
      tier.quantityLimit === null ? "" : String(tier.quantityLimit),
    shippingCustoms: tier.shipping?.customs ?? "",
    shippingOriginCountry: tier.shipping?.originCountry ?? "",
    shippingRules: (tier.shipping?.rules ?? []).map((rule) => ({
      amountInput:
        rule.rate.kind === "flat" ? wholeUnits(rule.rate.amount) : "",
      basis: rule.rate.kind === "flat" ? rule.rate.basis : "order",
      coverage: rule.coverage,
      id: rule.id,
      note:
        rule.rate.kind === "deferred" || rule.rate.kind === "unavailable"
          ? (rule.rate.note ?? "")
          : "",
      rateKind: rule.rate.kind,
    })),
    shippingTerms: tier.shipping?.terms ?? "",
    shippingZones: (tier.shipping?.zones ?? []).map((zone) => ({
      countries: [...zone.countries],
      id: zone.id,
      name: zone.name,
    })),
    title: tier.title,
    variants: tier.variants,
  };
}

function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

/** The link a parsed source round-trips through, so an edit shows a real URL. */
function videoSourceInput(source: VideoSource): string {
  switch (source.kind) {
    case "youtube":
      return `https://www.youtube.com/watch?v=${source.videoId}`;
    case "vimeo":
      return `https://vimeo.com/${source.videoId}`;
    case "upload":
    case "direct":
      return source.src;
  }
}

function draftMediaFrom(media: readonly CampaignMedia[]): DraftMedia[] {
  return media.map((item) => ({
    alt: item.alt,
    caption: item.caption ?? "",
    id: item.id,
    kind: item.kind,
    posterInput: item.kind === "video" ? (item.poster ?? "") : "",
    srcInput: item.kind === "image" ? item.src : videoSourceInput(item.source),
  }));
}

/**
 * The draft's media as the model would hold it.
 *
 * An item that does not parse, or that has no alt text, is dropped rather than
 * guessed at: this is the shape a submission would carry, so an unusable item
 * must not survive into it. The media step validates the same rules, so a
 * campaign that passes that step loses nothing here.
 */
export function toCampaignMedia(
  items: readonly DraftMedia[],
): readonly CampaignMedia[] {
  const media: CampaignMedia[] = [];

  for (const item of items) {
    const alt = item.alt.trim();
    if (!alt) continue;

    if (item.kind === "image") {
      const parsed = parseImageSource(item.srcInput);
      if (!parsed.ok) continue;

      media.push({
        alt,
        caption: blankToNull(item.caption),
        id: item.id,
        kind: "image",
        src: parsed.src,
      });
      continue;
    }

    const parsed = parseVideoSource(item.srcInput);
    if (!parsed.ok) continue;

    const poster = parseImageSource(item.posterInput);

    media.push({
      alt,
      caption: blankToNull(item.caption),
      id: item.id,
      kind: "video",
      poster: poster.ok ? poster.src : null,
      source: parsed.source,
    });
  }

  return media;
}

/** Whether a reward's fulfilment means something has to be shipped. */
export function isPhysicalReward(fulfilment: "" | RewardFulfilment): boolean {
  return hasPhysicalPart(fulfilment === "" ? null : fulfilment);
}

/** Whether a reward ships at all — itself, or because one of its add-ons does. */
export function tierNeedsShipping(tier: DraftSupportTier): boolean {
  return (
    isPhysicalReward(tier.fulfilment) ||
    tier.addOns.some((addOn) => addOn.affectsShipping)
  );
}

/** The zones a draft tier keeps: a name and at least one country. */
function draftZones(tier: DraftSupportTier): ShippingZone[] {
  const zones: ShippingZone[] = [];

  for (const zone of tier.shippingZones) {
    const name = zone.name.trim();
    if (!name || zone.countries.length === 0) continue;

    zones.push({ countries: [...zone.countries], id: zone.id, name });
  }

  return zones;
}

function draftCoverage(
  coverage: DraftShippingCoverage,
  zoneIds: ReadonlySet<string>,
): ShippingCoverage | null {
  switch (coverage.kind) {
    case "worldwide":
      return { kind: "worldwide" };
    case "origin":
      return { kind: "origin" };
    case "country":
      return coverage.country === ""
        ? null
        : { country: coverage.country, kind: "country" };
    case "zone":
      // A rule pointing at a zone the draft no longer keeps is dropped rather
      // than widened to everything.
      return zoneIds.has(coverage.zoneId)
        ? { kind: "zone", zoneId: coverage.zoneId }
        : null;
  }
}

function draftRate(rule: DraftShippingRule): ShippingRate | null {
  switch (rule.rateKind) {
    case "free":
      return { kind: "free" };
    case "flat": {
      const atomic = parseUsdAmount(rule.amountInput);
      return atomic === null
        ? null
        : {
            amount: { atomic, currency: "USD", decimals: 2 },
            basis: rule.basis,
            kind: "flat",
          };
    }
    case "deferred":
      return { kind: "deferred", note: blankToNull(rule.note) };
    case "unavailable":
      return { kind: "unavailable", note: blankToNull(rule.note) };
  }
}

/**
 * The shipping policy a draft tier describes, or null when nothing is posted.
 *
 * Only rules that are complete survive: a half-filled rule is dropped here and
 * reported by the rewards step, so the model never carries a destination with no
 * meaning — but the creator still sees the row they need to finish.
 */
export function draftShipping(tier: DraftSupportTier): RewardShipping | null {
  if (!tierNeedsShipping(tier)) return null;

  const zones = draftZones(tier);
  const zoneIds = new Set(zones.map((zone) => zone.id));
  const rules: ShippingRule[] = [];

  for (const rule of tier.shippingRules) {
    const coverage = draftCoverage(rule.coverage, zoneIds);
    if (!coverage) continue;

    const rate = draftRate(rule);
    if (!rate) continue;

    rules.push({ coverage, id: rule.id, rate });
  }

  return {
    customs: blankToNull(tier.shippingCustoms),
    originCountry:
      tier.shippingOriginCountry === "" ? null : tier.shippingOriginCountry,
    rules,
    terms: blankToNull(tier.shippingTerms),
    zones,
  };
}

/**
 * The draft's reward tiers as the model would hold them.
 *
 * A tier without a title or a readable amount is dropped rather than guessed at,
 * for the same reason an unusable media item is: this is the shape a submission
 * would carry. `shipping` is attached whenever something has to be posted, which
 * includes an otherwise digital reward carrying a printed add-on, so the postage
 * that add-on needs still has a policy. An image that does not parse becomes
 * `null` — the card draws its own mark rather than the page pointing a browser
 * at an address the creator mistyped.
 */
export function toSupportTiers(
  tiers: readonly DraftSupportTier[],
): readonly SupportTier[] {
  const result: SupportTier[] = [];

  for (const tier of tiers) {
    const title = tier.title.trim();
    const atomic = parseUsdAmount(tier.minimumInput);
    if (!title || atomic === null) continue;

    const image = parseImageSource(tier.imageInput);

    result.push({
      addOns: tier.addOns,
      description: tier.description.trim(),
      estimatedDelivery: blankToNull(tier.estimatedDelivery),
      fulfilment: tier.fulfilment === "" ? null : tier.fulfilment,
      id: tier.id,
      image: image.ok ? image.src : null,
      includes: parseLines(tier.includesInput),
      minimum: { atomic, currency: "USD", decimals: 2 },
      quantityLimit: parseQuantityLimit(tier.quantityLimitInput),
      shipping: draftShipping(tier),
      title,
      variants: tier.variants,
    });
  }

  return result;
}

export type DraftIssue = { field: string; message: string };

export function draftTarget(draft: CampaignDraft): MoneyAmount | null {
  const atomic = parseUsdAmount(draft.targetInput);
  return atomic === null ? null : { atomic, currency: "USD", decimals: 2 };
}

export function draftMilestoneBps(draft: CampaignDraft): number[] {
  return draft.milestones.map(
    (milestone) => parsePercentToBps(milestone.allocationPercent) ?? 0,
  );
}

export function draftAllocationTotalBps(draft: CampaignDraft): number {
  return sumBps(draftMilestoneBps(draft));
}

export function isDraftAllocationComplete(draft: CampaignDraft): boolean {
  if (parsePercentToBps(draft.workingCapitalPercent) !== WORKING_CAPITAL_BPS) {
    return false;
  }
  if (draft.milestones.length < 2 || draft.milestones.length > 6) return false;

  const tranches = draftMilestoneBps(draft);
  if (tranches.some((bps) => !Number.isInteger(bps) || bps <= 0)) return false;

  return sumBps(tranches) === TOTAL_BPS;
}

export function draftUseOfFundsTotal(draft: CampaignDraft): MoneyAmount | null {
  const amounts: MoneyAmount[] = [];

  for (const line of draft.useOfFunds) {
    const atomic = parseUsdAmount(line.amountInput);
    if (atomic === null) return null;
    amounts.push({ atomic, currency: "USD", decimals: 2 });
  }

  return amounts.length === 0 ? null : sumMoneyAmounts(amounts);
}

export function draftWorkingCapitalFor(
  draft: CampaignDraft,
): { bps: number; amount: MoneyAmount } | null {
  const target = draftTarget(draft);

  if (target === null) return null;

  return {
    amount: bpsOf(target, WORKING_CAPITAL_BPS),
    bps: WORKING_CAPITAL_BPS,
  };
}

/**
 * What is wrong with a reward's shipping policy, one issue per broken row.
 *
 * The check that matters most is the ordering one. A creator who writes
 * "Everywhere" and then adds "Brazil — we cannot ship here" has written a rule
 * that can never apply. Silently accepting it is the exact failure this model
 * exists to prevent: the destination would look excluded in the editor and be
 * priced as included for the backer. So it is reported as an error, with the fix
 * in the message.
 */
function shippingRuleIssues(
  tier: DraftSupportTier,
  base: string,
  label: string,
): DraftIssue[] {
  const issues: DraftIssue[] = [];
  const zoneIds = new Set(draftZones(tier).map((zone) => zone.id));

  if (tier.shippingRules.length === 0) {
    issues.push({
      field: `${base}.shipping`,
      message: `${label} ships, so it needs at least one destination rule.`,
    });
  }

  tier.shippingZones.forEach((zone, index) => {
    const position = index + 1;

    if (!zone.name.trim()) {
      issues.push({
        field: `${base}.zones.${zone.id}`,
        message: `Zone ${position} needs a name.`,
      });
    }

    if (zone.countries.length === 0) {
      issues.push({
        field: `${base}.zones.${zone.id}`,
        message: `Zone ${position} needs at least one country.`,
      });
    }
  });

  tier.shippingRules.forEach((rule, index) => {
    const position = index + 1;
    const field = `${base}.rules.${rule.id}`;

    switch (rule.coverage.kind) {
      case "country":
        if (rule.coverage.country === "") {
          issues.push({ field, message: `Rule ${position} needs a country.` });
        }
        break;
      case "zone":
        if (!zoneIds.has(rule.coverage.zoneId)) {
          issues.push({
            field,
            message: `Rule ${position} points at a zone that no longer exists.`,
          });
        }
        break;
      case "origin":
        if (tier.shippingOriginCountry === "") {
          issues.push({
            field,
            message: `Rule ${position} covers your own country, so say which country you post from.`,
          });
        }
        break;
      case "worldwide":
        break;
    }

    if (rule.rateKind === "flat" && parseUsdAmount(rule.amountInput) === null) {
      issues.push({
        field,
        message: `Rule ${position} needs a flat rate, for example 8.00.`,
      });
    }

    if (
      tier.shippingRules
        .slice(0, index)
        .some((earlier) => earlier.coverage.kind === "worldwide")
    ) {
      issues.push({
        field,
        message: `Rule ${position} sits below a rule that covers everywhere, so it can never apply. Move it above that rule if it is an exception.`,
      });
    }
  });

  return issues;
}

/**
 * A note for the creator about what their policy does not reach, or null when
 * every destination is covered.
 *
 * Without a worldwide rule the policy covers some countries and not others, and
 * a backer in an uncovered country cannot take the reward at all. The note says
 * that plainly and does not enumerate the missing countries: Inverge only knows
 * the destinations the creator named, and listing the rest would be pretending
 * to a completeness it cannot check.
 */
export function shippingCoverageNote(tier: DraftSupportTier): string | null {
  if (!tierNeedsShipping(tier)) return null;

  const rules = draftShipping(tier)?.rules ?? [];
  if (rules.length === 0) return null;
  if (rules.some((rule) => rule.coverage.kind === "worldwide")) return null;

  return "No rule covers everywhere, so a backer in a country you have not named cannot take this reward. Add an \u201cEverywhere\u201d rule to reach the rest of the world, and put any destinations you exclude above it.";
}

const REQUIRED = "This is required.";

export function validateCampaignStep(
  draft: CampaignDraft,
  step: CampaignWizardStepId,
): readonly DraftIssue[] {
  const issues: DraftIssue[] = [];

  switch (step) {
    case "basics": {
      if (!draft.title.trim())
        issues.push({ field: "title", message: REQUIRED });
      else if (draft.title.trim().length > 90) {
        issues.push({
          field: "title",
          message: "Keep the title under 90 characters.",
        });
      }

      if (!draft.summary.trim()) {
        issues.push({ field: "summary", message: REQUIRED });
      } else if (draft.summary.trim().length > 320) {
        issues.push({
          field: "summary",
          message: "Keep the summary under 320 characters.",
        });
      }

      if (!draft.category) {
        issues.push({ field: "category", message: "Choose a category." });
      } else if (!isCampaignCategorySlug(draft.category)) {
        issues.push({
          field: "category",
          message: "Choose a listed category.",
        });
      } else if (
        draft.subcategory &&
        !isCampaignSubcategoryOf(draft.category, draft.subcategory)
      ) {
        issues.push({
          field: "subcategory",
          message: "Choose a subcategory from the selected category.",
        });
      }

      if (!draft.location.trim()) {
        issues.push({ field: "location", message: REQUIRED });
      }

      if (draft.problem.trim().length < 40) {
        issues.push({
          field: "problem",
          message: "Describe the problem in at least 40 characters.",
        });
      }

      if (draft.solution.trim().length < 40) {
        issues.push({
          field: "solution",
          message: "Describe your solution in at least 40 characters.",
        });
      }

      if (draft.beneficiaries.trim().length < 20) {
        issues.push({
          field: "beneficiaries",
          message: "Say who benefits, in at least 20 characters.",
        });
      }

      return issues;
    }
    case "media": {
      const lists = [
        { field: "heroMedia", items: draft.heroMedia, limit: MAX_HERO_MEDIA },
        {
          field: "storyMedia",
          items: draft.storyMedia,
          limit: MAX_STORY_MEDIA,
        },
      ] as const;

      for (const list of lists) {
        if (list.items.length > list.limit) {
          issues.push({
            field: list.field,
            message: `Keep this list to ${list.limit} items or fewer.`,
          });
        }

        for (const item of list.items) {
          const parsed =
            item.kind === "image"
              ? parseImageSource(item.srcInput)
              : parseVideoSource(item.srcInput);

          if (!parsed.ok) {
            issues.push({
              field: `${list.field}.${item.id}`,
              message: parsed.reason,
            });
          }

          if (item.alt.trim().length < MIN_MEDIA_ALT) {
            issues.push({
              field: `${list.field}.${item.id}`,
              message: `Describe this media in at least ${MIN_MEDIA_ALT} characters. The description is what a screen reader reads aloud.`,
            });
          }

          if (
            item.kind === "video" &&
            item.posterInput.trim() &&
            !parseImageSource(item.posterInput).ok
          ) {
            issues.push({
              field: `${list.field}.${item.id}`,
              message:
                "The poster has to be an https image link, or an asset path that starts with /.",
            });
          }
        }
      }

      return issues;
    }
    case "funding": {
      if (draftTarget(draft) === null) {
        issues.push({
          field: "targetInput",
          message: "Enter a target of at least USDC 0.01.",
        });
      }

      if (!draft.deadline) {
        issues.push({
          field: "deadline",
          message: "Choose a funding deadline.",
        });
      } else if (Number.isNaN(new Date(draft.deadline).getTime())) {
        issues.push({
          field: "deadline",
          message: "That date is not readable.",
        });
      } else if (new Date(draft.deadline).getTime() <= Date.now()) {
        issues.push({
          field: "deadline",
          message: "The deadline has to be in the future.",
        });
      }

      if (draft.useOfFunds.length < 2) {
        issues.push({
          field: "useOfFunds",
          message:
            "Add at least two lines so backers can see how funds are used.",
        });
      }

      for (const line of draft.useOfFunds) {
        if (!line.label.trim()) {
          issues.push({
            field: `useOfFunds.${line.id}`,
            message: "Give this line a label.",
          });
        }
        if (parseUsdAmount(line.amountInput) === null) {
          issues.push({
            field: `useOfFunds.${line.id}`,
            message: "Enter an amount for this line.",
          });
        }
      }

      const target = draftTarget(draft);
      const total = draftUseOfFundsTotal(draft);

      if (
        target &&
        total &&
        BigInt(total.atomic) !== BigInt(target.atomic) &&
        draft.useOfFunds.every(
          (line) => parseUsdAmount(line.amountInput) !== null,
        )
      ) {
        issues.push({
          field: "useOfFunds",
          message:
            "Lines have to add up to the target. Adjust a line or the target.",
        });
      }

      return issues;
    }
    case "milestones": {
      if (draft.milestones.length < 2) {
        issues.push({
          field: "milestones",
          message: "A plan needs at least two milestones.",
        });
      }
      if (draft.milestones.length > 6) {
        issues.push({
          field: "milestones",
          message: "A plan can have at most six milestones.",
        });
      }

      draft.milestones.forEach((milestone, index) => {
        const position = index + 1;

        if (!milestone.title.trim()) {
          issues.push({
            field: `milestones.${milestone.id}`,
            message: `Milestone ${position} needs a title.`,
          });
        }
        if (!milestone.deliverable.trim()) {
          issues.push({
            field: `milestones.${milestone.id}`,
            message: `Milestone ${position} needs a deliverable description.`,
          });
        }
        if (!milestone.evidence.trim()) {
          issues.push({
            field: `milestones.${milestone.id}`,
            message: `Milestone ${position} needs an evidence definition.`,
          });
        }
        const tranche = parsePercentToBps(milestone.allocationPercent);
        if (tranche === null) {
          issues.push({
            field: `milestones.${milestone.id}`,
            message: `Milestone ${position} needs a tranche percentage.`,
          });
        } else if (tranche <= 0) {
          issues.push({
            field: `milestones.${milestone.id}`,
            message: `Milestone ${position} needs a tranche greater than zero.`,
          });
        }
      });

      const workingCapital = parsePercentToBps(draft.workingCapitalPercent);
      if (workingCapital !== WORKING_CAPITAL_BPS) {
        issues.push({
          field: "workingCapitalPercent",
          message:
            "The working-capital tranche is fixed at 20% of the target (FR-503a).",
        });
      }

      if (!issues.length && draftAllocationTotalBps(draft) !== TOTAL_BPS) {
        issues.push({
          field: "milestones",
          message: `Milestone weights have to total 100% of the amount left after the fixed 20% tranche. They currently total ${formatBps(draftAllocationTotalBps(draft))}.`,
        });
      }

      return issues;
    }
    case "rewards": {
      /**
       * Zero tiers is valid — that is a donation-based campaign (FR-301 says
       * rewards are optional). Everything below is per reward the creator did
       * add, keyed to the field it belongs to so one card never shows the same
       * message in six places.
       */
      for (const tier of draft.supportTiers) {
        const base = `supportTiers.${tier.id}`;
        const label = tier.title.trim() || "This reward";

        if (!tier.title.trim()) {
          issues.push({ field: base, message: "Give this reward a title." });
        } else if (tier.title.trim().length > 60) {
          issues.push({
            field: base,
            message: `"${label}" is over 60 characters. Keep reward titles short.`,
          });
        }

        if (parseUsdAmount(tier.minimumInput) === null) {
          issues.push({
            field: `${base}.minimum`,
            message: `${label} needs an amount, for example 10.00.`,
          });
        }

        if (!tier.description.trim()) {
          issues.push({
            field: `${base}.description`,
            message: `${label} needs a description of what the backer receives.`,
          });
        }

        if (tier.imageInput.trim() && !parseImageSource(tier.imageInput).ok) {
          issues.push({
            field: `${base}.image`,
            message:
              "A reward image has to be an https image link, or an asset path that starts with /.",
          });
        }

        if (tier.fulfilment === "") {
          issues.push({
            field: `${base}.type`,
            message: `${label} needs a type: digital, physical, or both.`,
          });
        }

        const quantity = tier.quantityLimitInput.trim();
        if (quantity && !/^\d+$/.test(quantity)) {
          issues.push({
            field: `${base}.quantity`,
            message: `${label}'s quantity limit has to be a whole number.`,
          });
        } else if (quantity && Number(quantity) < 1) {
          issues.push({
            field: `${base}.quantity`,
            message: `${label}'s quantity limit has to be at least one.`,
          });
        } else if (quantity && Number(quantity) > 999) {
          issues.push({
            field: `${base}.quantity`,
            message: `${label}'s quantity limit is too high. Keep it under 1000.`,
          });
        }

        if (tierNeedsShipping(tier)) {
          issues.push(...shippingRuleIssues(tier, base, label));
        }
      }

      return issues;
    }
    case "terms": {
      if (draft.eligibility.trim().length < 20) {
        issues.push({
          field: "eligibility",
          message: "State who can contribute, in at least 20 characters.",
        });
      }
      if (draft.risks.trim().length < 40) {
        issues.push({
          field: "risks",
          message: "Describe the main risks in at least 40 characters.",
        });
      }
      if (draft.failurePlan.trim().length < 20) {
        issues.push({
          field: "failurePlan",
          message: "Say what happens if the target is not reached.",
        });
      }

      const window = Number(draft.objectionWindowDays);
      if (!Number.isInteger(window) || window < 1 || window > 30) {
        issues.push({
          field: "objectionWindowDays",
          message: "Choose a window between 1 and 30 days.",
        });
      }

      return issues;
    }
    case "review": {
      return [
        ...validateCampaignStep(draft, "basics"),
        ...validateCampaignStep(draft, "media"),
        ...validateCampaignStep(draft, "funding"),
        ...validateCampaignStep(draft, "milestones"),
        ...validateCampaignStep(draft, "rewards"),
        ...validateCampaignStep(draft, "terms"),
      ];
    }
  }
}

/** Preconditions that must be true before a campaign may enter the review queue. */
export function submissionPreconditions(): readonly {
  id: string;
  label: string;
  description: string;
  met: boolean;
}[] {
  return [
    {
      description:
        "Creators complete identity verification before a campaign can be submitted (FR-103).",
      id: "kyc",
      label: "Identity verification",
      met: false,
    },
    {
      description:
        "Submission requires a flat, non-refundable application fee, paid before the campaign joins the review queue (FR-311).",
      id: "application-fee",
      label: "Application fee",
      met: false,
    },
  ];
}
