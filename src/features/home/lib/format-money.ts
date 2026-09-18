import type { NairaAmount } from "@/features/home/types";

function wholeUnits({ atomic, decimals }: NairaAmount) {
  return BigInt(atomic) / 10n ** BigInt(decimals);
}

export function formatNaira(amount: NairaAmount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: amount.currency,
    maximumFractionDigits: 0,
  }).format(wholeUnits(amount));
}

export function formatCompactNaira(amount: NairaAmount) {
  const value = wholeUnits(amount);
  const million = 1_000_000n;

  if (value < million) {
    return formatNaira(amount);
  }

  const tenths = (value * 10n) / million;
  const integer = tenths / 10n;
  const fraction = tenths % 10n;

  return `₦${integer}${fraction === 0n ? "" : `.${fraction}`}M`;
}

export function sumNairaAmounts(amounts: readonly NairaAmount[]): NairaAmount {
  return {
    atomic: amounts
      .reduce((total, amount) => total + BigInt(amount.atomic), 0n)
      .toString(),
    currency: "NGN",
    decimals: 2,
  };
}
