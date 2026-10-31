"use client";

import { address as toSolanaAddress } from "@solana/kit";
import type { useSolanaWallet } from "@web3auth/modal/react/solana";
import { useEffect, useState } from "react";

type SolanaRpc = NonNullable<ReturnType<typeof useSolanaWallet>["rpc"]>;

export type SplTokenBalance =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; atomic: bigint; decimals: number }
  | { status: "unavailable" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

/**
 * Sums the atomic amounts in a `getTokenAccountsByOwner` jsonParsed response.
 *
 * Returns null when the shape cannot be trusted, so a malformed response is
 * surfaced as unavailable rather than as a zero balance.
 */
export function sumTokenAccountAmounts(
  payload: unknown,
  fallbackDecimals: number,
): { atomic: bigint; decimals: number } | null {
  if (!isRecord(payload) || !Array.isArray(payload.value)) return null;

  let total = 0n;
  let expectedDecimals: number | null = null;

  for (const entry of payload.value) {
    if (!isRecord(entry) || !isRecord(entry.account)) return null;
    const data = entry.account.data;
    if (!isRecord(data) || !isRecord(data.parsed)) return null;
    const info = data.parsed.info;
    if (!isRecord(info) || !isRecord(info.tokenAmount)) return null;

    const { amount, decimals } = info.tokenAmount;
    if (typeof amount !== "string" || !/^\d+$/.test(amount)) return null;
    if (typeof decimals !== "number" || !Number.isInteger(decimals))
      return null;

    if (expectedDecimals === null) expectedDecimals = decimals;
    if (expectedDecimals !== decimals) return null;

    total += BigInt(amount);
  }

  // No token account is a real zero balance for this mint, not a failed read.
  return expectedDecimals === null
    ? { atomic: 0n, decimals: fallbackDecimals }
    : { atomic: total, decimals: expectedDecimals };
}

/**
 * Reads one SPL token mint for the connected owner.
 *
 * The mint is chosen by the active wallet network, so the devnet and mainnet
 * USDC balances never get mixed. A failed or unparseable read stays
 * "unavailable" instead of becoming zero.
 */
export function useSplTokenBalance(
  rpc: SolanaRpc | null,
  owner: string | null,
  mint: string | null,
): SplTokenBalance {
  const [result, setResult] = useState<{
    key: string;
    balance: SplTokenBalance;
  } | null>(null);
  const key = owner && mint ? `${owner}:${mint}` : null;

  useEffect(() => {
    if (!rpc || !owner || !mint || key === null) return;

    const client = rpc;
    let cancelled = false;

    void Promise.resolve()
      .then(() =>
        client
          .getTokenAccountsByOwner(
            toSolanaAddress(owner),
            { mint: toSolanaAddress(mint) },
            { encoding: "jsonParsed" },
          )
          .send(),
      )
      .then((payload) => {
        if (cancelled) return;
        const parsed = sumTokenAccountAmounts(payload, 6);
        setResult({
          balance:
            parsed === null
              ? { status: "unavailable" }
              : {
                  status: "ready",
                  atomic: parsed.atomic,
                  decimals: parsed.decimals,
                },
          key,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ balance: { status: "unavailable" }, key });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key, mint, owner, rpc]);

  if (!owner || !mint) return { status: "idle" };
  if (!rpc) return { status: "unavailable" };
  return result?.key === key ? result.balance : { status: "loading" };
}
