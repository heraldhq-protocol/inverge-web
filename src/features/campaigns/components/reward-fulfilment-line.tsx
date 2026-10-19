import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  DeliveryTruck01Icon,
  Package01Icon,
  Ticket01Icon,
} from "@hugeicons/core-free-icons";

import { Pill } from "@/components/ui/pill";
import { shippingSummary } from "@/features/campaigns/lib/shipping";
import type { SupportTier } from "@/features/campaigns/types";

/**
 * The delivery facts on a reward, shared by the catalogue, the rail, and the
 * backing flow.
 *
 * A mixed reward shows two pills rather than an invented third label, so a backer
 * can see that part of it arrives by post and part of it does not. The shipping
 * line states the creator's own rules — the destinations they named and the price
 * they set for each — and never a price for the reader, who has not chosen a
 * destination yet. Postage the creator defers is shown as deferred, and a
 * destination they refuse is shown as refused, rather than being left out of the
 * list and quietly looking like a gap in the policy.
 *
 * The creator's own terms and duty wording are deliberately not here: they are
 * long, and they belong on the step where the backer is deciding whether to
 * continue, not on every card that mentions the reward. The backing flow renders
 * them in full.
 */

/** Rules shown in the summary before the rest are counted. */
const SHOWN_RULES = 2;

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

  const coverage = tier.shipping ? shippingSummary(tier.shipping) : [];
  const shown = coverage.slice(0, SHOWN_RULES);
  const remaining = coverage.length - shown.length;
  const excluded = coverage
    .filter((entry) => entry.excluded)
    .map((entry) => entry.coverage);

  const options: string[] = [];

  if (tier.variants.length > 0) {
    options.push(
      `Choose ${tier.variants.map((group) => group.label).join(", ")}`,
    );
  }

  if (tier.addOns.length > 0) {
    options.push(
      tier.addOns.length === 1
        ? "1 add-on available"
        : `${tier.addOns.length} add-ons available`,
    );
  }

  if (tier.quantityLimit !== null && tier.quantityLimit > 1) {
    options.push(`Up to ${tier.quantityLimit} per backer`);
  }

  if (
    parts.length === 0 &&
    !tier.estimatedDelivery &&
    coverage.length === 0 &&
    options.length === 0
  ) {
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

      {coverage.length > 0 ? (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-5 text-muted">
          <HugeiconsIcon
            icon={DeliveryTruck01Icon}
            size={12}
            strokeWidth={1.9}
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          />
          <span>
            Ships to:{" "}
            {shown
              .map((entry) => `${entry.coverage} — ${entry.rate.toLowerCase()}`)
              .join(", ")}
            {remaining > 0 ? `, and ${remaining} more` : ""}
            {excluded.length > 0 ? ` · ${excluded.join(", ")} excluded` : ""}
          </span>
        </p>
      ) : null}

      {options.length > 0 ? (
        <p className="mt-1 text-xs leading-5 text-muted">
          {options.join(" · ")}
        </p>
      ) : null}
    </div>
  );
}
