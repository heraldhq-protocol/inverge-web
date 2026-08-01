import { parseDecimal } from '@/lib/format';
import { milestoneState } from './milestone-state';
import type {
  CampaignDetail,
  CampaignListItem,
  CampaignSegment,
  CampaignSort,
  CreatorCampaignSummary,
  Milestone,
} from './types';

/**
 * Derived campaign figures. Pure, no I/O, no React — the same separation `inverge-api` keeps between
 * `pledge-weighting.ts` and the services that call it.
 *
 * Two rules hold everything here together:
 *
 * 1. **Money is derived from receipts, never from our own arithmetic on contributions.** FR-803 makes
 *    the indexer the source of truth for every figure on the transparency surfaces, so a released
 *    total is the sum of the release receipts and nothing else. When ask 12 lands, the escrow band
 *    swaps to the indexer's own totals and these functions keep serving the per-campaign views.
 * 2. **Outcome labels are derived, never stored.** The reference lets a creator self-report
 *    "Marked as fulfilled". Ours counts released stages, so there is no field anyone can set to claim
 *    a delivery that did not happen (campaign-brief.md §9 rule 5).
 */

const RELEASE_KINDS = new Set(['TRANCHE_RELEASED', 'WORKING_CAPITAL_RELEASED']);

/** Everything paid out to the creator so far, from the release receipts. */
export function releasedTotal(campaign: CampaignDetail): number {
  return campaign.receipts
    .filter((r) => RELEASE_KINDS.has(r.kind))
    .reduce((sum, r) => sum + parseDecimal(r.amount), 0);
}

/** Everything returned to backers so far, from the refund receipts. */
export function refundedTotal(campaign: CampaignDetail): number {
  return campaign.receipts
    .filter((r) => r.kind === 'REFUND_CLAIMED')
    .reduce((sum, r) => sum + parseDecimal(r.amount), 0);
}

/**
 * What is still in escrow: raised, less what has been released, less what has gone back. Floored at
 * zero, because a rounding artefact rendering as a negative balance would read as a bug in the escrow
 * rather than in the subtraction.
 */
export function heldTotal(campaign: CampaignDetail): number {
  const held = parseDecimal(campaign.totalRaised) - releasedTotal(campaign) - refundedTotal(campaign);
  return Math.max(0, held);
}

export type EscrowSummary = {
  held: number;
  released: number;
  refunded: number;
  delivered: number;
  raising: number;
  refundedCampaigns: number;
};

/** The FR-801 figures, summed across every campaign we hold. Replaced by ask 12 at the platform level. */
export function escrowSummary(campaigns: CampaignDetail[]): EscrowSummary {
  return campaigns.reduce<EscrowSummary>(
    (acc, c) => ({
      held: acc.held + heldTotal(c),
      released: acc.released + releasedTotal(c),
      refunded: acc.refunded + refundedTotal(c),
      delivered: acc.delivered + (c.status === 'COMPLETED' ? 1 : 0),
      raising: acc.raising + (c.status === 'ACTIVE' ? 1 : 0),
      refundedCampaigns: acc.refundedCampaigns + (c.status === 'FAILED' ? 1 : 0),
    }),
    { held: 0, released: 0, refunded: 0, delivered: 0, raising: 0, refundedCampaigns: 0 }
  );
}

/** The stage whose objection window is open, if one is. At most one per campaign by construction. */
export function openObjection(campaign: CampaignDetail): Milestone | null {
  return campaign.milestones.find((m) => milestoneState(m) === 'UNDER_REVIEW') ?? null;
}

/** The stage a creator appealed and the panel has not ruled on (FR-606/607). */
export function disputedMilestone(campaign: CampaignDetail): Milestone | null {
  return campaign.milestones.find((m) => milestoneState(m) === 'DISPUTED') ?? null;
}

export function failedMilestone(campaign: CampaignDetail): Milestone | null {
  return campaign.milestones.find((m) => milestoneState(m) === 'NOT_DELIVERED') ?? null;
}

