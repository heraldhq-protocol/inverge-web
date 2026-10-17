import type { IdeaGateThresholds } from "@/features/ideas/types";
import type { MoneyAmount } from "@/lib/money";

export type GateCheck =
  | {
      current: number;
      met: boolean;
      required: number;
      requirement: "supporters";
    }
  | {
      current: MoneyAmount;
      met: boolean;
      required: MoneyAmount;
      requirement: "pre-pledged";
    };

export type GateResult = {
  checks: readonly GateCheck[];
  /** FR-204: every requirement reached, so the idea may become a campaign draft. */
  convertible: boolean;
};

/**
 * Evaluate FR-204's validation threshold.
 *
 * Pure, so the idea page's breakdown, the insights checklist, and the tests all
 * read one definition of "ready to convert". Pre-pledge totals compare as
 * integer atomic cents; both amounts are the same currency at the same
 * precision (D-010), so a raw comparison is exact — never floating point.
 */
export function evaluateGate(
  metrics: { prePledged: MoneyAmount; supporters: number },
  thresholds: IdeaGateThresholds,
): GateResult {
  const checks: GateCheck[] = [
    {
      current: metrics.supporters,
      met: metrics.supporters >= thresholds.minSupporters,
      required: thresholds.minSupporters,
      requirement: "supporters",
    },
    {
      current: metrics.prePledged,
      met:
        BigInt(metrics.prePledged.atomic) >=
        BigInt(thresholds.minPrePledged.atomic),
      required: thresholds.minPrePledged,
      requirement: "pre-pledged",
    },
  ];

  return { checks, convertible: checks.every((check) => check.met) };
}
