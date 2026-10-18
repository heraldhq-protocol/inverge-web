import { HugeiconsIcon } from "@hugeicons/react";
import { Award01Icon, HeartHandshakeIcon } from "@hugeicons/core-free-icons";

import { Amount } from "@/components/ui/amount";
import type { Campaign } from "@/features/campaigns/types";

/**
 * Reward tiers, or the honest statement that there are none.
 *
 * A campaign without tiers is a donation, and the page says so rather than
 * showing an empty box. A tier changes what the creator promises to send; it
 * never changes what is charged, and no contribution is ever refused for being
 * below a tier's minimum (the tier is simply not selected).
 */
export function CampaignSupportTiers({ campaign }: { campaign: Campaign }) {
  if (campaign.supportTiers.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-canvas p-5">
        <span className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand-strong">
          <HugeiconsIcon
            icon={HeartHandshakeIcon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <p className="mt-3 text-sm font-semibold text-ink">
          This is a donation-based campaign
        </p>
        <p className="mt-1.5 text-sm leading-6 text-muted">
          There are no reward tiers. You contribute an amount of your choosing,
          and the creator&apos;s obligation is the published milestone plan —
          not a product in return.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {campaign.supportTiers.map((tier) => (
        <li
          key={tier.id}
          className="flex flex-col rounded-2xl border border-border bg-surface p-4"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand-strong">
            <HugeiconsIcon
              icon={Award01Icon}
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
          <h3 className="mt-3 text-sm font-semibold text-ink">{tier.title}</h3>
          <p className="mt-1 text-xs font-medium text-muted">
            From <Amount value={tier.minimum} className="text-ink" />
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {tier.description}
          </p>
        </li>
      ))}
    </ul>
  );
}