export type FundingProgress = {
  raised: number;
  target: number;
  /** Raised over target, uncapped. 1.19 means 19% past the goal. */
  ratio: number;
  /** Whole percent, uncapped, for display. */
  pct: number;
  over: boolean;
  /** Amount past the goal. Zero unless `over`. */
  surplus: number;
};

/**
 * Funding progress, uncapped.
 *
 * An idea's meter is capped at 100 because progress toward a multi-criterion gate cannot exceed the
 * gate (teardown §8.3). A campaign's is not: over-target is real money and pretending otherwise
 * would understate what backers actually did.
 *
 * What we do not do is turn it into spectacle. The reference celebrates 1,952% with a starburst;
 * ours states the percentage plainly and names the surplus in money, because "119% of goal" is
 * useful and "1,952% funded" is a growth mechanic wearing a number
 * (campaign-brief.md §9 rule 4).
 */
export function fundingProgress(campaign: Pick<CampaignListItem, 'totalRaised' | 'targetAmount'>): FundingProgress {
  const raised = parseDecimal(campaign.totalRaised);
  const target = parseDecimal(campaign.targetAmount);
  const ratio = target > 0 ? raised / target : 0;
  return {
    raised,
    target,
    ratio,
    pct: Math.round(ratio * 100),
    over: raised > target && target > 0,
    surplus: Math.max(0, raised - target),
  };
}

/**
 * How the money splits. Two different bases, and the difference is deliberate.
 *
 * **Working capital is a share of the target** (FR-503a). The target is the budget the creator
 * justified line by line and reviewers approved; the raise is whatever the internet decided. This is
 * the only money that moves before anyone has verified anything, so pegging it to an uncapped raise
 * is the one place the arithmetic is actually dangerous: a $1,000 target that raises $20,000 would
 * pay out $4,000 up front, four times the entire plan, against nothing.
 *
 * **Stage shares are of everything left after that.** A campaign that overfunds is being asked to do
 * more than it budgeted for, and the extra has to be available while the work happens rather than
 * arriving after it is finished. So the tranches scale with the raise and the surplus is spread
 * across every stage.
 *
 * The two together always balance to exactly the amount raised, which is the property that makes the
 * escrow explainable: working capital plus every tranche equals the raise, with nothing left over
 * and nothing invented.
 */
export function workingCapitalAmount(
  campaign: Pick<CampaignDetail, 'workingCapitalPct' | 'targetAmount' | 'totalRaised'>
): number {
  const pct = parseDecimal(campaign.workingCapitalPct) / 100;
  const wanted = pct * parseDecimal(campaign.targetAmount);
  // Guard the pathological case: under-target funding cannot pay out more than exists.
  return Math.min(wanted, parseDecimal(campaign.totalRaised));
}

/** Everything the stages divide between them: the raise, less the upfront. */
export function distributableAmount(
  campaign: Pick<CampaignDetail, 'workingCapitalPct' | 'targetAmount' | 'totalRaised'>
): number {
  return Math.max(0, parseDecimal(campaign.totalRaised) - workingCapitalAmount(campaign));
}

/** What a stage releases, in money rather than a percentage of an unfamiliar total. */
export function trancheAmount(campaign: CampaignDetail, milestone: Milestone): number {
  return (parseDecimal(milestone.tranchePct) / 100) * distributableAmount(campaign);
}

/**
 * The last stage in the plan.
 *
 * It is the delivery stage: the one that confirms the whole thing landed, and therefore the last
 * money a creator is paid. Nothing is held back for it beyond its own share — it matters because of
 * *when* it pays, not how much.
 */
export function isFinalMilestone(campaign: CampaignDetail, milestone: Milestone): boolean {
  const last = campaign.milestones[campaign.milestones.length - 1];
  return Boolean(last) && last.id === milestone.id;
}

