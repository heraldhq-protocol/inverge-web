// Shapes mirror docs/campaign-data-contract.md §2. Nothing here is implemented in inverge-api yet,
// so these types plus the fixtures are the contract the screens are built against.

import type { IdeaCategory, PublicCreator } from '@/lib/feed/types';

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
  creator: PublicCreator;
  milestoneSummary: { total: number; released: number; underReview: number; failed: number };
};

export type CampaignDetail = CampaignListItem & {
  ideaId: string | null;
  story: { problem: string; solution: string; roadmap: string };
  risks: string;
  workingCapitalPct: string;
  launchedAt: string;
  milestones: Milestone[];
  receipts: Receipt[];
  /** Present only for a signed-in backer. Absent means "not a backer", not zero. */
  myContribution?: {
    total: string;
    refund?: { status: 'PENDING' | 'RETURNED'; amount: string; returnedAt: string | null };
  };
};
