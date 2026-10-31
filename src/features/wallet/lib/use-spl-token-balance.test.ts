import { describe, expect, it } from "vitest";

import { sumTokenAccountAmounts } from "@/features/wallet/lib/use-spl-token-balance";

function tokenAccount(amount: string, decimals = 6): unknown {
  return {
    account: {
      data: {
        parsed: {
          info: {
            tokenAmount: { amount, decimals },
          },
        },
      },
    },
  };
}

describe("sumTokenAccountAmounts", () => {
  it("sums every token account for the mint in atomic units", () => {
    const parsed = sumTokenAccountAmounts(
      { value: [tokenAccount("1000000"), tokenAccount("2500000")] },
      6,
    );

    expect(parsed).toEqual({ atomic: 3500000n, decimals: 6 });
  });

  it("treats an empty account list as a real zero balance", () => {
    expect(sumTokenAccountAmounts({ value: [] }, 6)).toEqual({
      atomic: 0n,
      decimals: 6,
    });
  });

  it("returns null when the response shape cannot be trusted", () => {
    expect(sumTokenAccountAmounts({}, 6)).toBeNull();
    expect(sumTokenAccountAmounts({ value: [{}] }, 6)).toBeNull();
    expect(
      sumTokenAccountAmounts(
        {
          value: [
            {
              account: {
                data: {
                  parsed: {
                    info: {
                      tokenAmount: { amount: "-1", decimals: 6 },
                    },
                  },
                },
              },
            },
          ],
        },
        6,
      ),
    ).toBeNull();
  });

  it("returns null when token accounts disagree on decimals", () => {
    expect(
      sumTokenAccountAmounts(
        { value: [tokenAccount("1", 6), tokenAccount("1", 9)] },
        6,
      ),
    ).toBeNull();
  });
});
