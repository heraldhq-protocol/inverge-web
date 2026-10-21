import type { RefundState } from "@/features/campaigns/types";
import type { MoneyAmount } from "@/lib/money";

/**
 * Wallet domain model.
 *
 * The wallet is an identity-bound account, not an address: `userId` is
 * Inverge's own stable identifier and the address is one attribute of a
 * provisioned provider account. No surface may use the address as a primary
 * key, a route parameter, or a display identity.
 *
 * Every amount is an integer string in the asset's own atomic units. A wallet
 * token amount (USDC has six decimals) is deliberately a different type from
 * the campaign's two-decimal USD `MoneyAmount`; the two are converted only where
 * the product explicitly says USDC settles 1:1 against the USD figure.
 */

export type WalletNetworkId = "solana-devnet" | "solana-mainnet-beta";

export type WalletAssetId = "USDC" | "SOL" | "cNGN";

/**
 * Provisioning is its own lifecycle.
 *
 * `unconfigured` is the honest state when no provider/session exists. It is not
 * the same as "no wallet yet": it says Inverge cannot even start provisioning.
 */
export type WalletProvisioningState =
  "unconfigured" | "provisioning" | "ready" | "failed" | "locked";

export type WalletProviderId = "metamask-embedded" | "none";

export type WalletProvider = {
  id: WalletProviderId;
  /** Human-readable provider name. Shown only in trust/security context. */
  label: string;
  /** True only when credentials and the SDK are actually present. */
  configured: boolean;
  /** Embedded wallets are created and signed through the provider, not imported. */
  isEmbedded: boolean;
};

export type WalletAccount = {
  /** Inverge's internal user id. Never a wallet address. */
  userId: string;
  network: WalletNetworkId;
  provisioning: WalletProvisioningState;
  /**
   * The provider's public address, or null when no provider has returned one.
   * Null is never replaced with a placeholder or a generated keypair.
   */
  address: string | null;
  provider: WalletProvider;
  provisionedAt: string | null;
};

export type WalletBalance = {
  assetId: WalletAssetId;
  /** Integer atomic units. */
  atomic: string;
  decimals: number;
  /** True when the figure is a labelled sample rather than a chain read. */
  sample: boolean;
};

export type WalletActivityStatus =
  "available" | "pending" | "confirmed" | "failed" | "reconciling";

export type WalletActivityDirection = "in" | "out" | "none";

export type WalletActivityReference =
  | { kind: "contribution"; id: string; href: string }
  | { kind: "refund"; id: string; href: string }
  | { kind: "none" };

export type WalletTransactionRef = {
  network: "devnet" | "mainnet-beta";
  signature: string;
};

export type WalletActivityItem = {
  id: string;
  kind: "contribution" | "refund";
  title: string;
  /** What the status means in this record's own terms. */
  description: string;
  occurredAt: string;
  status: WalletActivityStatus;
  direction: WalletActivityDirection;
  /** Null when the record has no settled amount to show. */
  amount: {
    assetId: WalletAssetId;
    atomic: string;
    decimals: number;
  } | null;
  reference: WalletActivityReference;
  /** Always null in this build; there is no chain to read. */
  transaction: WalletTransactionRef | null;
  /** Every record in this repository is preview data. */
  demo: true;
};

export type WalletRefund = {
  id: string;
  contributionId: string;
  campaignTitle: string;
  campaignSlug: string;
  state: RefundState;
  eligibleAmount: MoneyAmount;
  reason: string | null;
  claimSubmittedAt: string | null;
  confirmedAt: string | null;
  transaction: WalletTransactionRef | null;
};

export type WalletCapabilityId =
  | "provisioning"
  | "balance"
  | "receive"
  | "activity"
  | "signing"
  | "on-ramp"
  | "withdrawal"
  | "refunds"
  | "export";

export type WalletCapabilityStatus = "available" | "preview" | "unavailable";

export type WalletCapability = {
  id: WalletCapabilityId;
  label: string;
  status: WalletCapabilityStatus;
  /** Why the capability is where it is. Null only when nothing needs saying. */
  reason: string | null;
};

export type WalletDataSource = "preview" | "live";

export type WalletView = {
  dataSource: WalletDataSource;
  account: WalletAccount;
  balances: readonly WalletBalance[];
  activity: readonly WalletActivityItem[];
  refunds: readonly WalletRefund[];
  capabilities: readonly WalletCapability[];
  totals: {
    /** Claimable now, from refunds whose state is `available`. */
    refundable: MoneyAmount;
    /** Claimed and still being returned. */
    refundsInProgress: MoneyAmount;
    /** Already confirmed returned. */
    refunded: MoneyAmount;
  };
  counts: {
    activity: number;
    pending: number;
    refunds: number;
    needsAttention: number;
  };
  /** Null when no chain read exists. Never `Date.now()` pretending to be one. */
  updatedAt: string | null;
};

/**
 * The serialisable slice of the wallet that the contribution flow needs.
 *
 * It intentionally carries no address for display and no secrets: a balance,
 * an asset, and whether signing exists are enough to answer "can this backer
 * pay from this wallet?" without exposing account detail to the checkout.
 */
export type WalletFundingSnapshot = {
  configured: boolean;
  provisioning: WalletProvisioningState;
  network: WalletNetworkId;
  /** The asset the snapshot was read for; only USDC can settle a contribution. */
  assetId: WalletAssetId;
  decimals: number;
  balanceAtomic: string | null;
  signingAvailable: boolean;
  /** True when the balance is a labelled sample. */
  sample: boolean;
};
