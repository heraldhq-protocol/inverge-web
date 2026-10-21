import { describe, expect, it } from "vitest";

import {
  evaluateOnRampQuote,
  type OnRampQuote,
} from "@/features/wallet/lib/quote";

const quote: OnRampQuote = {
  assetAtomic: "50000000",
  assetId: "USDC",
  expiresAt: "2026-10-19T12:01:00.000Z",
  feeAtomic: "250000",
  fiatAtomic: "8000000",
  fiatCurrency: "NGN",
  fiatDecimals: 2,
  id: "quote-preview-01",
  provider: "preview-on-ramp",
};

describe("evaluateOnRampQuote", () => {
  it("treats a missing quote as unavailable, not as a free conversion", () => {
    const state = evaluateOnRampQuote(null, "2026-10-19T12:00:00.000Z");

    expect(state).toMatchObject({ canContinue: false, status: "unavailable" });
    expect(state.reason).toMatch(/will not invent a rate or a fee/i);
  });

  it("accepts a quote strictly before its expiry", () => {
    const state = evaluateOnRampQuote(quote, "2026-10-19T12:00:00.000Z");

    expect(state).toEqual({
      canContinue: true,
      reason: null,
      status: "current",
    });
  });

  it("expires a quote at its boundary, not one second later", () => {
    const state = evaluateOnRampQuote(quote, quote.expiresAt);

    expect(state).toMatchObject({ canContinue: false, status: "expired" });
    expect(state.reason).toMatch(/request a fresh quote/i);
  });

  it("does not treat a quote with an unreadable expiry as current", () => {
    const state = evaluateOnRampQuote(
      { ...quote, expiresAt: "not-a-date" },
      "2026-10-19T12:00:00.000Z",
    );

    expect(state).toMatchObject({ canContinue: false, status: "unavailable" });
    expect(state.reason).toMatch(/expiry could not be read/i);
  });

  it("does not treat an unreadable clock as current", () => {
    expect(evaluateOnRampQuote(quote, "not-a-date").status).toBe("unavailable");
  });
});
