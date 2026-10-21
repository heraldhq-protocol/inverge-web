import type { PillTone } from "@/components/ui/pill";
import type {
  WalletCapabilityStatus,
  WalletProvisioningState,
} from "@/features/wallet/types";

/**
 * One label, tone, and consequence sentence per wallet state.
 *
 * `Record<Union, …>` so a new state fails the typecheck until every surface has
 * decided what it says. Colour is never the only signal.
 */

export const walletProvisioningLabels: Record<WalletProvisioningState, string> =
  {
    failed: "Provisioning failed",
    locked: "Wallet locked",
    provisioning: "Provisioning",
    ready: "Ready",
    unconfigured: "Not provisioned",
  };

export const walletProvisioningTones: Record<
  WalletProvisioningState,
  PillTone
> = {
  failed: "danger",
  locked: "warning",
  provisioning: "warning",
  ready: "accent",
  unconfigured: "neutral",
};

export const walletProvisioningDescriptions: Record<
  WalletProvisioningState,
  string
> = {
  failed:
    "Provisioning did not complete. Nothing was created and no address exists. Retry once a provider is connected.",
  locked:
    "The wallet is locked and cannot sign. Unlocking happens in the provider's own flow, never by entering a secret here.",
  provisioning:
    "A provider account is being created. No address exists until the provider returns one.",
  ready: "The provider returned an account and it can be used for signing.",
  unconfigured:
    "No embedded-wallet provider is configured in this build. No account exists, no address exists, and nothing can be signed.",
};

export const walletCapabilityStatusLabels: Record<
  WalletCapabilityStatus,
  string
> = {
  available: "Connected",
  preview: "Preview only",
  unavailable: "Not available",
};

export const walletCapabilityStatusTones: Record<
  WalletCapabilityStatus,
  PillTone
> = {
  available: "accent",
  preview: "neutral",
  unavailable: "neutral",
};
