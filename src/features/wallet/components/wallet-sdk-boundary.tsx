"use client";

import { WEB3AUTH_NETWORK } from "@web3auth/modal";
import { Web3AuthProvider } from "@web3auth/modal/react";
import { SolanaProvider } from "@web3auth/modal/react/solana";
import type { ReactNode } from "react";

import type {
  WalletSdkConfig,
  WalletSdkNetwork,
} from "@/features/wallet/lib/provider-config";

/**
 * The only module that imports the provider SDK.
 *
 * It is reached through `next/dynamic` with `ssr: false`, so the browser-only
 * SDK never evaluates on the server. The provider and network are fixed by
 * config and must not change in production: either one changes every user's
 * wallet address.
 *
 * `chains` is set deliberately. The dashboard's pre-configured networks are
 * EVM-only, and the SDK builds its Solana wallet only from the Solana entries in
 * `coreOptions.chains`; with an EVM-only list the connection reports itself
 * signed in while `useSolanaWallet().accounts` stays null. Supplying the chain
 * also makes the list an override, so no other namespace reaches the SDK.
 * `defaultChainId` must match it, because the active chain namespace is what
 * makes Solana accounts readable at all.
 *
 * `uiConfig` brands the provider's own modal with Inverge's name and colours.
 * No logo is supplied: the modal is rendered in the provider's origin, so a
 * relative asset could not be loaded, and there is no hosted brand asset yet.
 *
 * Mounting this provider never opens the modal. Only an explicit `connect()`
 * from a child does that.
 */

const WEB3AUTH_NETWORKS = {
  "sapphire-devnet": WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  "sapphire-mainnet": WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
} satisfies Record<WalletSdkNetwork, unknown>;

const UI_CONFIG = {
  appName: "Inverge",
  defaultLanguage: "en",
  mode: "light",
  theme: {
    // Mirrors --inverge-brand / white in globals.css.
    onPrimary: "#ffffff",
    primary: "#1fa85c",
  },
} as const;

export function WalletSdkBoundary({
  config,
  children,
}: {
  config: WalletSdkConfig;
  children: ReactNode;
}) {
  return (
    <Web3AuthProvider
      config={{
        web3AuthOptions: {
          chains: [config.chain],
          clientId: config.clientId,
          defaultChainId: config.defaultChainId,
          uiConfig: UI_CONFIG,
          // The Wallet Services iframe ships a floating widget button by
          // default. Inverge owns the wallet surface and opens the same services
          // from its own Receive/Send/Add funds controls, so the duplicate
          // bottom-left overlay stays off.
          walletServicesConfig: {
            loginMode: "plugin",
            whiteLabel: { showWidgetButton: false },
          },
          web3AuthNetwork: WEB3AUTH_NETWORKS[config.network],
        },
      }}
    >
      <SolanaProvider>{children}</SolanaProvider>
    </Web3AuthProvider>
  );
}
