import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  DeliveryTruck01Icon,
  Package01Icon,
  Ticket01Icon,
} from "@hugeicons/core-free-icons";

import { Pill } from "@/components/ui/pill";
import type { SupportTier } from "@/features/campaigns/types";

/**
 * The delivery facts on a reward, shared by the catalogue, the rail, and the
 * backing flow.
 *
 * A mixed reward shows two pills rather than an invented third label, so a backer
 * can see that part of it arrives by post and part of it does not. The shipping
 * line states the destinations the creator named and their own terms, verbatim —
 * Inverge has no carrier integration, so no price is ever shown here.
 */

const fulfilmentLabel = {
  digital: "Digital",
  physical: "Physical",
} as const;

const fulfilmentIcon = {
  digital: Ticket01Icon,
  physical: Package01Icon,
} as const;

export function RewardFulfilmentLine({
  className = "",
  tier,
}: {
  className?: string;
  tier: SupportTier;
}) {
  const parts: readonly ("digital" | "physical")[] =
    tier.fulfilment === "mixed"
      ? ["digital", "physical"]
      : tier.fulfilment
        ? [tier.fulfilment]
        : [];

  if (parts.length === 0 && !tier.estimatedDelivery && !tier.shipping) {
    return null;
  }

  return (
    <div className={className}>
      {parts.length > 0 || tier.estimatedDelivery ? (
        <div className="flex flex-wrap items-center gap-2">
          {parts.map((part) => (
            <Pill
              key={part}
              size="xs"
              marker={
                <HugeiconsIcon
                  icon={fulfilmentIcon[part]}
                  size={11}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
              }
            >
              {fulfilmentLabel[part]}
            </Pill>
          ))}
          {tier.estimatedDelivery ? (
            <span className="inline-flex items-start gap-1.5 text-xs leading-5 text-muted">
              <HugeiconsIcon
                icon={Calendar03Icon}
                size={12}
                strokeWidth={1.9}
                aria-hidden="true"
                className="mt-0.5 shrink-0"
              />
              <span>Estimated delivery: {tier.estimatedDelivery}</span>
            </span>
          ) : null}
        </div>
      ) : null}

      {tier.shipping ? (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-5 text-muted">
          <HugeiconsIcon
            icon={DeliveryTruck01Icon}
            size={12}
            strokeWidth={1.9}
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          />
          <span>
            {tier.shipping.regions.length > 0
              ? `Ships to ${tier.shipping.regions.join(", ")}`
              : "Shipping destinations not stated"}
            {tier.shipping.terms ? ` · ${tier.shipping.terms}` : ""}
          </span>
        </p>
      ) : null}
    </div>
  );
}
