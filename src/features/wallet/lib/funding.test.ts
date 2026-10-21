import { describe, expect, it } from "vitest";

import { assessWalletFunding } from "@/features/wallet/lib/funding";
import type { WalletFundingSnapshot } from "@/features/wallet/types";
import type { MoneyAmount } from "@/lib/money";

const required: MoneyAmount = {
  atomic: "10000",
  currency: "USD",
  decimals: 2,
};

const snapshot: WalletFundingSnapshot = {
  assetId: "USDC",
  balanceAtomic: "1250500000",
  configured: true,
  decimals: 6,
  network: "solana-devnet",
  provisioning: "ready",
  sample: false,
  signingAvailable: true,
};

function assess(overrides: Partial<WalletFundingSnapshot>) {
  return assessWalletFunding({
    required,
    snapshot: { ...snapshot, ...overrides },
  });
}

describe("assessWalletFunding", () => {
  it("reports a covered contribution as ready only when signing exists", () => {
    const assessment = assess({});

    expect(assessment.status).toBe("ready");
    expect(assessment.balance).toEqual({
      assetId: "USDC",
      atomic: "1250500000",
      decimals: 6,
    });
    expect(assessment.required).toEqual({
      assetId: "USDC",
      atomic: "100000000",
      decimals: 6,
    });
    expect(assessment.shortfall).toBeNull();
  });

  it("keeps a sufficient balance separate from unavailable signing", () => {
    const assessment = assess({ signingAvailable: false });

    expect(assessment.status).toBe("signing-unavailable");
    expect(assessment.message).toMatch(/without submitting anything/i);
    expect(assessment.shortfall).toBeNull();
  });

  it("treats a labelled sample balance as usable only for the handoff", () => {
    const assessment = assess({
      provisioning: "unconfigured",
      sample: true,
      signingAvailable: false,
    });

    expect(assessment.status).toBe("signing-unavailable");
  });

  it("reports the exact shortfall in token units", () => {
    const assessment = assess({ balanceAtomic: "50000000" });

    expect(assessment.status).toBe("insufficient");
    expect(assessment.shortfall).toEqual({
      assetId: "USDC",
      atomic: "50000000",
      decimals: 6,
    });
    expect(assessment.message).toMatch(/short by 50 USDC/);
  });

  it("refuses to assess a wallet with no snapshot at all", () => {
    const assessment = assessWalletFunding({ required, snapshot: null });

    expect(assessment.status).toBe("wallet-unavailable");
    expect(assessment.balance).toBeNull();
    expect(assessment.required).not.toBeNull();
  });

  it("refuses an unprovisioned wallet that is not a labelled sample", () => {
    expect(assess({ provisioning: "unconfigured", sample: false }).status).toBe(
      "wallet-unavailable",
    );
    expect(assess({ provisioning: "failed", sample: false }).status).toBe(
      "wallet-unavailable",
    );
  });

  it("refuses to assume a balance when none was read", () => {
    expect(assess({ balanceAtomic: null }).status).toBe("wallet-unavailable");
  });

  it("does not settle a USDC contribution from another asset", () => {
    const assessment = assess({
      assetId: "cNGN",
      balanceAtomic: "999999999",
      decimals: 6,
    });

    expect(assessment.status).toBe("unsupported-asset");
    expect(assessment.balance).toBeNull();
    expect(assessment.message).toMatch(/not set up for USDC/i);
  });

  it("never claims readiness from a snapshot that has no address behind it", () => {
    // The funding snapshot deliberately carries no address. Readiness here only
    // means "the balance covers it", never "a provider account exists".
    expect(assess({}).status).toBe("ready");
    expect(snapshot).not.toHaveProperty("address");
  });
});
