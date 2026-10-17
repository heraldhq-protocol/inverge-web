import type { MoneyAmount } from "@/lib/money";

/**
 * One account's validation signals on a single idea.
 *
 * Pure state transitions for the three distinct actions (FR-202). They encode
 * the invariants that must survive whatever UI sits on top:
 *
 * - support is a single active signal per account, reversible;
 * - a pre-pledge is upserted — saving again **replaces**, never appends — and
 *   withdrawing clears it (FR-210/211);
 * - feedback is one submission per account per idea.
 *
 * The pre-pledge amount is a `MoneyAmount` (USD atomic units). NGN input and
 * its USD normalisation (FR-210) live in the API; the web has no client fx
 * source, so it never invents a conversion. Keeping these transitions
 * framework-free means the components, the tests, and the future API boundary
 * all read one definition of "what a signal can be".
 */

export type IdeaSignals = {
  supported: boolean;
  prePledge: { amount: MoneyAmount } | null;
  feedbackSubmitted: boolean;
};

export const emptySignals: IdeaSignals = {
  supported: false,
  prePledge: null,
  feedbackSubmitted: false,
};

export type SignalTransition =
  | { ok: true; signals: IdeaSignals }
  | { ok: false; reason: "pre-pledge-not-positive" };

/** FR-202: toggle support. One active signal per account, reversible. */
export function toggleSupport(signals: IdeaSignals): IdeaSignals {
  return { ...signals, supported: !signals.supported };
}

/** FR-202/210: save a pre-pledge. Replaces the previous one, never appends. */
export function setPrePledge(
  signals: IdeaSignals,
  input: { amount: MoneyAmount },
): SignalTransition {
  if (BigInt(input.amount.atomic) <= 0n) {
    return { ok: false, reason: "pre-pledge-not-positive" };
  }
  return { ok: true, signals: { ...signals, prePledge: input } };
}

/** FR-211: withdraw a pre-pledge. A withdrawable signal is a more honest one. */
export function withdrawPrePledge(signals: IdeaSignals): IdeaSignals {
  return { ...signals, prePledge: null };
}

/** FR-202: record a feedback submission. One per account; re-submission replaces. */
export function markFeedbackSubmitted(signals: IdeaSignals): IdeaSignals {
  return { ...signals, feedbackSubmitted: true };
}
