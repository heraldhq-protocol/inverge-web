import { Pill } from '@/components/ui/pill';
import type { Reason } from '@/lib/feed/types';

/**
 * The feed's explainability chip. Exactly one per card, always present, fixed position — the honest
 * answer to "why am I seeing this" (feed-design.md §8).
 *
 * PROMOTED is handled by the promoted card treatment, not here: a paid slot must be visually distinct
 * from organic results, and rendering its label in the same chip slot as an organic reason is exactly
 * the merge FR-206a forbids.
 */
export function ReasonChip({ reason, size = 'sm' }: { reason: Reason; size?: 'xs' | 'sm' }) {
  if (reason.code === 'PROMOTED') return null;

  return (
    <Pill tone={reason.code === 'EXPLORE' ? 'neutral' : 'accent'} size={size} className="font-medium">
      {reason.label}
    </Pill>
  );
}
