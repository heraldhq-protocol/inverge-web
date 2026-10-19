export type MoneyAmount = {
  atomic: string;
  currency: "USD";
  decimals: 2;
};

function wholeUnits({ atomic, decimals }: MoneyAmount) {
  return BigInt(atomic) / 10n ** BigInt(decimals);
}

function currencySymbol(currency: MoneyAmount["currency"]) {
  return (
    new Intl.NumberFormat("en-US", { currency, style: "currency" })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? currency
  );
}

export function formatMoney(amount: MoneyAmount): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: amount.currency,
    maximumFractionDigits: 0,
  }).format(wholeUnits(amount));
}

export function formatCompactMoney(amount: MoneyAmount): string {
  const value = wholeUnits(amount);
  const million = 1_000_000n;

  if (value < million) {
    return formatMoney(amount);
  }

  const tenths = (value * 10n) / million;
  const integer = tenths / 10n;
  const fraction = tenths % 10n;

  return `${currencySymbol(amount.currency)}${integer}${fraction === 0n ? "" : `.${fraction}`}M`;
}

export function sumMoneyAmounts(amounts: readonly MoneyAmount[]): MoneyAmount {
  return {
    atomic: amounts
      .reduce((total, amount) => total + BigInt(amount.atomic), 0n)
      .toString(),
    currency: "USD",
    decimals: 2,
  };
}

/**
 * Multiply an amount by a whole, non-negative factor — a quantity, or a count of
 * parcels.
 *
 * Integer maths only, and a fractional factor is refused rather than rounded:
 * two and a half of something is not a quantity this model has a meaning for, and
 * a silently rounded price is a price nobody agreed to.
 */
export function scaleMoneyAmount(
  amount: MoneyAmount,
  factor: number,
): MoneyAmount {
  if (!Number.isInteger(factor) || factor < 0) {
    throw new RangeError(
      `scaleMoneyAmount expects a non-negative integer factor, got ${factor}`,
    );
  }

  return {
    atomic: (BigInt(amount.atomic) * BigInt(factor)).toString(),
    currency: amount.currency,
    decimals: amount.decimals,
  };
}

/**
 * Parse a user-entered whole-currency decimal ("500", "500.00") into integer
 * atomic units, or `null` when it is not a positive amount. String/BigInt math
 * only — never floating point.
 */
export function parseUsdAmount(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed.includes("-")) return null;

  const cleaned = trimmed.replace(/[^0-9.]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;

  const [whole = "0", frac = ""] = cleaned.split(".");
  const atomic = BigInt(whole) * 100n + BigInt((frac + "00").slice(0, 2));
  if (atomic <= 0n) return null;
  return atomic.toString();
}

/** A whole-unit string for an edit input, e.g. "25000" for $250.00. */
export function atomicToWholeInput(amount: MoneyAmount): string {
  return (BigInt(amount.atomic) / 10n ** BigInt(amount.decimals)).toString();
}
