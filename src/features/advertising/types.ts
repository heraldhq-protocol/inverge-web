import type { AdminActor } from "@/features/admin/permissions";

/**
 * Advertising domain model.
 *
 * Advertising is deliberately kept apart from campaign and idea domain models.
 * A paid placement can never write a validation signal, a funding total, or a
 * review decision, and the types below have no field through which it could.
 *
 * All public selection inputs are serializable and free of cookies or raw
 * request data, so the same creative is chosen for a static render and a test.
 */

export type AdPlacementId =
  | "campaign-feed-inline"
  | "campaign-detail-inline"
  | "campaign-detail-rail"
  | "content-inline"
  | "content-sidebar"
  | "editorial-third-party"
  | "idea-detail-inline"
  | "idea-detail-rail"
  | "idea-feed-inline";

export type AdFormat = "banner" | "native-card" | "sidebar" | "third-party";

export type AdKind = "first-party" | "third-party";

/**
 * A creative's editorial lifecycle.
 *
 * `approved` is permission to serve, not a promise that it is in schedule.
 * Scheduling and flags are separate checks so pausing a campaign does not mean
 * deleting its approval record.
 */
export type AdCreativeStatus =
  "approved" | "draft" | "ended" | "paused" | "pending-review" | "rejected";

export type AdAction =
  "approve" | "end" | "pause" | "reject" | "resume" | "submit";

export type AdStatusAction = Exclude<AdAction, "submit"> | "submit";

export type AdViewport = "desktop" | "mobile" | "tablet";

export type AdPageKind =
  "campaign" | "campaigns" | "guide" | "idea" | "ideas" | "journal";

export type AdCreative = {
  id: string;
  advertiser: string;
  headline: string;
  body: string;
  ctaLabel: string;
  /** Absolute `https://` URL or a root-relative Inverge path. */
  destination: string;
  format: AdFormat;
  kind: AdKind;
  status: AdCreativeStatus;
  startsAt: string;
  endsAt: string;
  placements: readonly AdPlacementId[];
  /** Empty means every category is relevant. */
  categories: readonly string[];
  /** Empty means every region is relevant. */
  regions: readonly string[];
  priority: number;
  createdAt: string;
  updatedAt: string;
};

export type AdPlacement = {
  id: AdPlacementId;
  label: string;
  description: string;
  kind: AdKind;
  formats: readonly AdFormat[];
  pageKinds: readonly AdPageKind[];
  viewports: readonly AdViewport[];
  requiresConsent: boolean;
  /** At most one creative per placement per page. */
  maxPerPage: number;
  /** Feed slots stay out until this many organic results exist. */
  minimumOrganicResults?: number;
  /** Client wrapper hides the slot below this breakpoint. */
  hiddenBelow?: "lg";
};

export type AdPageContext = {
  kind: AdPageKind;
  category?: string;
  region?: string;
  /**
   * Organic results on the page. Feed placements require a minimum so a paid
   * card never becomes the whole result set.
   */
  organicResultCount?: number;
};

export type AdConsent = {
  personalisedAds: boolean;
};

export type AdFlags = {
  enabled: boolean;
  thirdPartyEnabled: boolean;
};

export type AdSelectionContext = {
  now: string;
  viewport: AdViewport;
  consent: AdConsent;
  flags: AdFlags;
  page: AdPageContext;
  /** Creatives already shown in this session, for frequency capping. */
  seenCreativeIds?: readonly string[];
  /** Creatives already placed elsewhere on this page. */
  excludeCreativeIds?: readonly string[];
};

export type AdEligibilityReason =
  | "consent-required"
  | "creative-not-approved"
  | "destination-invalid"
  | "disabled"
  | "excluded"
  | "format-not-allowed"
  | "frequency-capped"
  | "insufficient-organic-results"
  | "not-in-schedule"
  | "not-relevant"
  | "placement-not-allowed"
  | "third-party-disabled"
  | "viewport-not-eligible";

export type AdEligibility =
  { eligible: true } | { eligible: false; reason: AdEligibilityReason };

export type AdSelection = {
  creative: AdCreative;
  placement: AdPlacement;
};

export type AdStatusActionInput = {
  action: AdAction;
  actor: AdminActor;
  at: string;
  creative: AdCreative;
  reason?: string;
};

export type AdActionResult =
  | {
      ok: true;
      creative: AdCreative;
      event: AdAdminEvent;
    }
  | {
      code: "not-permitted" | "not-allowed" | "reason-required";
      message: string;
      ok: false;
    };

export type AdAdminEvent = {
  id: string;
  at: string;
  actor: AdminActor;
  action: AdAction;
  creativeId: string;
  creativeHeadline: string;
  from: AdCreativeStatus;
  to: AdCreativeStatus;
  reason: string | null;
};

export type AdInventorySummary = {
  active: number;
  approved: number;
  ended: number;
  paused: number;
  pending: number;
  scheduled: number;
  total: number;
};
