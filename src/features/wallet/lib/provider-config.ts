import { getWalletNetwork } from "@/features/wallet/lib/networks";
import type { WalletNetworkId } from "@/features/wallet/types";

/**
 * MetaMask Embedded Wallets (Web3Auth) client configuration.
 *
 * The Client ID is public by design, but it must be present before the SDK is
 * initialised: a provider started without a project cannot provision a wallet,
 * and a missing variable must degrade to the labelled preview surface rather
 * than crash the page. This module is pure, so the gating rule is unit-tested
 * without loading a browser-only SDK.
 *
 * The Solana chain is declared here rather than in the dashboard because the
 * dashboard's pre-configured networks are EVM-only. Passing `chains` is an
 * override — only the chains listed reach the SDK — which keeps this app
 * Solana-only and gives the SDK the entry it needs to build a Solana wallet.
 */

export type WalletSdkNetwork = "sapphire-devnet" | "sapphire-mainnet";

/**
 * A Solana chain as the SDK expects it. Every field except the ticker is
 * required by the provider config interface.
 */
export type WalletSdkChain = {
  chainNamespace: "solana";
  chainId: string;
  rpcTarget: string;
  wsTarget: string;
  displayName: string;
  blockExplorerUrl: string;
  ticker: string;
  tickerName: string;
  decimals: number;
  isTestnet: boolean;
  logo: string;
};

export type WalletSdkConfig = {
  clientId: string;
  network: WalletSdkNetwork;
  chain: WalletSdkChain;
  /** Always equal to `chain.chainId`: the connection starts on this chain. */
  defaultChainId: string;
};

/**
 * Raw environment values. `undefined` is the expected state while the project is
 * unconfigured, so the fields are explicitly nullable rather than optional.
 */
export type WalletSdkEnv = {
  clientId: string | undefined;
  network: string | undefined;
  cluster: string | undefined;
  rpcUrl: string | undefined;
};

/**
 * Solana chain ids exactly as the SDK's own `SOLANA_CAIP_CHAIN_MAP` keys them.
 * The embedded provider refuses Solana operations for any other id, so these
 * hex values are not interchangeable with the CAIP genesis hashes.
 */
const SOLANA_CHAIN_IDS: Readonly<Record<WalletNetworkId, string>> = {
  "solana-devnet": "0x67",
  "solana-mainnet-beta": "0x65",
};

const SOLANA_ENDPOINTS: Readonly<
  Record<WalletNetworkId, { rpcTarget: string; displayName: string }>
> = {
  "solana-devnet": {
    displayName: "Solana Devnet",
    rpcTarget: "https://api.devnet.solana.com",
  },
  "solana-mainnet-beta": {
    displayName: "Solana Mainnet",
    rpcTarget: "https://api.mainnet-beta.solana.com",
  },
};

/** The provider config requires a logo; the vendor's custom-chain example uses this host. */
const SOLANA_LOGO_URL = "https://cryptologos.cc/logos/solana-sol-logo.png";

/** Solana RPC providers serve websockets on the same host as the HTTP endpoint. */
function websocketTarget(rpcTarget: string): string {
  return rpcTarget.replace(/^https:\/\//, "wss://");
}

function explorerUrl(network: WalletNetworkId): string {
  const base = getWalletNetwork(network).explorerBaseUrl;
  return network === "solana-devnet" ? `${base}/?cluster=devnet` : base;
}

function buildChain(
  network: WalletNetworkId,
  rpcUrl: string | undefined,
): WalletSdkChain {
  const endpoints = SOLANA_ENDPOINTS[network];
  const rpcTarget = rpcUrl?.trim() || endpoints.rpcTarget;

  return {
    blockExplorerUrl: explorerUrl(network),
    chainId: SOLANA_CHAIN_IDS[network],
    chainNamespace: "solana",
    decimals: 9,
    displayName: endpoints.displayName,
    isTestnet: network === "solana-devnet",
    logo: SOLANA_LOGO_URL,
    rpcTarget,
    ticker: "SOL",
    tickerName: "Solana",
    wsTarget: websocketTarget(rpcTarget),
  };
}

/**
 * Sapphire Devnet is the default. Only an explicit `sapphire-mainnet` selects
 * production, so a typo cannot point a local build at mainnet — which would
 * also change every user's wallet address.
 */
export function resolveWalletSdkNetwork(
  value: string | undefined,
): WalletSdkNetwork {
  return value?.trim() === "sapphire-mainnet"
    ? "sapphire-mainnet"
    : "sapphire-devnet";
}

/** Solana Devnet is the default, for the same reason as the Sapphire network. */
export function resolveWalletNetworkId(
  value: string | undefined,
): WalletNetworkId {
  return value?.trim() === "solana-mainnet-beta"
    ? "solana-mainnet-beta"
    : "solana-devnet";
}

/** The SDK config, or `null` when the Client ID is absent or blank. */
export function resolveWalletSdkConfig(
  env: WalletSdkEnv,
): WalletSdkConfig | null {
  const clientId = env.clientId?.trim();
  if (!clientId) return null;

  const chain = buildChain(resolveWalletNetworkId(env.cluster), env.rpcUrl);

  return {
    chain,
    clientId,
    defaultChainId: chain.chainId,
    network: resolveWalletSdkNetwork(env.network),
  };
}
