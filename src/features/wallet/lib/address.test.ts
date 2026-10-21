import { describe, expect, it } from "vitest";

import {
  decodeBase58,
  isEvmAddress,
  isSolanaAddress,
  shortenAddress,
  validateDestination,
} from "@/features/wallet/lib/address";

const SYSTEM_PROGRAM = "11111111111111111111111111111111";
const WRAPPED_SOL = "So11111111111111111111111111111111111111112";
const EXTERNAL = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";

describe("base58 decoding", () => {
  it("decodes leading zero bytes and ordinary addresses to 32 bytes", () => {
    expect(decodeBase58(SYSTEM_PROGRAM)).toHaveLength(32);
    expect(decodeBase58(WRAPPED_SOL)).toHaveLength(32);
    expect(decodeBase58("1")).toEqual(new Uint8Array([0]));
  });

  it("returns null for a character outside the alphabet", () => {
    expect(decodeBase58("0OIl")).toBeNull();
    expect(decodeBase58("")).toBeNull();
  });
});

describe("isSolanaAddress", () => {
  it("accepts addresses that decode to exactly 32 bytes", () => {
    expect(isSolanaAddress(SYSTEM_PROGRAM)).toBe(true);
    expect(isSolanaAddress(WRAPPED_SOL)).toBe(true);
    expect(isSolanaAddress(EXTERNAL)).toBe(true);
    expect(isSolanaAddress(`  ${EXTERNAL}  `)).toBe(true);
  });

  it("rejects values that only look like an address", () => {
    expect(isSolanaAddress("")).toBe(false);
    expect(isSolanaAddress("1111")).toBe(false);
    expect(isSolanaAddress("0OIl0OIl0OIl0OIl0OIl0OIl0OIl0OIl")).toBe(false);
    expect(isSolanaAddress("1".repeat(33))).toBe(false);
    expect(isSolanaAddress("0x1234567890abcdef")).toBe(false);
  });
});

describe("isEvmAddress", () => {
  it("recognises a 20-byte hex address, case-insensitively", () => {
    expect(isEvmAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe(
      true,
    );
    expect(isEvmAddress("0X1234567890ABCDEF1234567890ABCDEF12345678")).toBe(
      true,
    );
  });

  it("does not mistake a Solana address for an EVM one", () => {
    expect(isEvmAddress(EXTERNAL)).toBe(false);
    expect(isEvmAddress("0x1234")).toBe(false);
  });
});

describe("validateDestination", () => {
  it("asks for a destination when the field is empty", () => {
    expect(validateDestination("   ", null)?.code).toBe("empty");
  });

  it("names an EVM address as the wrong network instead of a bad address", () => {
    const issue = validateDestination(
      "0x1234567890abcdef1234567890abcdef12345678",
      null,
    );

    expect(issue?.code).toBe("evm-network");
    expect(issue?.message).toMatch(/EVM address/);
    expect(issue?.message).toMatch(/Solana/);
  });

  it("rejects characters outside base58 with the reason", () => {
    const issue = validateDestination("0OIl0OIl0OIl0OIl0OIl0OIl0OIl0OIl", null);

    expect(issue?.code).toBe("invalid-characters");
    expect(issue?.message).toMatch(/base58/);
  });

  it("rejects a base58 string that does not decode to 32 bytes", () => {
    expect(validateDestination("1".repeat(33), null)?.code).toBe(
      "wrong-length",
    );
    expect(validateDestination("1".repeat(20), null)?.code).toBe(
      "wrong-length",
    );
  });

  it("rejects sending to the wallet's own address", () => {
    const issue = validateDestination(EXTERNAL, EXTERNAL);

    expect(issue?.code).toBe("self");
    expect(issue?.message).toMatch(/sending to yourself/i);
  });

  it("accepts a valid external address, including when no own address exists", () => {
    expect(validateDestination(EXTERNAL, null)).toBeNull();
    expect(validateDestination(EXTERNAL, WRAPPED_SOL)).toBeNull();
  });
});

describe("shortenAddress", () => {
  it("keeps short values intact and elides long ones", () => {
    expect(shortenAddress("abc")).toBe("abc");
    expect(shortenAddress(EXTERNAL)).toBe("7xKX…gAsU");
    expect(shortenAddress(EXTERNAL, 2)).toBe("7x…sU");
  });
});
