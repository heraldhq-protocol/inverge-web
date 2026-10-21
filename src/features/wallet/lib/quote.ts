import type { WalletAssetId } from "@/features/wallet/types";

/**
 * On-ramp quote evaluation.
 *
 * A card or bank contribution needs a live quote: what the provider charges in
 * the backer's currency, its fee, what settles, and when the quote stops being
 * valid. Without a quote the route is unavailable. An expired quote is never
 * treated as current, even if the numbers look plausible.
 */

export type OnRampQuote = {
  id: string;
  provider: string;
  fiatCurrency: "NGN" | "USD";
  fiatAtomic: string;
  fiatDecimals: number;
  assetId: WalletAssetId;
  assetAtomic: string;
  feeAtomic: string;
  expiresAt: string;
};

export type OnRampQuoteState = {
  status: "current" | "expired" | "unavailable";
  canContinue: boolean;
  reason: string | null;
};

export function evaluateOnRampQuote(
  quote: OnRampQuote | null,
  now: string,
): OnRampQuoteState {
  if (!quote) {
    return {
      canContinue: false,
      reason:
        "No provider quote exists. A card or bank contribution cannot be priced without one, and this build will not invent a rate or a fee.",
      status: "unavailable",
    };
  }

  const expiresAt = Date.parse(quote.expiresAt);
  const nowMs = Date.parse(now);

  if (Number.isNaN(expiresAt) || Number.isNaN(nowMs)) {
    return {
      canContinue: false,
      reason:
        "The quote's expiry could not be read, so the quote cannot be treated as current.",
      status: "unavailable",
    };
  }

  if (nowMs >= expiresAt) {
    return {
      canContinue: false,
      reason:
        "This quote has expired. Nothing can be charged at the old rate; request a fresh quote before continuing.",
      status: "expired",
    };
  }

  return { canContinue: true, reason: null, status: "current" };
}
