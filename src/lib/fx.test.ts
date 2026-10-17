import { describe, expect, it } from "vitest";

import { estimateNgn, ILLUSTRATIVE_NGN_PER_USD } from "@/lib/fx";
import type { MoneyAmount } from "@/lib/money";

const usd = (dollars: number): MoneyAmount => ({
  atomic: String(dollars * 100),
  currency: "USD",
  decimals: 2,
});

describe("estimateNgn", () => {
  it("converts USD to naira at the illustrative rate", () => {
    const result = estimateNgn(usd(5000), 1600);

    expect(result.atomic).toBe("8000000");
    expect(result.rate).toBe(1600);
    expect(result.estimated).toBe(true);
  });

  it("rounds to the nearest thousand naira", () => {
    // $10 at 1555 = ₦15,550 -> ₦16,000
    expect(estimateNgn(usd(10), 1555).atomic).toBe("16000");
    // $10 at 1540 = ₦15,400 -> ₦15,000
    expect(estimateNgn(usd(10), 1540).atomic).toBe("15000");
  });

  it("formats with the naira symbol and no decimals", () => {
    const formatted = estimateNgn(usd(10000), 1600).formatted;

    expect(formatted).toContain("16,000,000");
    expect(formatted).toContain("₦");
  });

  it("falls back to the default rate for an invalid rate", () => {
    expect(estimateNgn(usd(1), Number.NaN).rate).toBe(ILLUSTRATIVE_NGN_PER_USD);
    expect(estimateNgn(usd(1), 0).rate).toBe(ILLUSTRATIVE_NGN_PER_USD);
  });

  it("handles zero without inventing a value", () => {
    expect(estimateNgn(usd(0), 1600).atomic).toBe("0");
  });

  it("handles a large pool exactly enough for display", () => {
    // $50,000 at 1600 = ₦80,000,000
    expect(estimateNgn(usd(50_000), 1600).atomic).toBe("80000000");
  });
});
