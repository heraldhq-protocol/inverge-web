import { describe, expect, it } from "vitest";

import {
  activatePromotion,
  advancePrize,
  aiAllowance,
  beginSubscription,
  cancelSubscription,
  canTransitionBooking,
  confirmBooking,
  confirmSubscription,
  markInvoicePaid,
  processProviderEvent,
  type PaymentProviderEvent,
  type WorkshopBooking,
} from "@/features/programmes/lib/monetisation";

const usd = (cents: string) => ({ atomic: cents, currency: "USD" as const, decimals: 2 as const });

const verified: PaymentProviderEvent = {
  amount: usd("300000"),
  eventId: "evt_1",
  id: "event_1",
  provider: "provider-a",
  receivedAt: "2026-10-17T10:00:00.000Z",
  verified: true,
};

const unverified: PaymentProviderEvent = { ...verified, verified: false };

describe("subscriptions", () => {
  it("starts incomplete rather than pretending a click activated a plan", () => {
    const subscription = beginSubscription("acct_1", "pro");
    expect(subscription.status).toBe("incomplete");
    expect(subscription.providerConfirmed).toBe(false);
  });

  it("activates only from a verified provider event", () => {
    const active = confirmSubscription(beginSubscription("acct_1", "pro"), verified);
    expect(active.status).toBe("active");
    expect(active.providerConfirmed).toBe(true);
    expect(active.renewsAt).toBeTruthy();
  });

  it("rejects an unverified provider event", () => {
    expect(() =>
      confirmSubscription(beginSubscription("acct_1", "pro"), unverified),
    ).toThrow(/verified provider event/i);
  });

  it("cancels an active subscription", () => {
    const active = confirmSubscription(beginSubscription("acct_1", "pro"), verified);
    expect(cancelSubscription(active).status).toBe("canceled");
  });
});

describe("AI allowance", () => {
  it("does not grant AI to a free plan even with allowance left", () => {
    expect(aiAllowance({ allowance: 5, plan: "free", resetsAt: "2026-11-01", used: 0 }).allowed).toBe(false);
  });

  it("blocks usage at the cap", () => {
    expect(aiAllowance({ allowance: 10, plan: "pro", resetsAt: "2026-11-01", used: 10 }).allowed).toBe(false);
  });

  it("allows usage inside the cap", () => {
    const value = aiAllowance({ allowance: 10, plan: "pro", resetsAt: "2026-11-01", used: 3 });
    expect(value.allowed).toBe(true);
    expect(value.remaining).toBe(7);
  });
});

describe("promotion", () => {
  it("activates only from a verified event and never touches validation", () => {
    const active = activatePromotion(
      {
        affectsValidationMetrics: false,
        charge: usd("2000000"),
        id: "promo_1",
        ideaId: "campus-konekt",
        status: "pending_payment",
        tier: "featured",
      },
      verified,
      new Date("2026-10-17T00:00:00.000Z"),
    );
    expect(active.status).toBe("active");
    expect(active.affectsValidationMetrics).toBe(false);
  });

  it("refuses an unverified activation", () => {
    expect(() =>
      activatePromotion(
        {
          affectsValidationMetrics: false,
          charge: usd("2000000"),
          id: "promo_1",
          ideaId: "campus-konekt",
          status: "pending_payment",
          tier: "featured",
        },
        unverified,
      ),
    ).toThrow(/verified provider event/i);
  });
});

describe("workshop bookings", () => {
  const booking: WorkshopBooking = {
    amount: usd("300000"),
    id: "book_1",
    participant: "Ada",
    provider: null,
    providerConfirmed: false,
    seats: 1,
    sessionId: "workshop-1",
    status: "pending_payment",
  };

  it("confirms a paid booking from a matching verified event", () => {
    expect(confirmBooking(booking, verified).status).toBe("confirmed");
  });

  it("rejects an amount mismatch", () => {
    expect(() =>
      confirmBooking(booking, { ...verified, amount: usd("100") }),
    ).toThrow(/does not match/i);
  });

  it("rejects confirmation without provider verification", () => {
    expect(() => confirmBooking(booking, unverified)).toThrow(/verified provider event/i);
  });

  it("enforces booking transitions", () => {
    expect(canTransitionBooking("pending_payment", "confirmed")).toBe(true);
    expect(canTransitionBooking("cancelled", "confirmed")).toBe(false);
  });
});

describe("sponsor invoices", () => {
  it("does not mark paid without a verified confirmation and reference", () => {
    expect(markInvoicePaid("pending", { method: "offline_transfer", reference: "", verified: true })).toBe("pending");
    expect(markInvoicePaid("pending", { method: "offline_transfer", reference: "TRX-1", verified: false })).toBe("pending");
  });

  it("marks a pending invoice paid with a verified reference", () => {
    expect(markInvoicePaid("pending", { method: "offline_transfer", reference: "TRX-1", verified: true })).toBe("paid");
  });

  it("never reopens a cancelled invoice", () => {
    expect(markInvoicePaid("cancelled", { method: "provider", reference: "TRX-1", verified: true })).toBe("cancelled");
  });
});

describe("prize fulfilment", () => {
  it("blocks an illegal jump", () => {
    expect(advancePrize("committed", "delivered")).toBe("committed");
  });

  it("requires evidence before delivery", () => {
    expect(advancePrize("processing", "delivered")).toBe("processing");
    expect(advancePrize("processing", "delivered", "Bank ref 123")).toBe("delivered");
  });

  it("allows the documented sequential path", () => {
    expect(advancePrize("committed", "funded")).toBe("funded");
    expect(advancePrize("funded", "eligibility_pending")).toBe("eligibility_pending");
  });
});

describe("provider events", () => {
  it("processes an event once", () => {
    const first = processProviderEvent(new Set(), verified);
    expect(first.duplicate).toBe(false);
    const second = processProviderEvent(first.processed, verified);
    expect(second.duplicate).toBe(true);
  });

  it("rejects an unverified event", () => {
    expect(() => processProviderEvent(new Set(), unverified)).toThrow(/Unverified/i);
  });
});
