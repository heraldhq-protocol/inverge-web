import { describe, expect, it } from "vitest";

import {
  atomicToWholeInput,
  decimalToUsdAmount,
  formatCompactMoney,
  formatMoney,
  parseUsdAmount,
  sumMoneyAmounts,
  type MoneyAmount,
} from "@/lib/money";

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

describe("parseUsdAmount", () => {
  it("parses whole dollars to integer cents", () => {
    expect(parseUsdAmount("500")).toBe("50000");
  });

  it("parses a two-decimal amount", () => {
    expect(parseUsdAmount("500.25")).toBe("50025");
  });

  it("tolerates a currency symbol and whitespace", () => {
    expect(parseUsdAmount("$500")).toBe("50000");
    expect(parseUsdAmount(" 500 ")).toBe("50000");
  });

  it("rejects a non-positive amount", () => {
    expect(parseUsdAmount("0")).toBeNull();
    expect(parseUsdAmount("-5")).toBeNull();
  });

  it("rejects input that is not a money amount", () => {
    expect(parseUsdAmount("abc")).toBeNull();
    expect(parseUsdAmount("1.234")).toBeNull();
    expect(parseUsdAmount("")).toBeNull();
  });
});

describe("atomicToWholeInput", () => {
  it("returns the whole-unit string for an edit field", () => {
    expect(
      atomicToWholeInput({ atomic: "25000", currency: "USD", decimals: 2 }),
    ).toBe("250");
  });
});

describe("decimalToUsdAmount", () => {
  it("keeps a whole API amount exact", () => {
    expect(decimalToUsdAmount("5000")).toEqual(usd("500000"));
  });

  it("pads a one-decimal API amount", () => {
    expect(decimalToUsdAmount("5000.5")).toEqual(usd("500050"));
  });

  it("represents a zero amount without inventing one", () => {
    expect(decimalToUsdAmount("0.00")).toEqual(usd("0"));
    expect(decimalToUsdAmount(null)).toEqual(usd("0"));
  });

  it("rejects a malformed amount instead of rounding it", () => {
    expect(() => decimalToUsdAmount("12,000")).toThrow(RangeError);
  });
});
