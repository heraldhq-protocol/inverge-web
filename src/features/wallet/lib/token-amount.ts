import { WALLET_ASSETS } from "@/features/wallet/lib/networks";
import type { WalletAssetId } from "@/features/wallet/types";

/**
 * Token amounts, in integer atomic units.
 *
 * A wallet amount is not a `MoneyAmount`: USDC has six decimals and SOL has
 * nine, while the campaign money model is two-decimal USD. Nothing here uses a
 * JavaScript number for an amount, and conversion from a USD record is explicit
 * and one-way.
 */

export type TokenAmount = {
  assetId: WalletAssetId;
  /** Integer atomic units as a decimal string. */
  atomic: string;
  decimals: number;
};

/** Solana's `u64` ceiling. An amount above it cannot be represented on chain. */
export const U64_MAX = 18_446_744_073_709_551_615n;

function powerOfTen(decimals: number): bigint {
  return 10n ** BigInt(decimals);
}

function assertDecimals(decimals: number): void {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) {
    throw new RangeError(`Invalid token decimals: ${decimals}`);
  }
}

function assertAtomic(atomic: string): bigint {
  if (!/^\d+$/.test(atomic)) {
    throw new RangeError(`Invalid atomic amount: ${atomic}`);
  }

  const value = BigInt(atomic);
  if (value > U64_MAX) {
    throw new RangeError("Atomic amount exceeds the u64 ceiling");
  }

  return value;
}

/**
 * Parse a user-entered decimal ("12.5") into atomic units, or `null`.
 *
 * Rejects signs, exponents, separators, more fractional digits than the asset
 * has, zero, and anything above `u64`. No rounding: an amount the wallet cannot
 * represent exactly is not an amount the user agreed to.
 */
export function parseTokenAmount(
  input: string,
  decimals: number,
): string | null {
  assertDecimals(decimals);

  const trimmed = input.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;

  const [whole = "0", fraction = ""] = trimmed.split(".");
  if (fraction.length > decimals) return null;

  const atomic =
    BigInt(whole) * powerOfTen(decimals) +
    BigInt((fraction + "0".repeat(decimals)).slice(0, decimals));

  if (atomic <= 0n || atomic > U64_MAX) return null;
  return atomic.toString();
}

function groupWhole(whole: string): string {
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Format atomic units as a decimal string, never through a JS number. */
export function formatTokenAmount(
  amount: TokenAmount,
  options: {
    maxFractionDigits?: number;
    minimumFractionDigits?: number;
    trimTrailingZeros?: boolean;
  } = {},
): string {
  assertDecimals(amount.decimals);
  const atomic = assertAtomic(amount.atomic);

  const maxFractionDigits = Math.min(
    options.maxFractionDigits ?? amount.decimals,
    amount.decimals,
  );
  const minimumFractionDigits = Math.min(
    options.minimumFractionDigits ?? 0,
    maxFractionDigits,
  );

  const scale = powerOfTen(amount.decimals);
  const whole = atomic / scale;
  const remainder = atomic % scale;
  const padded = remainder
    .toString()
    .padStart(amount.decimals, "0")
    .slice(0, maxFractionDigits);

  const trimmed =
    options.trimTrailingZeros === false ? padded : padded.replace(/0+$/, "");
  const fraction = trimmed.padEnd(minimumFractionDigits, "0");

  return fraction.length > 0
    ? `${groupWhole(whole.toString())}.${fraction}`
    : groupWhole(whole.toString());
}

export function formatTokenAmountWithSymbol(
  amount: TokenAmount,
  options?: Parameters<typeof formatTokenAmount>[1],
): string {
  return `${formatTokenAmount(amount, options)} ${WALLET_ASSETS[amount.assetId].symbol}`;
}

/** Add amounts of the same asset and decimals. */
export function sumTokenAmounts(amounts: readonly TokenAmount[]): TokenAmount {
  const first = amounts.at(0);
  if (!first) {
    throw new RangeError("sumTokenAmounts needs at least one amount");
  }

  assertDecimals(first.decimals);

  let total = 0n;
  for (const amount of amounts) {
    if (
      amount.assetId !== first.assetId ||
      amount.decimals !== first.decimals
    ) {
      throw new RangeError("Cannot add amounts in different assets or scales");
    }
    total += assertAtomic(amount.atomic);
  }

  if (total > U64_MAX) {
    throw new RangeError("Token total exceeds the u64 ceiling");
  }

  return {
    assetId: first.assetId,
    atomic: total.toString(),
    decimals: first.decimals,
  };
}

/** -1, 0, or 1. Amounts must share an asset and scale. */
export function compareTokenAmounts(
  a: TokenAmount,
  b: TokenAmount,
): -1 | 0 | 1 {
  if (a.assetId !== b.assetId || a.decimals !== b.decimals) {
    throw new RangeError(
      "Cannot compare amounts in different assets or scales",
    );
  }

  const left = assertAtomic(a.atomic);
  const right = assertAtomic(b.atomic);

  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function isInsufficient(
  balance: TokenAmount,
  required: TokenAmount,
): boolean {
  return compareTokenAmounts(balance, required) < 0;
}

/** The difference when `balance` is below `required`, otherwise null. */
export function shortfall(
  balance: TokenAmount,
  required: TokenAmount,
): TokenAmount | null {
  if (!isInsufficient(balance, required)) return null;

  return {
    assetId: balance.assetId,
    atomic: (BigInt(required.atomic) - BigInt(balance.atomic)).toString(),
    decimals: balance.decimals,
  };
}

export function zeroTokenAmount(
  assetId: WalletAssetId,
  decimals: number,
): TokenAmount {
  return { assetId, atomic: "0", decimals };
}

/**
 * Convert a two-decimal USD record to USDC atomic units.
 *
 * This is the only conversion in the feature. It exists because the campaign
 * model states USDC is 1:1 with its USD figures; it is never used to invent a
 * naira rate, a SOL price, or a fiat total.
 */
export function usdCentsToTokenAmount(
  cents: string,
  assetId: WalletAssetId = "USDC",
): TokenAmount {
  if (!/^\d+$/.test(cents)) {
    throw new RangeError(`Invalid USD cents: ${cents}`);
  }

  const decimals = WALLET_ASSETS[assetId].decimals;
  if (decimals === null) {
    throw new RangeError(`${assetId} has no verified decimals`);
  }
  if (decimals < 2) {
    throw new RangeError(
      `${assetId} cannot represent a two-decimal USD record`,
    );
  }

  return {
    assetId,
    atomic: (BigInt(cents) * powerOfTen(decimals - 2)).toString(),
    decimals,
  };
}
