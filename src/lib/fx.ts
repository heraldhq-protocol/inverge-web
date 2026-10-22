import type { MoneyAmount } from "@/lib/money";

/**
 * Illustrative NGN conversion for display only.
 *
 * Inverge's unit of account is USD (D-010) and every monetary record stays in
 * integer USD cents. This rate exists so a Nigerian reader can sanity-check a
 * prize figure in naira; it is not a settlement rate, not a quote, and must
 * never be used to compute a payment, refund, tranche, or score.
 *
 * Replace the constant with an authoritative server-provided rate before any
 * surface presents naira as a commitment.
 */
export const ILLUSTRATIVE_NGN_PER_USD = 1600;

/** Naira is quoted in whole units for readability; no kobo arithmetic here. */
const NGN_ROUNDING = 1_000n;

export type NgnEstimate = {
  /** Rounded naira string, e.g. "8000000". */
  atomic: string;
  currency: "NGN";
  /** Whole naira. */
  decimals: 0;
  /** Human-readable, e.g. "₦8,000,000". */
  formatted: string;
  rate: number;
  /** True when the figure is derived rather than recorded. */
  estimated: true;
};

/**
 * Convert a USD amount into a rounded naira estimate.
 *
 * Uses BigInt from the USD atomic cents to avoid floating-point money math.
 * Rounding is to the nearest ₦1,000, which is honest about precision: a display
 * rate is not accurate to the naira.
 */
export function estimateNgn(
  amount: MoneyAmount,
  rate: number = ILLUSTRATIVE_NGN_PER_USD,
): NgnEstimate {
  const usdCents = BigInt(amount.atomic);
  const safeRate =
    Number.isFinite(rate) && rate > 0
      ? Math.round(rate)
      : ILLUSTRATIVE_NGN_PER_USD;

  // cents / 100 * rate = whole naira
  const wholeNaira = (usdCents * BigInt(safeRate)) / 100n;
  const rounded =
    ((wholeNaira + NGN_ROUNDING / 2n) / NGN_ROUNDING) * NGN_ROUNDING;

  return {
    atomic: rounded.toString(),
    currency: "NGN",
    decimals: 0,
    estimated: true,
    formatted: new Intl.NumberFormat("en-NG", {
      currency: "NGN",
      maximumFractionDigits: 0,
      style: "currency",
    }).format(rounded),
    rate: safeRate,
  };
}

export function formatNgnEstimate(amount: MoneyAmount, rate?: number): string {
  return estimateNgn(amount, rate).formatted;
}
