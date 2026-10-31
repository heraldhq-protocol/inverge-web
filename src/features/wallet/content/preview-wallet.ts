import { previewContributions } from "@/features/campaigns/content/preview-contributions";
import {
  activityCounts,
  needsAttention,
  walletActivityFromContributions,
} from "@/features/wallet/lib/activity";
import { auditWalletCapabilities } from "@/features/wallet/lib/capabilities";
import {
  refundsFromContributions,
  summariseRefunds,
} from "@/features/wallet/lib/refunds";
import type {
  WalletBalance,
  WalletFundingSnapshot,
  WalletView,
} from "@/features/wallet/types";

/**
 * Preview wallet fixtures.
 *
 * The account is deliberately **not** provisioned and has **no address**. An
 * embedded-wallet SDK is a dependency now, and a Client ID may be present, but
 * the API does not bind a provider address to a user, so this server projection
 * cannot carry one. The browser card shows the provider's real address and SOL
 * balance separately; nothing here manufactures an address or a QR code.
 *
 * The two balances are labelled samples so the contribution flow can demonstrate
 * a balance check and an insufficient-funds state. They are not presented as a
 * chain read, and no deposit, withdrawal, or transaction is fabricated.
 */

/** Inverge's internal user id — the stable identity. Never an address. */
const PREVIEW_USER_ID = "user-preview-amara";

const sampleBalances: readonly WalletBalance[] = [
  {
    assetId: "USDC",
    atomic: "1250500000", // 1,250.50 USDC
    decimals: 6,
    sample: true,
  },
  {
    assetId: "SOL",
    atomic: "420000000", // 0.42 SOL
    decimals: 9,
    sample: true,
  },
];

/** What the integration actually has, so the capability audit stays honest. */
export type PreviewWalletFlags = {
  /** True only when a MetaMask Embedded Wallets Client ID is present. */
  providerConfigured?: boolean;
  /** True only when the provider SDK is a dependency of this application. */
  sdkInstalled?: boolean;
};

export function createPreviewWalletView(
  flags: PreviewWalletFlags = {},
): WalletView {
  const providerConfigured = flags.providerConfigured ?? false;
  const sdkInstalled = flags.sdkInstalled ?? false;
  const activity = walletActivityFromContributions(previewContributions);
  const refunds = refundsFromContributions(previewContributions);
  const refundSummary = summariseRefunds(refunds);
  const counts = activityCounts(activity);

  return {
    account: {
      address: null,
      network: "solana-devnet",
      provisionedAt: null,
      provisioning: "unconfigured",
      provider: {
        configured: providerConfigured,
        id: "metamask-embedded",
        isEmbedded: true,
        label: "MetaMask Embedded Wallets",
      },
      userId: PREVIEW_USER_ID,
    },
    activity,
    balances: sampleBalances,
    capabilities: auditWalletCapabilities({
      addressAvailable: false,
      exportSupported: false,
      onRampConfigured: false,
      providerConfigured,
      refundServiceConfigured: false,
      sdkInstalled,
      sessionAvailable: false,
    }),
    counts: {
      activity: counts.all,
      needsAttention: counts.attention,
      pending: counts.pending,
      refunds: refunds.length,
    },
    dataSource: "preview",
    refunds,
    totals: {
      refundable: refundSummary.refundable,
      refunded: refundSummary.refunded,
      refundsInProgress: refundSummary.inProgress,
    },
    updatedAt: null,
  };
}

/** The slice the contribution checkout needs, with no account detail. */
export function walletFundingSnapshot(view: WalletView): WalletFundingSnapshot {
  const balance = view.balances.find((item) => item.assetId === "USDC");

  return {
    assetId: "USDC",
    balanceAtomic: balance?.atomic ?? null,
    configured: view.account.provider.configured,
    decimals: balance?.decimals ?? 6,
    network: view.account.network,
    provisioning: view.account.provisioning,
    sample: balance?.sample ?? false,
    signingAvailable: false,
  };
}

export function previewWalletFundingSnapshot(
  flags: PreviewWalletFlags = {},
): WalletFundingSnapshot {
  return walletFundingSnapshot(createPreviewWalletView(flags));
}

/** True when the history has anything a backer must act on. */
export function hasWalletAttention(view: WalletView): boolean {
  return (
    view.counts.needsAttention > 0 ||
    view.activity.some((item) => needsAttention(item))
  );
}
