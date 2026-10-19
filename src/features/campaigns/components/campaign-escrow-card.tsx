import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Shield01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { RailCard } from "@/features/campaigns/components/campaign-rail-card";
import { campaignTabHref } from "@/features/campaigns/lib/campaign-tabs";
import { escrowSummary } from "@/features/campaigns/lib/escrow";
import type { Campaign } from "@/features/campaigns/types";

/**
 * How escrow works, in one paragraph.
 *
 * The sentence is derived from the campaign's own published terms rather than
 * written here, so this card and the escrow section behind the Campaign facts
 * tab cannot describe the same rules differently. The link switches tabs rather
 * than scrolling: the detail of the terms is on that tab, and an anchor to a
 * section that is not rendered would do nothing.
 *
 * It says what the escrow does and where the detail is. It does not tell anyone
 * their money is safe, because nobody can promise that.
 */
export function CampaignEscrowCard({ campaign }: { campaign: Campaign }) {
  return (
    <RailCard
      icon={Shield01Icon}
      id="escrow"
      title="How escrow works"
      tone="brand"
    >
      <p className="text-xs leading-6 text-muted">{escrowSummary(campaign)}</p>

      <Link
        className="mt-3 inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        href={campaignTabHref(campaign.slug, "facts")}
      >
        Release, objection, and refund terms
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={15}
          strokeWidth={1.9}
          aria-hidden="true"
        />
      </Link>
    </RailCard>
  );
}
