import { describe, expect, it } from "vitest";

import { getUsdcMint } from "@/features/wallet/lib/networks";

describe("USDC mint registry", () => {
  it("uses Circle's Solana devnet mint on devnet", () => {
    expect(getUsdcMint("solana-devnet")).toBe(
      "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    );
  });

  it("uses Circle's canonical Solana mainnet mint on mainnet", () => {
    expect(getUsdcMint("solana-mainnet-beta")).toBe(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    );
  });
});
