import { daysUntil } from '@/lib/format';
import type { Milestone, MilestoneState } from './types';

/**
 * Milestone state is DERIVED, never stored: `Milestone` has no status column, so it comes from the
 * latest claim plus its objection window (campaign-data-contract.md §3).
 *
 * Pure and I/O-free, so the tracker, the header summary and the receipts list cannot disagree about
 * which stage a campaign is on.
 */
export function milestoneState(m: Milestone): MilestoneState {
  if (m.cancelled) return 'CANCELLED';
  if (!m.claim) return 'UPCOMING';

  switch (m.claim.status) {
    case 'APPROVED':
      return 'RELEASED';
    case 'FAILED':
      return 'NOT_DELIVERED';
    case 'DISPUTED':
      return 'DISPUTED';
    case 'UNDER_REVIEW':
      // A window that has already closed still reads as under review: auto-approval at window close
      // is a backend event that flips the claim to APPROVED, and showing "released" before the money
      // has moved would be a lie about a payment.
      return 'UNDER_REVIEW';
    default:
      return 'UPCOMING';
  }
}

export const MILESTONE_STATE_LABEL: Record<MilestoneState, string> = {
  UPCOMING: 'Upcoming',
  UNDER_REVIEW: 'Under review',
  RELEASED: 'Released',
  NOT_DELIVERED: 'Not delivered',
  DISPUTED: 'With the review panel',
  CANCELLED: 'Cancelled',
};

/** Days left for backers to object. Whole days, computed at render time, never a ticking clock. */
export function objectionDaysLeft(m: Milestone, now: Date = new Date()): number | null {
  if (!m.claim || m.claim.status !== 'UNDER_REVIEW') return null;
  return daysUntil(m.claim.objectionWindowEndsAt, now);
}
