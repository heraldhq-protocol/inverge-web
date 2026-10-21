import { describe, expect, it } from "vitest";

import {
  compareTokenAmounts,
  formatTokenAmount,
  formatTokenAmountWithSymbol,
  isInsufficient,
  parseTokenAmount,
  shortfall,
  sumTokenAmounts,
  U64_MAX,
  usdCentsToTokenAmount,
  zeroTokenAmount,
} from "@/features/wallet/lib/token-amount";

describe("parseTokenAmount", () => {
  it("converts a decimal string into exact atomic units", () => {
    expect(parseTokenAmount("12.5", 6)).toBe("12500000");
    expect(parseTokenAmount("0.000001", 6)).toBe("1");
    expect(parseTokenAmount("150", 6)).toBe("150000000");
  });

  it("trims surrounding whitespace but rejects other formatting", () => {
    expect(parseTokenAmount(" 1.5 ", 6)).toBe("1500000");
    expect(parseTokenAmount("1,5", 6)).toBeNull();
    expect(parseTokenAmount("1e3", 6)).toBeNull();
    expect(parseTokenAmount("-1", 6)).toBeNull();
    expect(parseTokenAmount("+1", 6)).toBeNull();
  });

  it("rejects zero, empty, and more precision than the asset holds", () => {
    expect(parseTokenAmount("0", 6)).toBeNull();
    expect(parseTokenAmount("0.00", 6)).toBeNull();
    expect(parseTokenAmount("", 6)).toBeNull();
    expect(parseTokenAmount("1.0000001", 6)).toBeNull();
  });

  it("rejects an amount above the u64 ceiling", () => {
    expect(parseTokenAmount(U64_MAX.toString(), 0)).toBe(U64_MAX.toString());
    expect(parseTokenAmount((U64_MAX + 1n).toString(), 0)).toBeNull();
  });

  it("rejects invalid decimal scales", () => {
    expect(() => parseTokenAmount("1", -1)).toThrow(RangeError);
    expect(() => parseTokenAmount("1", 1.5)).toThrow(RangeError);
    expect(() => parseTokenAmount("1", 19)).toThrow(RangeError);
  });
});

describe("formatTokenAmount", () => {
  const amount = {
    assetId: "USDC" as const,
    atomic: "1250500000",
    decimals: 6,
  };

  it("groups the whole part and trims trailing zeros by default", () => {
    expect(formatTokenAmount(amount)).toBe("1,250.5");
  });

  it("supports a maximum and minimum fraction length without rounding up", () => {
    expect(formatTokenAmount(amount, { maxFractionDigits: 2 })).toBe("1,250.5");
    expect(
      formatTokenAmount(amount, {
        maxFractionDigits: 2,
        minimumFractionDigits: 2,
      }),
    ).toBe("1,250.50");
    expect(formatTokenAmount(amount, { maxFractionDigits: 0 })).toBe("1,250");
  });

  it("keeps trailing zeros when explicitly asked", () => {
    expect(
      formatTokenAmount(amount, {
        maxFractionDigits: 2,
        trimTrailingZeros: false,
      }),
    ).toBe("1,250.50");
  });

  it("appends the asset symbol without a second conversion", () => {
    expect(formatTokenAmountWithSymbol(amount, { maxFractionDigits: 2 })).toBe(
      "1,250.5 USDC",
    );
  });
});

describe("token amount arithmetic", () => {
  const usdc = (atomic: string) => ({
    assetId: "USDC" as const,
    atomic,
    decimals: 6,
  });

  it("adds amounts in the same asset and scale", () => {
    expect(sumTokenAmounts([usdc("1000000"), usdc("2500000")])).toEqual(
      usdc("3500000"),
    );
  });

  it("refuses to add different assets or scales", () => {
    expect(() =>
      sumTokenAmounts([
        usdc("1"),
        { assetId: "SOL", atomic: "1", decimals: 9 },
      ]),
    ).toThrow(RangeError);
    expect(() =>
      sumTokenAmounts([usdc("1"), { ...usdc("1"), decimals: 9 }]),
    ).toThrow(RangeError);
  });

  it("refuses to compare different assets or scales", () => {
    expect(() =>
      compareTokenAmounts(usdc("1"), {
        assetId: "SOL",
        atomic: "1",
        decimals: 9,
      }),
    ).toThrow(RangeError);
  });

  it("compares exactly, including large values", () => {
    expect(compareTokenAmounts(usdc("1"), usdc("2"))).toBe(-1);
    expect(compareTokenAmounts(usdc("2"), usdc("2"))).toBe(0);
    expect(
      compareTokenAmounts(usdc("9007199254740993"), usdc("9007199254740992")),
    ).toBe(1);
  });

  it("reports an insufficient balance and its exact shortfall", () => {
    const balance = usdc("1250500000");
    const required = usdc("2000000000");

    expect(isInsufficient(balance, required)).toBe(true);
    expect(shortfall(balance, required)).toEqual(usdc("749500000"));
    expect(shortfall(required, balance)).toBeNull();
  });

  it("builds a zero amount in the requested asset", () => {
    expect(zeroTokenAmount("SOL", 9)).toEqual({
      assetId: "SOL",
      atomic: "0",
      decimals: 9,
    });
  });
});

describe("usdCentsToTokenAmount", () => {
  it("converts two-decimal USD cents to six-decimal USDC exactly", () => {
    expect(usdCentsToTokenAmount("15000")).toEqual({
      assetId: "USDC",
      atomic: "150000000",
      decimals: 6,
    });
    expect(usdCentsToTokenAmount("1")).toEqual({
      assetId: "USDC",
      atomic: "10000",
      decimals: 6,
    });
  });

  it("rejects a value that is not an integer number of cents", () => {
    expect(() => usdCentsToTokenAmount("1.5")).toThrow(RangeError);
    expect(() => usdCentsToTokenAmount("-1")).toThrow(RangeError);
  });

  it("refuses an asset without verified decimals", () => {
    expect(() => usdCentsToTokenAmount("100", "cNGN")).toThrow(RangeError);
  });
});
