// Shapes mirror docs/campaign-data-contract.md §2. Nothing here is implemented in inverge-api yet,
// so these types plus the fixtures are the contract the screens are built against.

import type { IdeaCategory, PublicCreator } from '@/lib/feed/types';

/**
 * Platform rules the copy has to state exactly, because a backer is being asked to rely on them.
 *
 * They are `PlatformParam` rows in the API, admin-tunable and audited, and they are not exposed
 * read-only yet (gap backlog item 10, restated as campaign ask 15). Until they are, they live here
 * rather than being retyped into eight strings, so the swap is one file.
 */
export const PLATFORM = {
  /** FR-602. Days a milestone claim sits open for backers to review. */
  objectionWindowDays: 7,
  /** FR-603. Share of contributed capital that must object to stop a release. */
  objectionThresholdPct: 30,
  /** FR-604. Cap on any single backer's effective objection weight. */
  objectionWeightCapPct: 15,
  /** FR-503a. Ceiling on the tranche released at funding close, before any stage is verified. */
  workingCapitalMaxPct: 25,
  /** FR-301. Milestone count bounds. */
  minMilestones: 2,
  maxMilestones: 6,
} as const;

export type CampaignType = 'ALL_OR_NOTHING' | 'FLEXIBLE_FUNDING';

export type CampaignStatus = 'DRAFT' | 'IN_REVIEW' | 'ACTIVE' | 'FUNDED' | 'FAILED' | 'COMPLETED';

export type ClaimStatus = 'UNDER_REVIEW' | 'APPROVED' | 'FAILED' | 'DISPUTED';

/**
 * Milestone state as the UI needs it. Derived, never stored: `Milestone` has no status column, so
 * this comes from the latest claim plus its window. See milestone-state.ts — one pure function, so
 * the four states cannot drift between the tracker, the header and the receipts list.
 */
export type MilestoneState =
  | 'UPCOMING'
  | 'UNDER_REVIEW'
  | 'RELEASED'
  | 'NOT_DELIVERED'
  | 'DISPUTED'
  | 'CANCELLED';

export type ReceiptKind =
  | 'FUNDED'
  | 'WORKING_CAPITAL_RELEASED'
  | 'TRANCHE_RELEASED'
  | 'REFUND_CLAIMED'
  | 'MILESTONE_FAILED';

/** An on-chain event, read-only. The signature exists so TxLink can build a URL — it is never text. */
export type Receipt = {
  kind: ReceiptKind;
  label: string;
  amount: string | null;
  txSignature: string;
  blockTime: string;
};

export type MilestoneClaim = {
  id: string;
  submittedAt: string;
  objectionWindowEndsAt: string;
  status: ClaimStatus;
  proof: { note: string; links?: { label: string; url: string }[] };
  /** Aggregate only. Per-backer objection identities are never backer-facing. */
  objectionWeightPct: string;
  objectionThresholdPct: string;
  /**
   * Set once a creator appeals a failed claim (FR-606) and the panel has ruled (FR-607). Published
   * with written reasons, because a ruling nobody can read is not a ruling anyone can trust.
   */
  ruling?: { outcome: 'UPHELD_OBJECTION' | 'RELEASED'; reason: string; ruledAt: string } | null;
};

export type Milestone = {
  id: string;
  index: number;
  title: string;
  deliverable: string;
  tranchePct: string;
  evidenceDefinition: { type: string; source: string };
  claim: MilestoneClaim | null;
  receipt: Receipt | null;
  /** Fixture-only shortcut for the cancelled tail after a failure; live state is derived. */
  cancelled?: boolean;
};

export type CampaignListItem = {
  objectType: 'campaign';
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: IdeaCategory;
  region: string | null;
  type: CampaignType;
  status: CampaignStatus;
  /** USD. Decimal → string. */
  targetAmount: string;
  totalRaised: string;
  backerCount: number;
  deadline: string;
  /** When the campaign went public. Drives the "Newest" sort and the head of the timeline. */
  launchedAt: string;
  creator: PublicCreator;
  milestoneSummary: { total: number; released: number; underReview: number; failed: number };
  /**
   * Cover art. No image field exists on a campaign or an idea yet (gap backlog item 3), so cards fall
   * back to the deterministic band `Cover` draws from the id. Accepted from day one so the swap is a
   * data change and not a UI change.
   */
  coverImageUrl?: string | null;
  /**
   * The creator's pitch video. **Required to publish a campaign**, which is why it is not optional
   * here: every campaign a reader can reach has one.
   *
   * The reference leads its project page with a video and it is the highest-value element on it. For
   * an idea we deliberately did not require one — publishing an idea is free and must stay
   * frictionless. A campaign is different: it asks strangers for money, and a creator who will not
   * spend two minutes explaining the plan in their own voice is asking for a lot on very little.
   *
   * Two rules come with it, enforced in `CampaignMedia`: **never autoplay**, and **never load a byte
   * of video until the reader asks for it**. These screens are read on mid-range Android over metered
   * data (ideas-campaigns-brief §2).
   */
  videoUrl: string;
  /**
   * The still frame that stands in for the video. Optional: without one the deterministic cover
   * carries the play control, which is honest rather than broken.
   */
  videoPosterUrl?: string | null;
  /** Display topics, same web-side taxonomy the feed uses, for a more specific cover label. */
  topics?: string[];
};

/**
 * The fuller creator projection a campaign page renders: the same shape idea detail already uses,
 * plus the campaign history that ask 14 would return.
 *
 * `activeStrikes` is deliberately absent and must stay that way. Track record affects ranking; it is
 * never a public scarlet letter (campaign-brief.md §9 rule 6).
 */
export type CampaignCreator = PublicCreator & {
  bio?: string | null;
  tier: 'STARTER' | 'TRUSTED' | 'ESTABLISHED';
  completedCampaigns: number;
  ideasPublished: number;
  memberSince: string;
};

/** One line of a creator's history. The outcome label is derived from the counts, never stored. */
export type CreatorCampaignSummary = {
  id: string;
  slug: string;
  title: string;
  status: CampaignStatus;
  milestonesReleased: number;
  milestoneTotal: number;
  totalRaised: string;
  deadline: string;
};

/** What the money is for. From the idea snapshot until campaigns get their own story. */
export type AskLine = { label: string; amount: string };

export type CampaignDetail = Omit<CampaignListItem, 'creator'> & {
  ideaId: string | null;
  ideaSlug: string | null;
  creator: CampaignCreator;
  story: {
    problem: string;
    solution: string;
    targetUser: string;
    currentAlternative: string;
    askBreakdown: AskLine[];
    roadmap: string;
  };
  risks: string;
  workingCapitalPct: string;
  milestones: Milestone[];
  receipts: Receipt[];
  /** Present only for a signed-in backer. Absent means "not a backer", not zero. */
  myContribution?: {
    total: string;
    refund?: { status: 'PENDING' | 'RETURNED'; amount: string; returnedAt: string | null };
  };
};

/**
 * Catalogue query. Lives in the URL so a filtered view is linkable and server-rendered, same rule as
 * the feed. Applied in `campaigns-api.ts` today; ask 13 moves it to the API.
 */
export type CampaignSort = 'closing-soon' | 'newest' | 'most-backed' | 'most-delivered';

/** Lifecycle segments a reader can filter by. `delivering` is FUNDED plus ACTIVE-with-a-release. */
export type CampaignSegment = 'all' | 'raising' | 'delivering' | 'delivered' | 'not-delivered';

export type CampaignQuery = {
  segment?: CampaignSegment;
  category?: IdeaCategory | null;
  region?: string | null;
  sort?: CampaignSort;
};
