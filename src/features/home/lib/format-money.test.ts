import { describe, expect, it } from "vitest";

import {
  formatCompactMoney,
  formatMoney,
  sumMoneyAmounts,
} from "@/features/home/lib/format-money";
import type { MoneyAmount } from "@/features/home/types";

const usd = (atomic: string): MoneyAmount => ({
  atomic,
  currency: "USD",
  decimals: 2,
});

describe("formatMoney", () => {
  it("renders a whole-unit USD amount with the currency symbol", () => {
    expect(formatMoney(usd("5000000"))).toBe("$50,000");
  });

  it("drops sub-unit cents and formats whole dollars", () => {
    expect(formatMoney(usd("482099"))).toBe("$4,820");
  });
});

describe("formatCompactMoney", () => {
  it("keeps values under a million in full", () => {
    expect(formatCompactMoney(usd("5000000"))).toBe("$50,000");
  });

  it("compacts millions to a single decimal place", () => {
    expect(formatCompactMoney(usd("840000000"))).toBe("$8.4M");
  });

  it("omits the decimal when the value is a whole million", () => {
    expect(formatCompactMoney(usd("200000000"))).toBe("$2M");
  });
});

describe("sumMoneyAmounts", () => {
  it("sums atomic units exactly and returns USD", () => {
    expect(
      sumMoneyAmounts([usd("5000000"), usd("3000000"), usd("2000000")]),
    ).toEqual({
      atomic: "10000000",
      currency: "USD",
      decimals: 2,
    });
  });

  it("returns a zero USD amount for an empty list", () => {
    expect(sumMoneyAmounts([])).toEqual({
      atomic: "0",
      currency: "USD",
      decimals: 2,
    });
  });
});
