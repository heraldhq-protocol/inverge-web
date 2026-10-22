import type { PillTone } from "@/components/ui/pill";
import { adminCan } from "@/features/admin/permissions";
import { discoveryCategories } from "@/features/home/discovery-categories";
import {
  AD_PLACEMENT_IDS,
  getAdPlacement,
  isAdPlacementId,
} from "@/features/advertising/lib/placements";
import type {
  AdActionResult,
  AdAction,
  AdCreative,
  AdCreativeStatus,
  AdFormat,
  AdInventorySummary,
  AdStatusActionInput,
} from "@/features/advertising/types";

/**
 * Creative intake and status rules.
 *
 * This module is pure so the same checks can run in the browser preview, the
 * event route, and a future API DTO without a second interpretation. It rejects
 * destinations that could execute script, caps copy length so a paid card
 * cannot impersonate an editorial headline, and keeps approval a separate
 * permission from editing.
 */

export const AD_ADVERTISER_MAX = 60;
export const AD_BODY_MAX = 160;
export const AD_BODY_MIN = 20;
export const AD_CTA_MAX = 24;
export const AD_HEADLINE_MAX = 72;
export const AD_HEADLINE_MIN = 8;
export const AD_REJECTION_MIN_REASON = 10;

export const AD_FORMATS: readonly AdFormat[] = [
  "banner",
  "native-card",
  "sidebar",
  "third-party",
];

export type AdCreativeInput = {
  id?: string;
  advertiser: string;
  headline: string;
  body: string;
  ctaLabel: string;
  destination: string;
  format: string;
  placements: readonly string[];
  categories: readonly string[];
  regions: readonly string[];
  priority: number | string;
  startsAt: string;
  endsAt: string;
};

export type AdCreativeDraft = Omit<
  AdCreative,
  "createdAt" | "id" | "status" | "updatedAt"
>;

export type AdCreativeValidation =
  | { ok: true; draft: AdCreativeDraft }
  | { ok: false; errors: Readonly<Record<string, string>> };

function isSafeRelativeDestination(value: string): boolean {
  return (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !/\s/.test(value)
  );
}

/**
 * A destination is an `https://` URL or an Inverge path.
 *
 * `javascript:`, `data:`, protocol-relative URLs, credentials, and plain HTTP
 * are refused. An advertiser link is untrusted input even after approval.
 */
export function isSafeAdDestination(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 500) return false;
  if (isSafeRelativeDestination(trimmed)) return true;

  try {
    const url = new URL(trimmed);
    return (
      url.protocol === "https:" &&
      url.hostname.length > 0 &&
      url.username === "" &&
      url.password === ""
    );
  } catch {
    return false;
  }
}

