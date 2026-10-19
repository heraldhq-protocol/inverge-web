import {
  bpsOf,
  formatBps,
  parsePercentToBps,
  sumBps,
  TOTAL_BPS,
} from "@/features/campaigns/lib/amounts";
import {
  isWorkingCapitalInRange,
  WORKING_CAPITAL_MAX_BPS,
  WORKING_CAPITAL_MIN_BPS,
} from "@/features/campaigns/lib/escrow";
import {
  MAX_HERO_MEDIA,
  MAX_STORY_MEDIA,
  MIN_MEDIA_ALT,
  parseImageSource,
  parseVideoSource,
} from "@/features/campaigns/lib/media";
import { isAllocationComplete } from "@/features/campaigns/lib/milestones";
import type {
  Campaign,
  CampaignMedia,
  RewardFulfilment,
  SupportTier,
  VideoSource,
} from "@/features/campaigns/types";
import {
  isDiscoveryCategory,
  type DiscoveryCategory,
} from "@/features/home/discovery-categories";
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
      "Two to six milestones. Each needs a deliverable and the evidence you will submit.",
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

/**
 * A reward as the wizard edits it.
 *
 * `imageInput` is held raw, like a media source, so an unfinished or invalid
 * address stays visible instead of being silently dropped. Destinations are held
 * as the creator's own lines rather than as a fixed list of countries: Inverge
 * has no shipping-rate service, so it must not imply it knows which countries
 * exist or what a parcel costs to reach them.
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
  /** One destination per line; converted with `parseShippingRegions`. */
  shippingRegionsInput: string;
  /** The creator's own fulfilment terms. Only meaningful for a physical part. */
  shippingTerms: string;
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
  category: DiscoveryCategory | "";
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
    description: "",
    estimatedDelivery: "",
    fulfilment: "",
    id: nextDraftId("tier"),
    imageInput: "",
    minimumInput: "",
    shippingRegionsInput: "",
    shippingTerms: "",
    title: "",
  };
}

/**
 * The creator's destination lines as the model holds them.
 *
 * One destination per line, blanks dropped, duplicates collapsed
 * case-insensitively (so "Nigeria" and "nigeria" are one destination). The order
 * is the creator's, because it is their list and not a taxonomy to normalise.
 */
export function parseShippingRegions(input: string): string[] {
  const seen = new Set<string>();
  const regions: string[] = [];

  for (const line of input.split("\n")) {
    const value = line.trim();
    if (!value) continue;

    const key = value.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    regions.push(value);
  }

  return regions;
}

export const emptyCampaignDraft: CampaignDraft = {
  beneficiaries: "",
  category: "",
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
  workingCapitalPercent: "",
};

/** Load a published campaign back into the wizard for editing (FR-303 locks the plan). */
export function draftFromCampaign(campaign: Campaign): CampaignDraft {
  return {
    beneficiaries: campaign.story.beneficiaries,
    category: campaign.category,
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
    supportTiers: campaign.supportTiers.map((tier) => ({
      description: tier.description,
      estimatedDelivery: tier.estimatedDelivery ?? "",
      fulfilment: tier.fulfilment ?? "",
      id: tier.id,
      imageInput: tier.image ?? "",
      minimumInput: wholeUnits(tier.minimum),
      shippingRegionsInput: (tier.shipping?.regions ?? []).join("\n"),
      shippingTerms: tier.shipping?.terms ?? "",
      title: tier.title,
    })),
    targetInput: wholeUnits(campaign.funding.target),
    title: campaign.title,
    updatedAt: campaign.publishedAt ?? "",
    useOfFunds: campaign.story.useOfFunds.map((line) => ({
      amountInput: wholeUnits(line.amount),
      id: nextDraftId("funds"),
      label: line.label,
    })),
    workingCapitalPercent:
      campaign.escrow.workingCapitalBps === null
        ? ""
        : formatBpsNumber(campaign.escrow.workingCapitalBps),
  };
}

