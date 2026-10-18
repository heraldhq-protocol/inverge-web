import { formatMoney, sumMoneyAmounts, type MoneyAmount } from "@/lib/money";

/**
 * Money and share arithmetic for campaigns.
 *
 * Everything here is integer maths. Percentages are basis points (1% = 100bps)
 * so a 5% fee or a 33.33% tranche is exact; converting to a display percentage
 * is the only place a fractional value appears, and it is never fed back into an
 * amount.
 */

export const TOTAL_BPS = 10_000;

export function usd(atomic: bigint | string): MoneyAmount {
  return { atomic: atomic.toString(), currency: "USD", decimals: 2 };
}

/** A share of `amount`, rounded down to the cent. Exact for any MoneyAmount. */
export function bpsOf(amount: MoneyAmount, bps: number): MoneyAmount {
  if (!Number.isInteger(bps) || bps < 0) {
    throw new RangeError(`bpsOf expects a non-negative integer, got ${bps}`);
  }

  return usd((BigInt(amount.atomic) * BigInt(bps)) / BigInt(TOTAL_BPS));
}

/** "2500" -> "25%", "3350" -> "33.5%". Trailing zeros are dropped. */
export function formatBps(bps: number): string {
  const percent = (bps / 100).toFixed(2);
  return `${percent.replace(/\.?0+$/, "")}%`;
}

/**
 * Parse a percentage a creator typed into basis points, or `null` when it is not
 * a valid share. Accepts up to two decimal places so the rounding is explicit
 * rather than hidden in a float multiply.
 */
export function parsePercentToBps(input: string): number | null {
  const trimmed = input.trim().replace(/%$/, "").trim();
  if (trimmed === "" || trimmed.includes("-")) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;

  const [whole = "0", fraction = ""] = trimmed.split(".");
  const padded = `${fraction}00`.slice(0, 2);

  return Number(whole) * 100 + Number(padded);
}

export function sumBps(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function sumAmounts(amounts: readonly MoneyAmount[]): MoneyAmount {
  return sumMoneyAmounts(amounts);
}

/**
 * Percentage of the target reached, as a rounded-down integer percent.
 *
 * Returns `null` when either figure is unknown, so a caller cannot render a
 * confident "0%" for a total it does not have. It may exceed 100: an
 * all-or-nothing campaign that overshoots is genuinely above target.
 */
export function fundedPercent(
  raised: MoneyAmount | null,
  target: MoneyAmount,
): number | null {
  const targetAtomic = BigInt(target.atomic);
  if (targetAtomic <= 0n || raised === null) return null;

  return Number((BigInt(raised.atomic) * 100n) / targetAtomic);
}

/** The 0–1 ratio `Meter` expects, or `null` when the total is unknown. */
export function fundedRatio(
  raised: MoneyAmount | null,
  target: MoneyAmount,
): number | null {
  const percent = fundedPercent(raised, target);
  return percent === null ? null : percent / 100;
}

/** `target - raised`, floored at zero. Null when the raised total is unknown. */
export function remainingToTarget(
  raised: MoneyAmount | null,
  target: MoneyAmount,
): MoneyAmount | null {
  if (raised === null) return null;

  const remaining = BigInt(target.atomic) - BigInt(raised.atomic);
  return usd(remaining > 0n ? remaining : 0n);
}

/** Exact money text for the amount a backer will be charged, plus a "—" fallback. */
export function formatOrUnknown(amount: MoneyAmount | null): string {
  return amount === null ? "—" : formatMoney(amount);
}

/**
 * Format an integer kobo amount recorded by a payment provider as naira.
 *
 * Pure string maths, for the same reason the rest of the money model is: a
 * recorded fiat amount is a fact and must not be round-tripped through a float to
 * be displayed. Grouping is applied to the whole-naira part only.
 */
export function formatKoboAsNaira(atomic: string): string {
  const digits = atomic.replace(/[^0-9]/g, "") || "0";
  const padded = digits.padStart(3, "0");
  const whole = padded.slice(0, -2);
  const kobo = padded.slice(-2);

  return `₦${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${kobo}`;
}
