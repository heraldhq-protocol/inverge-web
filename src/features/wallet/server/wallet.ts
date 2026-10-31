import "server-only";

import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionToken } from "@/features/auth/server/session";
import { readSessionUser } from "@/features/auth/server/session-user";
import {
  createPreviewWalletView,
  previewWalletFundingSnapshot,
} from "@/features/wallet/content/preview-wallet";
import { isSolanaAddress } from "@/features/wallet/lib/address";
import { auditWalletCapabilities } from "@/features/wallet/lib/capabilities";
import { resolveWalletSdkConfig } from "@/features/wallet/lib/provider-config";
import type {
  WalletDataSource,
  WalletFundingSnapshot,
  WalletView,
} from "@/features/wallet/types";
import { fetchApiJson } from "@/lib/api/server";

/**
 * The wallet seam.
 *
 * There are two sources of truth, kept separate:
 *
 * - `inverge-api` owns account linkage. `GET /wallets` returns the wallets the
 *   API has bound to the authenticated user; only an embedded Web3Auth wallet
 *   is projected into this page, because the browser card is the embedded
 *   wallet. The API links it at sign-in only after verifying the identity
 *   token's wallet attestation.
 * - The preview fixtures own activity, refunds, and the funding snapshot. No
 *   chain index, refund service, or on-ramp exists yet, so those remain
 *   labelled examples.
 *
 * In preview auth, or when the API is unreachable, the preview account is
 * returned unchanged. It has no address and is marked unconfigured; nothing is
 * inferred from the browser session.
 */

const sdkConfig = resolveWalletSdkConfig({
  clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
  network: process.env.NEXT_PUBLIC_WEB3AUTH_NETWORK,
  cluster: process.env.NEXT_PUBLIC_WALLET_NETWORK,
  rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
});

export const walletDataSource: WalletDataSource = "preview";

type WalletRecord = {
  address?: unknown;
  createdAt?: unknown;
  isEmbedded?: unknown;
  provider?: unknown;
};

export type LinkedWallet = {
  address: string;
  provisionedAt: string | null;
};

/**
 * Selects the embedded wallet from the API's wallet list.
 *
 * External payout wallets are ignored: this page describes the embedded wallet
 * the provider has in this browser, and presenting an external address as its
 * linked counterpart would create a false mismatch. A record is accepted only
 * when its address is a real Solana address.
 */
export function selectLinkedWallet(payload: unknown): LinkedWallet | null {
  if (!Array.isArray(payload)) return null;

  const embedded = payload.filter((item): item is WalletRecord => {
    if (!item || typeof item !== "object") return false;
    const record = item as WalletRecord;
    return record.isEmbedded === true || record.provider === "web3auth";
  });

  for (const record of embedded) {
    if (typeof record.address === "string" && isSolanaAddress(record.address)) {
      return {
        address: record.address,
        provisionedAt:
          typeof record.createdAt === "string" ? record.createdAt : null,
      };
    }
  }

  return null;
}

async function readLinkedWallet(): Promise<LinkedWallet | null> {
  if (isPreviewAuth()) return null;

  const token = await readSessionToken();
  if (!token) return null;

  try {
    const payload = await fetchApiJson<unknown>("/wallets", {
      timeoutMs: 3_000,
      token,
    });
    return selectLinkedWallet(payload);
  } catch {
    // An unreachable API is not a wallet: the page falls back to the
    // unconfigured preview account rather than failing the whole route.
    return null;
  }
}

export async function getWalletView(): Promise<WalletView> {
  const view = createPreviewWalletView({
    providerConfigured: sdkConfig !== null,
    sdkInstalled: true,
  });

  const [linked, user] = await Promise.all([
    readLinkedWallet(),
    readSessionUser(),
  ]);

  const capabilities = auditWalletCapabilities({
    addressAvailable: linked !== null,
    exportSupported: false,
    onRampConfigured: false,
    providerConfigured: sdkConfig !== null,
    refundServiceConfigured: false,
    sessionAvailable: user?.mode === "live",
    sdkInstalled: true,
  });

  if (!linked) return { ...view, capabilities };

  return {
    ...view,
    account: {
      ...view.account,
      address: linked.address,
      provisionedAt: linked.provisionedAt,
      provisioning: "ready",
      userId: user?.mode === "live" ? user.id : view.account.userId,
    },
    capabilities,
  };
}

export function getWalletFundingSnapshot(): WalletFundingSnapshot {
  return previewWalletFundingSnapshot({
    providerConfigured: sdkConfig !== null,
    sdkInstalled: true,
  });
}