function parseIso(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function isAdFormat(value: string): value is AdFormat {
  return (AD_FORMATS as readonly string[]).includes(value);
}

export function validateAdCreativeInput(
  input: AdCreativeInput,
): AdCreativeValidation {
  const errors: Record<string, string> = {};

  const advertiser = input.advertiser.trim();
  const headline = input.headline.trim();
  const body = input.body.trim();
  const ctaLabel = input.ctaLabel.trim();
  const destination = input.destination.trim();

  if (advertiser.length < 2 || advertiser.length > AD_ADVERTISER_MAX) {
    errors.advertiser = `Use 2–${AD_ADVERTISER_MAX} characters.`;
  }
  if (headline.length < AD_HEADLINE_MIN || headline.length > AD_HEADLINE_MAX) {
    errors.headline = `Use ${AD_HEADLINE_MIN}–${AD_HEADLINE_MAX} characters.`;
  }
  if (body.length < AD_BODY_MIN || body.length > AD_BODY_MAX) {
    errors.body = `Use ${AD_BODY_MIN}–${AD_BODY_MAX} characters.`;
  }
  if (ctaLabel.length < 2 || ctaLabel.length > AD_CTA_MAX) {
    errors.ctaLabel = `Use 2–${AD_CTA_MAX} characters.`;
  }
  if (!isSafeAdDestination(destination)) {
    errors.destination =
      "Use an https:// address or a path beginning with a single /.";
  }
  if (!isAdFormat(input.format)) {
    errors.format = "Choose a supported format.";
  }

  const placements = input.placements.filter(isAdPlacementId);
  if (placements.length === 0) {
    errors.placements = "Choose at least one placement.";
  } else if (placements.length !== input.placements.length) {
    errors.placements = "One or more placements are not recognised.";
  } else if (
    isAdFormat(input.format) &&
    placements.some(
      (placementId) =>
        !getAdPlacement(placementId)?.formats.includes(
          input.format as AdFormat,
        ),
    )
  ) {
    errors.placements = "The chosen format is not allowed in every placement.";
  }

  const categoryValues: readonly string[] = discoveryCategories.map(
    (category) => category.value,
  );
  if (input.categories.some((category) => !categoryValues.includes(category))) {
    errors.categories = "One or more categories are not recognised.";
  }

  const priority = Number(input.priority);
  if (!Number.isInteger(priority) || priority < 0 || priority > 100) {
    errors.priority = "Use a whole number from 0 to 100.";
  }

  const startsAt = parseIso(input.startsAt);
  const endsAt = parseIso(input.endsAt);
  if (!startsAt) errors.startsAt = "Choose a valid start date and time.";
  if (!endsAt) errors.endsAt = "Choose a valid end date and time.";
  if (startsAt && endsAt && endsAt <= startsAt) {
    errors.endsAt = "The end must be after the start.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, ok: false };
  }

  return {
    draft: {
      advertiser,
      body,
      categories: [...new Set(input.categories)],
      ctaLabel,
      destination,
      endsAt: endsAt as string,
      format: input.format as AdFormat,
      headline,
      kind: "first-party",
      placements: [...new Set(placements)],
      priority,
      regions: [
        ...new Set(
          input.regions
            .map((region) => region.trim().toLowerCase())
            .filter((region) => region.length > 0),
        ),
      ],
      startsAt: startsAt as string,
    },
    ok: true,
  };
}

const AD_TRANSITIONS: Readonly<Record<AdCreativeStatus, readonly AdAction[]>> =
  {
    approved: ["pause", "end"],
    draft: ["submit"],
    ended: [],
    paused: ["resume", "end"],
    "pending-review": ["approve", "reject"],
    rejected: ["submit"],
  };

export const AD_STATUS_LABELS: Readonly<Record<AdCreativeStatus, string>> = {
  approved: "Approved",
  draft: "Draft",
  ended: "Ended",
  paused: "Paused",
  "pending-review": "Pending review",
  rejected: "Rejected",
};

export const AD_STATUS_TONES: Readonly<Record<AdCreativeStatus, PillTone>> = {
  approved: "accent",
  draft: "neutral",
  ended: "neutral",
  paused: "warning",
  "pending-review": "warning",
  rejected: "danger",
};

export const AD_ACTION_LABELS: Readonly<Record<AdAction, string>> = {
  approve: "Approve",
  end: "End creative",
  pause: "Pause",
  reject: "Reject",
  resume: "Resume",
  submit: "Submit for review",
};

const AD_NEXT_STATUS: Readonly<Record<AdAction, AdCreativeStatus>> = {
  approve: "approved",
  end: "ended",
  pause: "paused",
  reject: "rejected",
  resume: "approved",
  submit: "pending-review",
};

export function adActionsFor(status: AdCreativeStatus): readonly AdAction[] {
  return AD_TRANSITIONS[status];
}

export function adActionPermission(action: AdAction) {
  return action === "approve" || action === "reject"
    ? ("advertising:approve" as const)
    : ("advertising:manage" as const);
}

/**
 * Apply one lifecycle action, or refuse with a reason.
 *
 * Approval and rejection need `advertising:approve`; every other action needs
 * `advertising:manage`. The check runs here rather than only in the button that
 * happens to be rendered, so a hidden control is not the rule.
 */
export function applyAdAction(input: AdStatusActionInput): AdActionResult {
  const { action, actor, at, creative, reason = "" } = input;

  if (!adminCan(actor.role, adActionPermission(action))) {
    return {
      code: "not-permitted",
      message:
        action === "approve" || action === "reject"
          ? "This account cannot approve or reject advertising."
          : "This account cannot manage advertising inventory.",
      ok: false,
    };
  }

  if (!AD_TRANSITIONS[creative.status].includes(action)) {
    return {
      code: "not-allowed",
      message: `${AD_ACTION_LABELS[action]} is not available for a ${AD_STATUS_LABELS[
        creative.status
      ].toLowerCase()} creative.`,
      ok: false,
    };
  }

  const trimmedReason = reason.trim();
  if (action === "reject" && trimmedReason.length < AD_REJECTION_MIN_REASON) {
    return {
      code: "reason-required",
      message: `Give the advertiser a reason of at least ${AD_REJECTION_MIN_REASON} characters.`,
      ok: false,
    };
  }

  const to = AD_NEXT_STATUS[action];

  return {
    creative: { ...creative, status: to, updatedAt: at },
    event: {
      action,
      actor,
      at,
      creativeHeadline: creative.headline,
      creativeId: creative.id,
      from: creative.status,
      id: `ad-${creative.id}-${action}-${at}`,
      reason: trimmedReason === "" ? null : trimmedReason,
      to,
    },
    ok: true,
  };
}

export function isCreativeApproved(creative: AdCreative): boolean {
  return creative.status === "approved";
}

export function isCreativeInSchedule(
  creative: AdCreative,
  nowIso: string,
): boolean {
  const now = Date.parse(nowIso);
  if (Number.isNaN(now)) return false;
  return (
    Date.parse(creative.startsAt) <= now && now < Date.parse(creative.endsAt)
  );
}

export function adInventorySummary(
  creatives: readonly AdCreative[],
  nowIso: string,
): AdInventorySummary {
  const now = Date.parse(nowIso);
  let active = 0;
  let approved = 0;
  let ended = 0;
  let paused = 0;
  let pending = 0;
  let scheduled = 0;

  for (const creative of creatives) {
    if (creative.status === "pending-review") pending += 1;
    if (creative.status === "paused") paused += 1;
    if (creative.status === "ended") ended += 1;
    if (creative.status !== "approved") continue;

    approved += 1;
    const start = Date.parse(creative.startsAt);
    const end = Date.parse(creative.endsAt);
    if (start > now) scheduled += 1;
    else if (end > now) active += 1;
    else ended += 1;
  }

  return {
    active,
    approved,
    ended,
    paused,
    pending,
    scheduled,
    total: creatives.length,
  };
}

export function adPlacementOptionsForFormat(format: AdFormat) {
  return AD_PLACEMENT_IDS.filter((id) =>
    getAdPlacement(id)?.formats.includes(format),
  );
}
