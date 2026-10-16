import type { MoneyAmount } from "@/features/home/types";

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

export function formatMoney(amount: MoneyAmount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: amount.currency,
    maximumFractionDigits: 0,
  }).format(wholeUnits(amount));
}

export function formatCompactMoney(amount: MoneyAmount) {
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
