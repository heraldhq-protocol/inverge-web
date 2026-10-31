import type { WalletAssetId, WalletNetworkId } from "@/features/wallet/types";

/**
 * Solana network and asset registry.
 *
 * Only networks and assets whose parameters are actually known are listed.
 * `cNGN` is present with `supported: false` because the product names it
 * (FR-401) but this build has no verified mint address or decimals for it;
 * listing it as supported would invite a transfer that cannot be built.
 *
 * The default is devnet. This repository performs no production chain writes,
 * and a preview must not default a user into mainnet.
 */

export type WalletNetwork = {
  id: WalletNetworkId;
  label: string;
  shortLabel: string;
  cluster: "devnet" | "mainnet-beta";
  explorerBaseUrl: string;
};

export const WALLET_NETWORKS: Readonly<Record<WalletNetworkId, WalletNetwork>> =
  {
    "solana-devnet": {
      cluster: "devnet",
      explorerBaseUrl: "https://explorer.solana.com",
      id: "solana-devnet",
      label: "Solana devnet",
      shortLabel: "Devnet",
    },
    "solana-mainnet-beta": {
      cluster: "mainnet-beta",
      explorerBaseUrl: "https://explorer.solana.com",
      id: "solana-mainnet-beta",
      label: "Solana mainnet",
      shortLabel: "Mainnet",
    },
  };

export const DEFAULT_WALLET_NETWORK_ID: WalletNetworkId = "solana-devnet";

/**
 * Circle-issued USDC mints, verified against Circle's USDC contract-address
 * table. Devnet uses Circle's Solana Devnet test mint; mainnet uses the
 * canonical Solana USDC mint. A token balance is read only for the mint that
 * belongs to the active wallet network.
 */
export const USDC_MINT_ADDRESSES: Readonly<Record<WalletNetworkId, string>> = {
  "solana-devnet": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
  "solana-mainnet-beta": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
};

export function getUsdcMint(networkId: WalletNetworkId): string {
  return USDC_MINT_ADDRESSES[networkId];
}

export type WalletAsset = {
  id: WalletAssetId;
  name: string;
  symbol: string;
  /** Null when the asset's decimals are not verified. */
  decimals: number | null;
  kind: "spl-token" | "native" | "unsupported";
  /** Can fund a campaign contribution. */
  funding: boolean;
  /** Can be sent/withdrawn to an external address. */
  withdrawal: boolean;
  /** Why the asset cannot be used, when it cannot. */
  unavailableReason: string | null;
};

export const WALLET_ASSETS: Readonly<Record<WalletAssetId, WalletAsset>> = {
  USDC: {
    decimals: 6,
    funding: true,
    id: "USDC",
    kind: "spl-token",
    name: "USD Coin",
    symbol: "USDC",
    unavailableReason: null,
    withdrawal: true,
  },
  SOL: {
    decimals: 9,
    funding: false,
    id: "SOL",
    kind: "native",
    name: "Solana",
    symbol: "SOL",
    unavailableReason:
      "SOL pays network fees. Campaign contributions settle in USDC, so SOL cannot be used as the contribution amount.",
    withdrawal: true,
  },
  cNGN: {
    decimals: null,
    funding: false,
    id: "cNGN",
    kind: "unsupported",
    name: "cNGN",
    symbol: "cNGN",
    unavailableReason:
      "This build has no verified cNGN mint address or decimals, so it cannot build a transfer. The asset is named in the product requirements but is not connected here.",
    withdrawal: false,
  },
};

export function getWalletNetwork(id: WalletNetworkId): WalletNetwork {
  return WALLET_NETWORKS[id];
}

export function getWalletAsset(id: WalletAssetId): WalletAsset {
  return WALLET_ASSETS[id];
}

export function isWalletAssetSupported(id: WalletAssetId): boolean {
  return WALLET_ASSETS[id].kind !== "unsupported";
}

function explorerQuery(network: WalletNetwork): string {
  return network.cluster === "devnet" ? "?cluster=devnet" : "";
}

/** A public explorer URL for a validated address. */
export function explorerAddressUrl(
  networkId: WalletNetworkId,
  address: string,
): string {
  const network = getWalletNetwork(networkId);
  return `${network.explorerBaseUrl}/address/${encodeURIComponent(address)}${explorerQuery(network)}`;
}

/**
 * A public explorer URL for a transaction signature.
 *
 * No component calls this in this build because no signature exists. It is
 * exported so the first real transaction has one place to build its link, and
 * it is tested so the URL shape cannot silently rot.
 */
export function explorerTransactionUrl(
  networkId: WalletNetworkId,
  signature: string,
): string {
  const network = getWalletNetwork(networkId);
  return `${network.explorerBaseUrl}/tx/${encodeURIComponent(signature)}${explorerQuery(network)}`;
}
