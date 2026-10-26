import {
  PLATFORM_SUCCESS_FEE_BPS,
  WORKING_CAPITAL_PERCENT,
} from "@/features/campaigns/lib/escrow";
import {
  parseImageSource,
  parseVideoSource,
} from "@/features/campaigns/lib/media";
import {
  createDraftTier,
  draftTarget,
  emptyCampaignDraft,
  formatBpsNumber,
  nextDraftId,
  validateCampaignStep,
  type CampaignDraft,
  type DraftIssue,
  type DraftMedia,
  type DraftSupportTier,
} from "@/features/campaigns/lib/wizard";
import { parseUsdAmount } from "@/lib/money";

/**
 * The boundary between the wizard's editable draft and the API's persisted draft.
 *
 * The wizard keeps raw input (a percentage as typed, a media link before it is
 * parsed) because a field has to show what the creator wrote. The API takes
 * normalised values with an explicit shape. This module is the only place that
 * converts one into the other, in both directions, so a resumed draft and a
 * freshly saved one are the same model.
 *
 * It is deliberately free of network calls: the server module and the autosave
 * hook both use it, and every rule here is unit-tested without a browser.
 */

export type DraftMediaPayload = {
  id?: string | undefined;
  kind: "image" | "video";
  src: string;
  alt: string;
  caption?: string | undefined;
  poster?: string | undefined;
};

export type DraftMilestonePayload = {
  title: string;
  deliverable: string;
  allocationPercent: string;
  evidence: string;
  expectedAt?: string | undefined;
};

export type CreateDraftPayload = {
  title: string;
  summary: string;
  category?: string | undefined;
  subcategory?: string | undefined;
  location: string;
  problem: string;
  solution: string;
  beneficiaries: string;
  eligibility?: string | undefined;
  risks?: string | undefined;
  failurePlan?: string | undefined;
  targetAmount: string;
  deadline: string;
  tokenType: "USDC";
  workingCapitalPercent: string;
  objectionWindowDays: number;
  milestones: DraftMilestonePayload[];
  useOfFunds: { label: string; amount: string }[];
  heroMedia: DraftMediaPayload[];
  storyMedia: DraftMediaPayload[];
  rewardTiers: Record<string, unknown>[];
};

export type UpdateDraftPayload = Partial<CreateDraftPayload> & {
  version: number;
};

export type DraftPayloadResult =
  | { ok: true; payload: CreateDraftPayload }
  | { ok: false; issues: readonly DraftIssue[] };

export type DraftReadiness = {
  ready: boolean;
  blockers: readonly string[];
};

export type SavedCampaignDraft = {
  id: string;
  version: number;
  readiness: DraftReadiness | null;
  draft: CampaignDraft;
};

/**
 * A deadline as an absolute instant. The API stores a timestamp and the wizard
 * edits a calendar date, so the date is pinned to UTC midnight rather than to the
 * browser's zone: the same draft must not acquire a different deadline on a
 * laptop in another timezone.
 */