/** Raised above target. Shown as context; it does not change how the stages divide. */
export function surplusAmount(campaign: Pick<CampaignDetail, 'totalRaised' | 'targetAmount'>): number {
  return Math.max(0, parseDecimal(campaign.totalRaised) - parseDecimal(campaign.targetAmount));
}

/**
 * What goes back to backers when a stage is not delivered (FR-506): every share not yet released, out
 * of the same pot the released ones came from. The upfront is not refundable and is not in it.
 */
export function refundableAmount(campaign: CampaignDetail, unreleasedPct: number): number {
  return (unreleasedPct / 100) * distributableAmount(campaign);
}

/**
 * Where a campaign sits in its lifecycle, for the catalogue's filter segments.
 *
 * `delivering` is deliberately not a status: it is "funding is done and stages are in flight", which
 * spans FUNDED and ACTIVE-past-its-deadline. A reader filtering for it wants to watch delivery, and
 * the status column alone cannot answer that.
 */
export function segmentOf(campaign: CampaignListItem): Exclude<CampaignSegment, 'all'> {
  if (campaign.status === 'FAILED') return 'not-delivered';
  if (campaign.status === 'COMPLETED') return 'delivered';
  if (campaign.status === 'FUNDED') return 'delivering';

  const stagesStarted =
    campaign.milestoneSummary.released > 0 ||
    campaign.milestoneSummary.underReview > 0 ||
    campaign.milestoneSummary.failed > 0;
  return stagesStarted ? 'delivering' : 'raising';
}

export const SEGMENT_LABEL: Record<CampaignSegment, string> = {
  all: 'All',
  raising: 'Raising now',
  delivering: 'Delivering',
  delivered: 'Delivered',
  'not-delivered': 'Not delivered',
};

export const SORT_LABEL: Record<CampaignSort, string> = {
  'closing-soon': 'Closing soon',
  newest: 'Newest',
  'most-backed': 'Most backed',
  'most-delivered': 'Most delivered',
};

/**
 * The outcome label, counted rather than claimed.
 *
 * A failed campaign says how far it got before it failed, not just that it failed: "2 of 4 stages
 * delivered" is the honest reading and it is also the more useful one, because stages already
 * released were not clawed back.
 */
export function outcomeLabel(summary: CampaignListItem['milestoneSummary'], status: string): string {
  const { total, released, underReview } = summary;

  if (status === 'COMPLETED') {
    return `All ${total} ${total === 1 ? 'stage' : 'stages'} delivered`;
  }
  if (status === 'FAILED') {
    return `${released} of ${total} stages delivered`;
  }
  if (underReview > 0) return 'A stage is under review';
  if (released > 0) return `${released} of ${total} stages delivered`;
  if (status === 'FUNDED') return 'Funded, work starting';
  return 'Raising now';
}

/** A creator's other campaigns, newest first. What ask 14 would return on the creator projection. */
export function creatorHistory(
  campaigns: CampaignDetail[],
  creatorId: string,
  excludeId?: string
): CreatorCampaignSummary[] {
  return campaigns
    .filter((c) => c.creator.id === creatorId && c.id !== excludeId)
    .sort((a, b) => new Date(b.launchedAt).getTime() - new Date(a.launchedAt).getTime())
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      status: c.status,
      milestonesReleased: c.milestoneSummary.released,
      milestoneTotal: c.milestoneSummary.total,
      totalRaised: c.totalRaised,
      deadline: c.deadline,
    }));
}

/** Stages released across every campaign a creator has run. The un-fakeable number. */
export function creatorTrackRecord(campaigns: CampaignDetail[], creatorId: string) {
  const mine = campaigns.filter((c) => c.creator.id === creatorId);
  return {
    campaigns: mine.length,
    delivered: mine.filter((c) => c.status === 'COMPLETED').length,
    stagesReleased: mine.reduce((n, c) => n + c.milestoneSummary.released, 0),
    stagesTotal: mine.reduce((n, c) => n + c.milestoneSummary.total, 0),
    raisedTotal: mine.reduce((n, c) => n + parseDecimal(c.totalRaised), 0),
  };
}
