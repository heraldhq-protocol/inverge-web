import type {
  WalletCapability,
  WalletCapabilityId,
} from "@/features/wallet/types";

/**
 * Capability audit.
 *
 * The UI must not imply a feature exists because a page for it exists. This
 * module turns the integration facts (provider configured, SDK installed,
 * session present, address provisioned, services wired) into one list that every
 * wallet surface reads. A capability is only `available` when the mechanism is
 * actually present; `preview` means a labelled sample, never live data.
 */

export type WalletCapabilityInput = {
  providerConfigured: boolean;
  /** True only when a provider SDK is a dependency of this application. */
  sdkInstalled: boolean;
  /** True only when the server can read an authenticated Inverge session. */
  sessionAvailable: boolean;
  /** True only when the provider returned a public address. */
  addressAvailable: boolean;
  onRampConfigured: boolean;
  refundServiceConfigured: boolean;
  /** True only when the provider documents a supported export flow. */
  exportSupported: boolean;
};

type Definition = {
  id: WalletCapabilityId;
  label: string;
  enabled: (input: WalletCapabilityInput) => boolean;
  preview?: (input: WalletCapabilityInput) => boolean;
  unavailableReason: (input: WalletCapabilityInput) => string | null;
};

const definitions: readonly Definition[] = [
  {
    enabled: (input) =>
      input.providerConfigured && input.sdkInstalled && input.sessionAvailable,
    id: "provisioning",
    label: "Wallet provisioning",
    unavailableReason: (input) => {
      if (!input.providerConfigured) {
        return "No embedded-wallet provider is configured in this build.";
      }
      if (!input.sdkInstalled) {
        return "The embedded-wallet SDK is not installed, so no wallet can be created or recovered.";
      }
      if (!input.sessionAvailable) {
        return "No authenticated Inverge session exists, so a provider account cannot be bound to a user.";
      }
      return null;
    },
  },
  {
    enabled: (input) => input.addressAvailable,
    id: "balance",
    label: "Balances",
    preview: () => true,
    unavailableReason: (input) =>
      input.addressAvailable
        ? null
        : "No public address has been returned yet, so neither the SOL nor the USDC balance can be read.",
  },
  {
    enabled: (input) =>
      input.providerConfigured &&
      input.sdkInstalled &&
      input.sessionAvailable &&
      input.addressAvailable,
    id: "receive",
    label: "Receive and deposit",
    unavailableReason: (input) =>
      input.addressAvailable
        ? null
        : "No linked public address exists yet. A device address is not exposed as a deposit address, so there is nothing to share or encode as a QR code.",
  },
  {
    enabled: (input) => input.addressAvailable,
    id: "activity",
    label: "Activity history",
    preview: () => true,
    unavailableReason: (input) =>
      input.addressAvailable
        ? null
        : "Activity is derived from preview contribution records, not a chain index.",
  },
  {
    enabled: (input) =>
      input.providerConfigured &&
      input.sdkInstalled &&
      input.sessionAvailable &&
      input.addressAvailable,
    id: "signing",
    label: "Signing and sending",
    unavailableReason: () =>
      "Wallet signing is not connected. Nothing in this build can sign a transfer or a contribution.",
  },
  {
    enabled: (input) => input.onRampConfigured,
    id: "on-ramp",
    label: "Card and bank funding",
    unavailableReason: () =>
      "No licensed on-ramp provider is configured, so no quote, rate, fee, or card session exists.",
  },
  {
    enabled: (input) =>
      input.providerConfigured &&
      input.sdkInstalled &&
      input.sessionAvailable &&
      input.addressAvailable,
    id: "withdrawal",
    label: "Send and withdraw",
    unavailableReason: () =>
      "Withdrawals need wallet signing and a fee quote from an RPC endpoint. Neither is connected in this build.",
  },
  {
    enabled: (input) => input.refundServiceConfigured,
    id: "refunds",
    label: "Refund execution",
    unavailableReason: () =>
      "No refund service or escrow index is connected. Refund records are preview data and cannot be claimed here.",
  },
  {
    enabled: (input) =>
      input.exportSupported &&
      input.sdkInstalled &&
      input.sessionAvailable &&
      input.addressAvailable,
    id: "export",
    label: "Key export",
    unavailableReason: () =>
      "This build has no export capability and never reads, stores, or displays a private key, seed phrase, or signing share.",
  },
];

export function auditWalletCapabilities(
  input: WalletCapabilityInput,
): readonly WalletCapability[] {
  return definitions.map((definition) => {
    const available = definition.enabled(input);

    return {
      id: definition.id,
      label: definition.label,
      reason: available ? null : definition.unavailableReason(input),
      status: available
        ? "available"
        : definition.preview?.(input)
          ? "preview"
          : "unavailable",
    };
  });
}

export function capabilityStatus(
  capabilities: readonly WalletCapability[],
  id: WalletCapabilityId,
): WalletCapability["status"] {
  return (
    capabilities.find((capability) => capability.id === id)?.status ??
    "unavailable"
  );
}

export function describeCapabilityStatus(
  status: WalletCapability["status"],
): string {
  switch (status) {
    case "available":
      return "Connected";
    case "preview":
      return "Preview only";
    case "unavailable":
      return "Not available";
  }
}
