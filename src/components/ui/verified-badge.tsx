import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';

export type VerificationTier = 'TIER_1_ID' | 'TIER_2_CAC' | 'TIER_3_TRACK_RECORD';

export interface VerificationTierInfo {
  tier: VerificationTier;
  title: string;
  shortLabel: string;
  description: string;
  /** Weight within the single accent hue. Never a second colour — see the note below. */
  emphasis: 'low' | 'medium' | 'high';
}

/**
 * What each tier actually means, mapped to the thing the backend really checks.
 *
 * Wording matters here more than anywhere else on the site, because this badge is a factual claim
 * about a person:
 * - Tier 1 is Didit KYC: identity confirmed against a document and a liveness check.
 * - Tier 2 is Didit KYB: a registered business, its directors and its CAC record.
 * - Tier 3 is **not a verification at all** — nobody verified anything. It is a delivery record:
 *   campaigns whose milestones backers approved. It is labelled as a record rather than as
 *   verification, because inflating it into one would be the exact overstatement the product cannot
 *   afford. It also never appears as an absence: a creator without it is new, not suspect.
 */
export const VERIFICATION_TIERS: Record<VerificationTier, VerificationTierInfo> = {
  TIER_1_ID: {
    tier: 'TIER_1_ID',
    title: 'Identity verified',
    shortLabel: 'Verified',
    description:
      'This creator confirmed who they are with an identity document and a live selfie check. That is required before anyone can receive money, and it is never required to publish an idea.',
    emphasis: 'low',
  },
  TIER_2_CAC: {
    tier: 'TIER_2_CAC',
    title: 'Business verified',
    shortLabel: 'Business verified',
    description:
      'A registered business, checked against the companies register along with its directors. Money from a campaign would go to the company rather than to a person.',
    emphasis: 'medium',
  },
  TIER_3_TRACK_RECORD: {
    tier: 'TIER_3_TRACK_RECORD',
    title: 'Has delivered before',
    shortLabel: 'Has delivered before',
    description:
      'This creator has finished at least one campaign where backers reviewed and approved every stage. It describes what they have done, not a check anyone performed on them.',
    emphasis: 'high',
  },
};

/**
 * Creator verification mark.
 *
 * **One hue.** Hierarchy comes from tints of the accent green plus weight, never from a second colour
 * (conventions §5.2): amber and emerald variants would put three hues on one card and make the paid
 * "Promoted" label harder to notice, which is a compliance problem rather than a taste one (FR-206a).
 *
 * **No shield, no star, no tick-in-a-circle** (app-mockup-kit §4 [must]). Those are the stock trust
 * badges this product category reaches for by reflex. A bare check plus the words does the job.
 */
export function VerifiedBadge({
  tier = 'TIER_1_ID',
  showText = true,
  className,
}: {
  /** Accepts the legacy boolean so callers still holding `identityVerified` keep working. */
  tier?: VerificationTier | boolean;
  showText?: boolean;
  className?: string;
}) {
  const resolved: VerificationTier = typeof tier === 'boolean' ? 'TIER_1_ID' : tier;
  const info = VERIFICATION_TIERS[resolved] ?? VERIFICATION_TIERS.TIER_1_ID;

  const emphasis = {
    low: 'bg-accent-50 text-accent-900 border-accent-500/25',
    medium: 'bg-accent-100 text-accent-900 border-accent-500/40',
    high: 'bg-accent-100 text-accent-900 border-accent-700/50 font-bold',
  }[info.emphasis];

  return (
    <Tooltip
      position="top"
      label={`About this creator: ${info.title}`}
      content={
        <span className="block space-y-1">
          <span className="block font-semibold text-accent-100">{info.title}</span>
          <span className="block text-paper/90">{info.description}</span>
        </span>
      }
    >
      <span
        className={cn(
          'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold',
          emphasis,
          className
        )}
      >
        <Check />
        {showText && <span>{info.shortLabel}</span>}
        {!showText && <span className="sr-only">{info.title}</span>}
      </span>
    </Tooltip>
  );
}

function Check() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
