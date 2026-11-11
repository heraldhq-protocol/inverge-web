import { describe, expect, it } from "vitest";

import {
  boostPriceDraft,
  boostPriceFormSchema,
  boostPriceInput,
  boostPricesResponseSchema,
  boostPricesWireUpdate,
  boostPriceUpdateSchema,
  changedBoostPrices,
  matchesBoostPriceUpdate,
  parseBoostPrice,
} from "./boost-prices";

const current = boostPricesResponseSchema.parse({
  basic: { priceUSD: 5, durationDays: 7 },
  featured: { priceUSD: 20, durationDays: 30 },
});

describe("exact boost pricing (FR-206, FR-904)", () => {
  it.each([
    ["0.01", "1"],
    ["0.29", "29"],
    ["5.37", "537"],
    ["35184372088831.99", "3518437208883199"],
  ])(
    "preserves %s through cents, input and the numeric API DTO",
    (input, atomic) => {
      const price = parseBoostPrice(input);
      expect(price).toEqual({ atomic, currency: "USD", decimals: 2 });
      if (!price) throw new Error("Expected a valid price");
      expect(boostPriceInput(price)).toBe(input);
      const wire = boostPricesWireUpdate(
        boostPriceUpdateSchema.parse({ basic: { price } }),
      );
      expect(parseBoostPrice(String(wire.basicPriceUSD))).toEqual(price);
    },
  );
  it.each([
    "",
    "0",
    "-1",
    "1.001",
    "1e2",
    "1,000.00",
    "$5",
    "5 dollars",
    "35184372088832",
    "9".repeat(500),
  ])("rejects malformed, excessive or overprecise input %s", (value) =>
    expect(parseBoostPrice(value)).toBeNull(),
  );
  it.each([
    {},
    { basic: null },
    { basic: { priceUSD: "5", durationDays: 7 } },
    { basic: { priceUSD: 0.30000000000000004, durationDays: 7 } },
    { basic: { priceUSD: 5, durationDays: 0 } },
    { basic: { priceUSD: 5, durationDays: 366 } },
    { basic: { priceUSD: 5, durationDays: 1.5 } },
  ])(
    "rejects invalid service prices instead of rounding or supplying defaults",
    (changes) => {
      expect(
        boostPricesResponseSchema.safeParse({
          ...(Object.keys(changes).length
            ? {
                basic: { priceUSD: 5, durationDays: 7 },
                featured: { priceUSD: 20, durationDays: 30 },
              }
            : {}),
          ...changes,
        }).success,
      ).toBe(false);
    },
  );
  it.each([
    {},
    { basic: {} },
    { params: { feeBps: 1000 } },
    { basic: { price: { atomic: "29", currency: "NGN", decimals: 2 } } },
    { basic: { price: { atomic: "0.29", currency: "USD", decimals: 2 } } },
    { basic: { price: { atomic: "29", currency: "USD", decimals: 6 } } },
    { basic: { durationDays: 1.5 } },
  ])(
    "refuses unrelated parameters or invalid monetary units at the BFF boundary",
    (input) => {
      expect(boostPriceUpdateSchema.safeParse(input).success).toBe(false);
    },
  );
  it("omits untouched fields and accepts the duration boundaries", () => {
    const parsed = boostPriceFormSchema.parse({
      ...boostPriceDraft(current),
      basicPrice: "5.37",
      featuredDuration: "365",
    });
    const update = changedBoostPrices(parsed, current);
    expect(update).toEqual({
      basic: { price: { atomic: "537", currency: "USD", decimals: 2 } },
      featured: { durationDays: 365 },
    });
    if (!update) throw new Error("Expected changes");
    expect(boostPricesWireUpdate(update)).toEqual({
      basicPriceUSD: 5.37,
      featuredDurationDays: 365,
    });
    expect(
      boostPriceUpdateSchema.safeParse({ basic: { durationDays: 1 } }).success,
    ).toBe(true);
    expect(
      changedBoostPrices(
        boostPriceFormSchema.parse(boostPriceDraft(current)),
        current,
      ),
    ).toBeNull();
  });
  it("requires all requested fields to be confirmed while accepting concurrent changes to untouched fields", () => {
    const update = { basic: { durationDays: 10 } };
    expect(matchesBoostPriceUpdate(current, update)).toBe(false);
    expect(
      matchesBoostPriceUpdate(
        {
          ...current,
          basic: { ...current.basic, durationDays: 10 },
          featured: { ...current.featured, durationDays: 90 },
        },
        update,
      ),
    ).toBe(true);
  });
});
