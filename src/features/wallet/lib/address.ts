/**
 * Solana address handling.
 *
 * A Solana address is 32 raw bytes encoded in base58. Length and character
 * checks alone are not enough: "11111111111111111111111111111111" and
 * "So11111111111111111111111111111111111111112" have the same shape but different
 * byte lengths. The decoder below is the check.
 *
 * This module validates destinations. It never derives, stores, or logs a
 * private key, seed phrase, or signing share.
 */

const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE58_INDEX = new Map(
  [...BASE58_ALPHABET].map((character, index) => [character, index]),
);

/** Decode base58 to bytes, or `null` when a character is outside the alphabet. */
export function decodeBase58(value: string): Uint8Array | null {
  if (value.length === 0) return null;

  let numeric = 0n;
  let leadingZeros = 0;
  let countedLeadingZeros = false;

  for (const character of value) {
    const index = BASE58_INDEX.get(character);
    if (index === undefined) return null;

    if (index === 0 && !countedLeadingZeros) {
      leadingZeros += 1;
    } else {
      countedLeadingZeros = true;
    }

    numeric = numeric * 58n + BigInt(index);
  }

  const bytes: number[] = [];
  while (numeric > 0n) {
    bytes.push(Number(numeric % 256n));
    numeric /= 256n;
  }
  bytes.reverse();

  const decoded = new Uint8Array(leadingZeros + bytes.length);
  decoded.set(bytes, leadingZeros);
  return decoded;
}

export function isSolanaAddress(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 32 || trimmed.length > 44) return false;

  const bytes = decodeBase58(trimmed);
  return bytes !== null && bytes.length === 32;
}

/** True for an EVM-style address, so the UI can name the wrong network. */
export function isEvmAddress(value: string): boolean {
  return /^0x[0-9a-f]{40}$/i.test(value.trim());
}

/** "7xKX…9fQ2" — enough to compare, short enough for a row. */
export function shortenAddress(address: string, visible = 4): string {
  const trimmed = address.trim();
  if (trimmed.length <= visible * 2 + 1) return trimmed;

  return `${trimmed.slice(0, visible)}…${trimmed.slice(-visible)}`;
}

export type DestinationIssueCode =
  "empty" | "evm-network" | "invalid-characters" | "wrong-length" | "self";

export type DestinationIssue = {
  code: DestinationIssueCode;
  message: string;
};

/**
 * Why a destination cannot receive a transfer, or null when it can.
 *
 * `ownAddress` is optional because a preview wallet may have none. Self-send is
 * checked against the provider's own address only; it is never inferred from a
 * label or an internal id.
 */
export function validateDestination(
  input: string,
  ownAddress: string | null,
): DestinationIssue | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      code: "empty",
      message: "Enter the Solana address you want to send to.",
    };
  }

  if (/^0x/i.test(trimmed)) {
    return {
      code: "evm-network",
      message:
        "That looks like an EVM address. This wallet is on Solana, and an EVM address cannot receive a Solana transfer. Check the network and paste a Solana address.",
    };
  }

  if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed)) {
    return {
      code: "invalid-characters",
      message:
        "A Solana address uses base58 characters only. It cannot contain 0, O, I, l, or punctuation.",
    };
  }

  if (trimmed.length < 32 || trimmed.length > 44) {
    return {
      code: "wrong-length",
      message:
        "A Solana address is 32 to 44 characters long. Check that the whole address was pasted.",
    };
  }

  if (!isSolanaAddress(trimmed)) {
    return {
      code: "wrong-length",
      message:
        "That is not a valid Solana address. Check that the whole address was pasted and that it is not a different network's address.",
    };
  }

  if (ownAddress !== null && trimmed === ownAddress.trim()) {
    return {
      code: "self",
      message:
        "This is the wallet you are sending from. Sending to yourself would still spend the network fee, so choose a different destination.",
    };
  }

  return null;
}
