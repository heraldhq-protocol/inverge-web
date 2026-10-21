import { Pill } from "@/components/ui/pill";
import { describeCapabilityStatus } from "@/features/wallet/lib/capabilities";
import {
  walletCapabilityStatusTones,
  walletProvisioningLabels,
  walletProvisioningTones,
} from "@/features/wallet/lib/status";
import type {
  WalletCapability,
  WalletCapabilityStatus,
  WalletProvisioningState,
} from "@/features/wallet/types";

/**
 * Wallet status labels.
 *
 * The text is the state; colour is a second, redundant signal. A reader who
 * cannot distinguish the tones still learns that the wallet is not provisioned.
 */

export function WalletStatusPill({
  state,
  size = "sm",
}: {
  state: WalletProvisioningState;
  size?: "xs" | "sm";
}) {
  return (
    <Pill tone={walletProvisioningTones[state]} size={size}>
      {walletProvisioningLabels[state]}
    </Pill>
  );
}

export function CapabilityStatusPill({
  status,
  size = "xs",
}: {
  status: WalletCapabilityStatus;
  size?: "xs" | "sm";
}) {
  return (
    <Pill tone={walletCapabilityStatusTones[status]} size={size}>
      {describeCapabilityStatus(status)}
    </Pill>
  );
}

export function CapabilityRow({
  capability,
}: {
  capability: WalletCapability;
}) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 py-3 last:border-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{capability.label}</p>
        {capability.reason ? (
          <p className="mt-0.5 text-xs leading-5 text-muted">
            {capability.reason}
          </p>
        ) : null}
      </div>
      <CapabilityStatusPill status={capability.status} />
    </li>
  );
}

export function CapabilityList({
  capabilities,
  className = "",
}: {
  capabilities: readonly WalletCapability[];
  className?: string;
}) {
  return (
    <ul className={`divide-y divide-border ${className}`}>
      {capabilities.map((capability) => (
        <CapabilityRow key={capability.id} capability={capability} />
      ))}
    </ul>
  );
}
