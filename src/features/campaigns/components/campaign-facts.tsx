import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";

import type { Campaign } from "@/features/campaigns/types";

/**
 * Campaign facts.
 *
 * Short, non-numeric claims a reader checks at a glance. Anything with a figure
 * (target, tranches, deadline) is rendered from the record elsewhere, so a fact
 * cannot drift from the data it describes.
 */
export function CampaignFacts({ campaign }: { campaign: Campaign }) {
  if (campaign.facts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-canvas p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <HugeiconsIcon
          icon={InformationCircleIcon}
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
          className="text-muted"
        />
        <h2 className="text-sm font-semibold text-ink">Campaign facts</h2>
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {campaign.facts.map((fact) => (
          <div key={fact.label} className="min-w-0">
            <dt className="text-xs text-muted">{fact.label}</dt>
            <dd className="mt-0.5 text-sm font-medium text-ink">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