/** A percentage string without a trailing `%`, e.g. "20" or "12.5". */
function formatBpsNumber(bps: number): string {
  return (bps / 100).toFixed(2).replace(/\.?0+$/, "");
}

function wholeUnits(amount: MoneyAmount): string {
  return (BigInt(amount.atomic) / 10n ** BigInt(amount.decimals)).toString();
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
  return fulfilment === "physical" || fulfilment === "mixed";
}

/**
 * The draft's reward tiers as the model would hold them.
 *
 * A tier without a title or a readable amount is dropped rather than guessed at,
 * for the same reason an unusable media item is: this is the shape a submission
 * would carry. `shipping` is attached only for a reward that includes something
 * physical, so a digital tier can never render a shipping line. An image that
 * does not parse becomes `null` — the card draws its own mark rather than the
 * page pointing a browser at an address the creator mistyped.
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
      description: tier.description.trim(),
      estimatedDelivery: blankToNull(tier.estimatedDelivery),
      fulfilment: tier.fulfilment === "" ? null : tier.fulfilment,
      id: tier.id,
      image: image.ok ? image.src : null,
      minimum: { atomic, currency: "USD", decimals: 2 },
      shipping: isPhysicalReward(tier.fulfilment)
        ? {
            regions: parseShippingRegions(tier.shippingRegionsInput),
            terms: blankToNull(tier.shippingTerms),
          }
        : null,
      title,
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
  return isAllocationComplete(
    draft.milestones.map((milestone, index) => ({
      allocationBps: draftMilestoneBps(draft)[index] ?? 0,
      decision: null,
      deliverable: milestone.deliverable,
      evidence: milestone.evidence,
      expectedAt: milestone.expectedAt || null,
      id: milestone.id,
      objectionBps: 0,
      objectionClosesAt: null,
      sequence: index + 1,
      state: "upcoming" as const,
      submission: null,
      title: milestone.title,
    })),
  );
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
  const firstBps = draftMilestoneBps(draft).at(0) ?? 0;
  const requested = parsePercentToBps(draft.workingCapitalPercent);

  if (target === null || requested === null || firstBps <= 0) return null;

  const bps = Math.min(requested, firstBps);
  return { amount: bpsOf(target, bps), bps };
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
      } else if (!isDiscoveryCategory(draft.category)) {
        issues.push({
          field: "category",
          message: "Choose a listed category.",
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
        if (parsePercentToBps(milestone.allocationPercent) === null) {
          issues.push({
            field: `milestones.${milestone.id}`,
            message: `Milestone ${position} needs a tranche percentage.`,
          });
        }
      });

      if (!issues.length && draftAllocationTotalBps(draft) !== TOTAL_BPS) {
        issues.push({
          field: "milestones",
          message: `Tranches have to total 100%. They currently total ${formatBps(draftAllocationTotalBps(draft))}.`,
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

        if (
          isPhysicalReward(tier.fulfilment) &&
          parseShippingRegions(tier.shippingRegionsInput).length === 0
        ) {
          issues.push({
            field: `${base}.shipping`,
            message: `${label} ships, so list at least one destination — one per line.`,
          });
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

      const workingCapital = parsePercentToBps(draft.workingCapitalPercent);
      if (workingCapital === null) {
        issues.push({
          field: "workingCapitalPercent",
          message: "Choose the share released as the first tranche.",
        });
      } else if (!isWorkingCapitalInRange(workingCapital)) {
        issues.push({
          field: "workingCapitalPercent",
          message: `The first tranche has to be between ${formatBps(WORKING_CAPITAL_MIN_BPS)} and ${formatBps(WORKING_CAPITAL_MAX_BPS)} (FR-503a).`,
        });
      } else {
        const firstBps = draftMilestoneBps(draft).at(0) ?? 0;
        if (firstBps > 0 && workingCapital > firstBps) {
          issues.push({
            field: "workingCapitalPercent",
            message: `The first tranche cannot exceed milestone one's ${formatBps(firstBps)}. Raise milestone one's share, or lower this one.`,
          });
        }
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
