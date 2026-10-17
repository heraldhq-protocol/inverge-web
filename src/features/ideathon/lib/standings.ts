import type { DiscoveryCategory } from "@/features/home/discovery-categories";
import type {
  CompetitionCategoryBreakdown,
  CompetitionTotals,
  EntrySignals,
  Ideathon,
  StandingEntry,
  TierBucket,
  VerificationTier,
} from "@/features/ideathon/types";
import { TIER_WEIGHTS } from "@/features/ideathon/types";
import { sumMoneyAmounts } from "@/lib/money";

const TIERS: readonly VerificationTier[] = ["EMAIL", "SOCIAL", "VERIFIED"];

function round4(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

/**
 * Weighted support score (community-loop proposal FR-707).
 *
 * Support, structured feedback, and a pre-pledge each contribute one flat point
 * per account, multiplied by that account's verification weight. The pre-pledge
 * amount is deliberately absent: money must never rank. Because the input is
 * tier buckets rather than amounts, a boost or prize value cannot enter here.
 */
export function entryScore(signals: EntrySignals): number {
  return round4(
    TIERS.reduce((total, tier) => {
      const points =
        signals.supporters[tier] +
        signals.feedback[tier] +
        signals.prePledge[tier];
      return total + points * TIER_WEIGHTS[tier];
    }, 0),
  );
}

export function totalSupporters(bucket: TierBucket): number {
  return bucket.EMAIL + bucket.SOCIAL + bucket.VERIFIED;
}

/**
 * Order entries and assign ranks with deterministic tie-breaks: weighted score
 * descending, supporter count descending, then the idea id so two identical
 * rows never swap between renders.
 */
export function rankEntries(
  entries: readonly Omit<StandingEntry, "rank">[],
): StandingEntry[] {
  return [...entries]
    .toSorted((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      const leftSupporters = totalSupporters(left.signals.supporters);
      const rightSupporters = totalSupporters(right.signals.supporters);
      if (rightSupporters !== leftSupporters) {
        return rightSupporters - leftSupporters;
      }
      return left.idea.id.localeCompare(right.idea.id);
    })
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function competitionTotals(entries: readonly StandingEntry[]): CompetitionTotals {
  return {
    supporters: entries.reduce(
      (total, entry) => total + totalSupporters(entry.signals.supporters),
      0,
    ),
    estimatedInterest: sumMoneyAmounts(
      entries.map((entry) => entry.idea.prePledged),
    ),
    feedback: entries.reduce(
      (total, entry) => total + totalSupporters(entry.signals.feedback),
      0,
    ),
    entries: entries.length,
  };
}

export function categoryBreakdown(
  entries: readonly StandingEntry[],
): CompetitionCategoryBreakdown[] {
  const counts = new Map<
    string,
    { category: string; categoryValue: DiscoveryCategory; count: number }
  >();

  for (const entry of entries) {
    const { category, discoveryCategory } = entry.idea;
    const existing = counts.get(discoveryCategory);
    counts.set(discoveryCategory, {
      category,
      categoryValue: discoveryCategory,
      count: (existing?.count ?? 0) + 1,
    });
  }

  return [...counts.values()].toSorted(
    (left, right) =>
      right.count - left.count || left.category.localeCompare(right.category),
  );
}

/**
 * Share of the leader's score, for a restrained row-level progress hint. A
 * score of zero has no meaningful share, so callers render a dash instead.
 */
export function scoreShare(score: number, topScore: number): number {
  if (topScore <= 0) return 0;
  return Math.max(0, Math.min(1, score / topScore));
}

export function isCompetitionLive(competition: Ideathon, now: Date): boolean {
  return (
    competition.status === "open" &&
    now.getTime() < new Date(competition.endsAt).getTime()
  );
}

export function competitionPhaseLabel(
  competition: Ideathon,
  now: Date,
): string {
  const starts = new Date(competition.startsAt).getTime();
  const ends = new Date(competition.endsAt).getTime();
  const time = now.getTime();

  if (competition.status === "archived") return "Archived";
  if (competition.status === "published") return "Results published";
  if (competition.status === "closed") return "Submissions closed";
  if (time < starts) return "Opens soon";
  if (time > ends) return "Submissions closed";
  return "Accepting entries";
}

export { TIERS };