export function dateInputToIso(value: string): string | null {
  if (!value.trim()) return null;
  const parsed = new Date(`${value.trim()}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** An atomic integer amount as an exact decimal string, without floats. */
function atomicDecimal(atomic: string, decimals: number): string {
  const value = BigInt(atomic);
  if (decimals <= 0) return value.toString();
  const divisor = 10n ** BigInt(decimals);
  const whole = value / divisor;
  const fraction = (value % divisor)
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

function blankToUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function mediaPayload(items: readonly DraftMedia[]): DraftMediaPayload[] {
  const media: DraftMediaPayload[] = [];

  for (const item of items) {
    const alt = item.alt.trim();
    // The API requires at least three characters of alt text; a shorter one
    // would be rejected and turn a media-only edit into a failed save.
    if (alt.length < 3) continue;

    if (item.kind === "image") {
      const parsed = parseImageSource(item.srcInput);
      if (!parsed.ok) continue;
      media.push({
        alt,
        caption: blankToUndefined(item.caption),
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
      caption: blankToUndefined(item.caption),
      kind: "video",
      poster: poster.ok ? poster.src : undefined,
      src: item.srcInput.trim(),
    });
  }

  return media;
}

/**
 * Everything the API requires to create a draft, validated on the client before
 * a request is made. The server validates again: this only avoids a pointless
 * round-trip and shows the creator the same reason the API would return.
 *
 * The terms/disclosures step is intentionally not part of "creatable": those
 * fields are optional in the API and required only for review, so a creator who
 * has finished the plan can have their work saved before writing the disclosures.
 */
export function toCreateDraftPayload(draft: CampaignDraft): DraftPayloadResult {
  const issues: DraftIssue[] = [
    ...validateCampaignStep(draft, "basics"),
    ...validateCampaignStep(draft, "funding"),
    ...validateCampaignStep(draft, "milestones"),
  ];

  const window = Number(draft.objectionWindowDays);
  if (!Number.isInteger(window) || window < 1 || window > 30) {
    issues.push({
      field: "objectionWindowDays",
      message: "Choose an objection window between 1 and 30 days.",
    });
  }

  const target = draftTarget(draft);
  const deadline = dateInputToIso(draft.deadline);
  if (!target) {
    issues.push({
      field: "targetInput",
      message: "Enter a target of at least USDC 0.01.",
    });
  }
  if (!deadline) {
    issues.push({ field: "deadline", message: "Choose a funding deadline." });
  }

  if (issues.length > 0 || !target || !deadline) {
    return { issues, ok: false };
  }

  const useOfFunds: { label: string; amount: string }[] = [];
  for (const line of draft.useOfFunds) {
    const atomic = parseUsdAmount(line.amountInput);
    if (atomic === null) continue;
    useOfFunds.push({
      amount: atomicDecimal(atomic, 2),
      label: line.label.trim(),
    });
  }

  return {
    ok: true,
    payload: {
      beneficiaries: draft.beneficiaries.trim(),
      category: blankToUndefined(draft.category),
      deadline,
      eligibility: blankToUndefined(draft.eligibility),
      failurePlan: blankToUndefined(draft.failurePlan),
      heroMedia: mediaPayload(draft.heroMedia),
      location: draft.location.trim(),
      milestones: draft.milestones.map((milestone) => ({
        allocationPercent: milestone.allocationPercent.trim(),
        deliverable: milestone.deliverable.trim(),
        evidence: milestone.evidence.trim(),
        expectedAt: dateInputToIso(milestone.expectedAt) ?? undefined,
        title: milestone.title.trim(),
      })),
      objectionWindowDays: window,
      problem: draft.problem.trim(),
      rewardTiers: JSON.parse(JSON.stringify(draft.supportTiers)) as Record<
        string,
        unknown
      >[],
      risks: blankToUndefined(draft.risks),
      solution: draft.solution.trim(),
      storyMedia: mediaPayload(draft.storyMedia),
      subcategory: draft.category
        ? blankToUndefined(draft.subcategory)
        : undefined,
      summary: draft.summary.trim(),
      targetAmount: atomicDecimal(target.atomic, target.decimals),
      title: draft.title.trim(),
      tokenType: "USDC",
      useOfFunds,
      workingCapitalPercent: WORKING_CAPITAL_PERCENT,
    },
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function isoDate(value: unknown): string {
  return typeof value === "string" && value.length >= 10
    ? value.slice(0, 10)
    : "";
}

function decimalInput(value: unknown): string {
  const raw = typeof value === "string" ? value : "";
  if (!/^\d+(\.\d+)?$/.test(raw)) return "";
  return raw.includes(".") ? raw.replace(/0+$/, "").replace(/\.$/, "") : raw;
}

function mediaFrom(value: unknown): DraftMedia[] {
  if (!Array.isArray(value)) return [];

  const media: DraftMedia[] = [];
  for (const item of value) {
    const record = asRecord(item);
    if (!record) continue;
    const kind = record.kind === "video" ? "video" : "image";
    media.push({
      alt: text(record.alt),
      caption: text(record.caption),
      id: text(record.id) || nextDraftId("media"),
      kind,
      posterInput: kind === "video" ? text(record.poster) : "",
      srcInput: text(record.src),
    });
  }
  return media;
}

/**
 * A reward tier as it was authored. The API stores reward tiers as an opaque
 * projection (no lifecycle or money depends on their shape yet), so the wizard's
 * own document is round-tripped and only missing fields are defaulted.
 */
function tierFrom(value: unknown): DraftSupportTier | null {
  const record = asRecord(value);
  if (!record) return null;

  const defaults = createDraftTier();
  return {
    ...defaults,
    addOns: Array.isArray(record.addOns)
      ? (record.addOns as DraftSupportTier["addOns"])
      : defaults.addOns,
    description: text(record.description),
    estimatedDelivery: text(record.estimatedDelivery),
    fulfilment:
      record.fulfilment === "digital" ||
      record.fulfilment === "physical" ||
      record.fulfilment === "mixed"
        ? record.fulfilment
        : "",
    id: text(record.id) || defaults.id,
    imageInput: text(record.imageInput),
    includesInput: text(record.includesInput),
    minimumInput: text(record.minimumInput),
    quantityLimitInput: text(record.quantityLimitInput),
    shippingCustoms: text(record.shippingCustoms),
    shippingOriginCountry: text(record.shippingOriginCountry),
    shippingRules: Array.isArray(record.shippingRules)
      ? (record.shippingRules as DraftSupportTier["shippingRules"])
      : defaults.shippingRules,
    shippingTerms: text(record.shippingTerms),
    shippingZones: Array.isArray(record.shippingZones)
      ? (record.shippingZones as DraftSupportTier["shippingZones"])
      : defaults.shippingZones,
    title: text(record.title),
    variants: Array.isArray(record.variants)
      ? (record.variants as DraftSupportTier["variants"])
      : defaults.variants,
  };
}

/** The wizard's model rebuilt from the API's persisted projection. */
export function draftFromApiDraft(value: unknown): CampaignDraft | null {
  const record = asRecord(value);
  if (!record) return null;

  const story = asRecord(record.story) ?? {};
  const milestones = Array.isArray(record.milestones)
    ? record.milestones
        .map((item) => asRecord(item))
        .filter((item): item is Record<string, unknown> => item !== null)
        .sort((a, b) => Number(a.index ?? 0) - Number(b.index ?? 0))
        .map((item) => ({
          allocationPercent: decimalInput(item.allocationPercent),
          deliverable: text(item.deliverable),
          evidence: text(item.evidence),
          expectedAt: isoDate(item.expectedAt),
          id: text(item.id) || nextDraftId("milestone"),
          title: text(item.title),
        }))
    : [];

  const useOfFunds = Array.isArray(story.useOfFunds)
    ? story.useOfFunds
        .map((item) => asRecord(item))
        .filter((item): item is Record<string, unknown> => item !== null)
        .map((item) => ({
          amountInput: decimalInput(item.amount),
          id: nextDraftId("funds"),
          label: text(item.label),
        }))
    : [];

  const rewardTiers = Array.isArray(record.rewardTiers)
    ? record.rewardTiers
        .map(tierFrom)
        .filter((tier): tier is DraftSupportTier => tier !== null)
    : [];

  return {
    ...emptyCampaignDraft,
    beneficiaries: text(story.beneficiaries),
    category: text(record.category) as CampaignDraft["category"],
    deadline: isoDate(record.deadline),
    eligibility: text(story.eligibility),
    failurePlan: text(story.failurePlan),
    heroMedia: mediaFrom(story.heroMedia),
    location: text(story.location),
    milestones,
    objectionWindowDays:
      typeof record.objectionWindowDays === "number"
        ? String(record.objectionWindowDays)
        : "",
    problem: text(story.problem),
    risks: text(story.risks),
    solution: text(story.solution),
    storyMedia: mediaFrom(story.storyMedia),
    subcategory: text(record.subcategory) as CampaignDraft["subcategory"],
    successFeePercent: formatBpsNumber(PLATFORM_SUCCESS_FEE_BPS),
    summary: text(record.summary),
    supportTiers: rewardTiers,
    targetInput: decimalInput(record.targetAmount),
    title: text(record.title),
    updatedAt: text(record.updatedAt),
    useOfFunds,
    // The tranche is a platform rule, not authored content. A draft saved under
    // the superseded 20–25% band resumes at the fixed rate rather than exposing a
    // control the creator no longer has.
    workingCapitalPercent: WORKING_CAPITAL_PERCENT,
  };
}

/** A create/update/read response, projected onto what the wizard needs. */
export function readSavedDraft(value: unknown): SavedCampaignDraft | null {
  const record = asRecord(value);
  if (!record || typeof record.id !== "string" || record.id.length === 0) {
    return null;
  }
  if (typeof record.version !== "number") return null;

  const draft = draftFromApiDraft(record);
  if (!draft) return null;

  const readiness = asRecord(record.readiness);
  return {
    draft,
    id: record.id,
    readiness:
      readiness && typeof readiness.ready === "boolean"
        ? {
            blockers: Array.isArray(readiness.blockers)
              ? readiness.blockers.filter(
                  (blocker): blocker is string => typeof blocker === "string",
                )
              : [],
            ready: readiness.ready,
          }
        : null,
    version: record.version,
  };
}
