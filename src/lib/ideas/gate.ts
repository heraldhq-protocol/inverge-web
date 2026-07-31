import { clamp01, parseDecimal } from '@/lib/format';

/**
 * The FR-204 validation gate, client side. Pure and I/O-free so it can be unit-tested and reused by
 * the card, the panel and the breakdown without any of them disagreeing.
 *
 * Mirrors `buildGateProgress` in the API (`src/modules/metrics/insights-compute.ts`) exactly,
 * including `requiredWeighted = max(platform floor, pct of ask, creator's own target)`.
 *
 * The thresholds are duplicated here because the public idea endpoint does not return them — that is
 * ask #5 in the API gap backlog. They are admin-tunable at runtime on the backend, so **these
 * constants can drift from production**. When the endpoint exposes them, delete the constants and
 * pass the values in; the maths does not change.
 */
export const GATE_DEFAULTS = {
  minSupporters: 50,
  minWeightedUSD: 2000,
  minPctOfAsk: 0.1,
  minFeedbackCount: 10,
  minAvgFeedbackRating: 3,
  windowDays: 90,
  sustainmentDays: 14,
} as const;

export type GateCriterionKey = 'supporters' | 'interest' | 'feedbackCount' | 'feedbackScore';

export type GateCriterion = {
  key: GateCriterionKey;
  label: string;
  /** Rendered through <Amount> when `money`, otherwise <Count>. */
  money: boolean;
  have: number;
  need: number;
  /** 0..1, capped: an idea at three times the supporter floor is not "at 300%". */
  pct: number;
  met: boolean;
};

export type GateProgress = {
  criteria: GateCriterion[];
  requiredWeighted: number;
  /** The lowest-scoring unmet criterion — what is actually holding the idea back. */
  binding: GateCriterion;
  metCount: number;
  meetsThreshold: boolean;
  /** Overall figure for the meter: the binding constraint, never an average of the four. */
  overallPct: number;
};

export type GateInput = {
  supporterCount: number;
  weightedPrePledgeTotal: string | number;
  feedbackCount: number;
  feedbackScore: string | number;
  askAmount: string | number;
  creatorPrePledgeTarget?: string | number | null;
};

export function buildGateProgress(
  input: GateInput,
  thresholds: typeof GATE_DEFAULTS = GATE_DEFAULTS
): GateProgress {
  const ask = parseDecimal(input.askAmount);
  const creatorTarget = parseDecimal(input.creatorPrePledgeTarget);
  const requiredWeighted = Math.max(
    thresholds.minWeightedUSD,
    thresholds.minPctOfAsk * ask,
    creatorTarget
  );

  const criterion = (
    key: GateCriterionKey,
    label: string,
    money: boolean,
    have: number,
    need: number
  ): GateCriterion => ({
    key,
    label,
    money,
    have,
    need,
    pct: need > 0 ? clamp01(have / need) : 1,
    met: have >= need,
  });

  const criteria: GateCriterion[] = [
    criterion('supporters', 'Supporters', false, input.supporterCount, thresholds.minSupporters),
    criterion(
      'interest',
      'Estimated interest',
      true,
      parseDecimal(input.weightedPrePledgeTotal),
      requiredWeighted
    ),
    criterion(
      'feedbackCount',
      'Survey responses',
      false,
      input.feedbackCount,
      thresholds.minFeedbackCount
    ),
    criterion(
      'feedbackScore',
      'Average rating',
      false,
      parseDecimal(input.feedbackScore),
      thresholds.minAvgFeedbackRating
    ),
  ];

  // The binding constraint: the weakest unmet criterion, or the weakest overall once all are met.
  const unmet = criteria.filter((c) => !c.met);
  const pool = unmet.length > 0 ? unmet : criteria;
  const binding = pool.reduce((worst, c) => (c.pct < worst.pct ? c : worst), pool[0]);

  return {
    criteria,
    requiredWeighted,
    binding,
    metCount: criteria.filter((c) => c.met).length,
    meetsThreshold: unmet.length === 0,
    overallPct: binding.pct,
  };
}

/**
 * Days left in the 90-day validation window (FR-204a). The window is renewable once, so a value of
 * 0 is not automatically the end of the road, and the copy never says "expired".
 */
export function validationDaysLeft(
  validatingSince: string | null | undefined,
  windowDays: number = GATE_DEFAULTS.windowDays,
  now: Date = new Date()
): number | null {
  if (!validatingSince) return null;
  const started = new Date(validatingSince);
  if (Number.isNaN(started.getTime())) return null;
  const elapsed = Math.floor((now.getTime() - started.getTime()) / 86_400_000);
  return Math.max(0, windowDays - elapsed);
}
