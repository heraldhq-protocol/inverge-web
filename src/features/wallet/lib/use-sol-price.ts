"use client";

import { useEffect, useState } from "react";

const PRICE_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_last_updated_at=true";
const REFRESH_MS = 30_000;

/**
 * A live SOL/USD estimate from CoinGecko's free public endpoint.
 *
 * The price is a display estimate, not a quote and not a ledger input. A failed
 * refresh keeps the last successful value but marks it stale; with no successful
 * read the UI says unavailable instead of rendering zero.
 */
export type SolPrice =
  | { status: "loading"; usd: null; updatedAt: null; stale: false }
  | { status: "ready"; usd: number; updatedAt: number | null; stale: boolean }
  | {
      status: "unavailable";
      usd: null;
      updatedAt: null;
      stale: false;
    };

function readUsd(body: unknown): number | null {
  if (!body || typeof body !== "object") return null;
  const solana = (body as { solana?: unknown }).solana;
  if (!solana || typeof solana !== "object") return null;
  const usd = (solana as { usd?: unknown }).usd;
  return typeof usd === "number" && Number.isFinite(usd) && usd > 0
    ? usd
    : null;
}

function readUpdatedAt(body: unknown): number | null {
  if (!body || typeof body !== "object") return null;
  const solana = (body as { solana?: unknown }).solana;
  if (!solana || typeof solana !== "object") return null;
  const updatedAt = (solana as { last_updated_at?: unknown }).last_updated_at;
  return typeof updatedAt === "number" && Number.isFinite(updatedAt)
    ? updatedAt
    : null;
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: value < 1 ? 4 : 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(value);
}

export function useSolPrice(): SolPrice {
  const [price, setPrice] = useState<SolPrice>({
    status: "loading",
    usd: null,
    updatedAt: null,
    stale: false,
  });

  useEffect(() => {
    let active = true;
    let controller: AbortController | null = null;

    async function load(): Promise<void> {
      controller?.abort();
      controller = new AbortController();

      try {
        const response = await fetch(PRICE_URL, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("price_http");
        const body: unknown = await response.json();
        const usd = readUsd(body);
        if (usd === null) throw new Error("price_shape");
        if (!active) return;
        setPrice({
          status: "ready",
          usd,
          updatedAt: readUpdatedAt(body),
          stale: false,
        });
      } catch {
        if (!active) return;
        setPrice((current) =>
          current.status === "ready"
            ? { ...current, stale: true }
            : {
                status: "unavailable",
                usd: null,
                updatedAt: null,
                stale: false,
              },
        );
      }
    }

    void load();
    const interval = window.setInterval(() => void load(), REFRESH_MS);

    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(interval);
    };
  }, []);

  return price;
}
