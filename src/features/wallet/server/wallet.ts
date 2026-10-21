import "server-only";

import {
  createPreviewWalletView,
  previewWalletFundingSnapshot,
} from "@/features/wallet/content/preview-wallet";
import { resolveWalletSdkConfig } from "@/features/wallet/lib/provider-config";
import type {
  WalletDataSource,
  WalletFundingSnapshot,
  WalletView,
} from "@/features/wallet/types";

/**
 * The wallet seam.
 *
 * Every wallet route reads through this module. It still returns preview
 * fixtures and labels them as such, because there is no authenticated Inverge
 * session and no server-side wallet read: the browser can hold a provider
 * address, but this module cannot bind it to a user. The SDK and Client ID are
 * reported so the capability audit stops claiming the provider is absent while
 * still marking provisioning and signing unavailable.
 *
 * When the API can verify a provider token and issue a session, this is the only
 * file that changes: it will read the authenticated Inverge user id and ask the
 * API for the wallet projection. No component calls a provider SDK, and no
 * client component receives an address it did not come through here.
 */

const sdkConfig = resolveWalletSdkConfig({
  clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
  network: process.env.NEXT_PUBLIC_WEB3AUTH_NETWORK,
  cluster: process.env.NEXT_PUBLIC_WALLET_NETWORK,
  rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
});

export const walletDataSource: WalletDataSource = "preview";

export function getWalletView(): WalletView {
  return createPreviewWalletView({
    providerConfigured: sdkConfig !== null,
    sdkInstalled: true,
  });
}

export function getWalletFundingSnapshot(): WalletFundingSnapshot {
  return previewWalletFundingSnapshot({
    providerConfigured: sdkConfig !== null,
    sdkInstalled: true,
  });
}
