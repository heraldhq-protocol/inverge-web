import { describe, expect, it } from "vitest";

import {
  emptySignals,
  markFeedbackSubmitted,
  setPrePledge,
  toggleSupport,
  withdrawPrePledge,
  type IdeaSignals,
} from "@/features/ideas/lib/signals";
import type { MoneyAmount } from "@/lib/money";

const usd = (atomic: string): MoneyAmount => ({
  atomic,
  currency: "USD",
  decimals: 2,
});

describe("idea signal transitions", () => {
  describe("toggleSupport", () => {
    it("flips a false signal to true and back again", () => {
      // #given
      const start: IdeaSignals = emptySignals;

      // #when
      const supported = toggleSupport(start);
      const withdrawn = toggleSupport(supported);

      // #then
      expect(supported.supported).toBe(true);
      expect(withdrawn.supported).toBe(false);
    });

    it("keeps an existing pre-pledge untouched", () => {
      // #given
      const start: IdeaSignals = {
        ...emptySignals,
        prePledge: { amount: usd("5000") },
      };

      // #when
      const next = toggleSupport(start);

      // #then
      expect(next.prePledge).toEqual(start.prePledge);
    });
  });

  describe("setPrePledge", () => {
    it("replaces an existing pre-pledge rather than appending", () => {
      // #given
      const start: IdeaSignals = {
        ...emptySignals,
        prePledge: { amount: usd("5000") },
      };

      // #when
      const result = setPrePledge(start, { amount: usd("9000") });

      // #then — a single intent remains, at the new amount.
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.signals.prePledge?.amount.atomic).toBe("9000");
    });

    it("rejects a non-positive amount", () => {
      // #when
      const result = setPrePledge(emptySignals, { amount: usd("0") });

      // #then
      expect(result).toEqual({ ok: false, reason: "pre-pledge-not-positive" });
    });
  });

  describe("withdrawPrePledge", () => {
    it("clears a recorded intent", () => {
      // #given
      const start: IdeaSignals = {
        ...emptySignals,
        prePledge: { amount: usd("5000") },
      };

      // #when
      const next = withdrawPrePledge(start);

      // #then
      expect(next.prePledge).toBeNull();
    });
  });

  describe("markFeedbackSubmitted", () => {
    it("records one submission", () => {
      // #given
      const start = emptySignals;

      // #when
      const next = markFeedbackSubmitted(start);

      // #then
      expect(next.feedbackSubmitted).toBe(true);
    });
  });
});
