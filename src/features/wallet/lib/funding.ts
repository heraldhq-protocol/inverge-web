import {
  formatTokenAmountWithSymbol,
  isInsufficient,
  shortfall,
  usdCentsToTokenAmount,
  type TokenAmount,
} from "@/features/wallet/lib/token-amount";
import type { WalletFundingSnapshot } from "@/features/wallet/types";
import type { MoneyAmount } from "@/lib/money";

/**
 * Can this contribution be paid from the wallet balance?
 *
 * Four answers are kept apart: the wallet is not provisioned, the balance is
 * short, the balance is sufficient but signing is not connected, or the
 * contribution is ready to sign. Collapsing the last three into "ready" is how
 * preview screens end up implying a payment can complete.
 */

export type FundingAssessmentStatus =
  | "ready"
  | "signing-unavailable"
  | "insufficient"
  | "wallet-unavailable"
  | "unsupported-asset";

export type FundingAssessment = {
  status: FundingAssessmentStatus;
  /** A sentence for the checkout. Never a fabricated quote. */
  message: string;
  balance: TokenAmount | null;
  required: TokenAmount | null;
  shortfall: TokenAmount | null;
};

export function assessWalletFunding({
  required,
  snapshot,
}: {
  required: MoneyAmount;
  snapshot: WalletFundingSnapshot | null;
}): FundingAssessment {
  const requiredToken = usdCentsToTokenAmount(required.atomic);

  if (!snapshot) {
    return {
      balance: null,
      message:
        "No wallet state is available, so this contribution cannot be paid from a wallet balance.",
      required: requiredToken,
      shortfall: null,
      status: "wallet-unavailable",
    };
  }

  if (snapshot.assetId !== "USDC") {
    return {
      balance: null,
      message:
        "This wallet is not set up for USDC, so it cannot pay a contribution settled in USDC.",
      required: requiredToken,
      shortfall: null,
      status: "unsupported-asset",
    };
  }

  if (snapshot.provisioning !== "ready" && !snapshot.sample) {
    return {
      balance: null,
      message:
        "The wallet is not provisioned yet. A contribution cannot be paid from a wallet that has no signing account.",
      required: requiredToken,
      shortfall: null,
      status: "wallet-unavailable",
    };
  }

  if (snapshot.balanceAtomic === null) {
    return {
      balance: null,
      message:
        "No balance has been read for this wallet, so it cannot be used to pay this contribution.",
      required: requiredToken,
      shortfall: null,
      status: "wallet-unavailable",
    };
  }

  const balance: TokenAmount = {
    assetId: snapshot.assetId,
    atomic: snapshot.balanceAtomic,
    decimals: snapshot.decimals,
  };

  if (isInsufficient(balance, requiredToken)) {
    const gap = shortfall(balance, requiredToken);

    return {
      balance,
      message:
        gap === null
          ? "The wallet balance is below the contribution amount."
          : `The wallet balance is short by ${formatTokenAmountWithSymbol(gap)}. Add USDC before contributing from this wallet.`,
      required: requiredToken,
      shortfall: gap,
      status: "insufficient",
    };
  }

  if (!snapshot.signingAvailable) {
    return {
      balance,
      message:
        "The sample balance covers this contribution, but wallet signing is not connected in this build. Continuing shows the handoff state without submitting anything.",
      required: requiredToken,
      shortfall: null,
      status: "signing-unavailable",
    };
  }

  return {
    balance,
    message: "The wallet balance covers this contribution.",
    required: requiredToken,
    shortfall: null,
    status: "ready",
  };
}
