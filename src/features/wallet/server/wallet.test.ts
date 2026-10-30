import { describe, expect, it } from "vitest";

import { selectLinkedWallet } from "@/features/wallet/server/wallet";

const EMBEDDED_ADDRESS = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
const EXTERNAL_ADDRESS = "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgp3a8";

describe("selectLinkedWallet", () => {
  it("selects the embedded provider wallet returned by the API", () => {
    const selected = selectLinkedWallet([
      {
        address: EMBEDDED_ADDRESS,
        createdAt: "2026-10-30T12:00:00.000Z",
        isEmbedded: true,
        provider: "web3auth",
      },
    ]);

    expect(selected).toEqual({
      address: EMBEDDED_ADDRESS,
      provisionedAt: "2026-10-30T12:00:00.000Z",
    });
  });

  it("ignores external payout wallets", () => {
    const selected = selectLinkedWallet([
      {
        address: EXTERNAL_ADDRESS,
        isEmbedded: false,
        provider: "external",
      },
    ]);

    expect(selected).toBeNull();
  });

  it("skips an invalid address instead of showing it", () => {
    const selected = selectLinkedWallet([
      {
        address: "not-a-solana-address",
        isEmbedded: true,
        provider: "web3auth",
      },
    ]);

    expect(selected).toBeNull();
  });

  it("keeps a null provisioning time when the API omits it", () => {
    const selected = selectLinkedWallet([
      {
        address: EMBEDDED_ADDRESS,
        isEmbedded: true,
        provider: "web3auth",
      },
    ]);

    expect(selected).toEqual({
      address: EMBEDDED_ADDRESS,
      provisionedAt: null,
    });
  });

  it("returns null for a payload that is not a wallet list", () => {
    expect(selectLinkedWallet(null)).toBeNull();
    expect(selectLinkedWallet({ address: EMBEDDED_ADDRESS })).toBeNull();
  });
});
