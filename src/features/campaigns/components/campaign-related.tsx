import { CampaignCard } from "@/features/campaigns/components/campaign-card";
import { recommendationReason } from "@/features/campaigns/lib/recommendations";
import type { Campaign } from "@/features/campaigns/types";

/**
 * Other campaigns related to the one being viewed.
 *
 * The recommendation is a plain taxonomy match with a stated reason, not an
 * opaque ranking — if a rival is "featured" or "ending soon", a reader can see
 * which campaigns those are elsewhere on the page rather than wondering why an
 * unrelated campaign was surfaced here.
 */
export function CampaignRelated({
  campaigns,
  nowIso,
  source,
}: {
  campaigns: readonly Campaign[];
  nowIso: string;
  source: Campaign;
}) {
  if (campaigns.length === 0) return null;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {campaigns.map((campaign) => (
        <li key={campaign.id} className="h-full">
          <CampaignCard
            campaign={campaign}
            nowIso={nowIso}
            recommendationReason={recommendationReason(source, campaign)}
          />
        </li>
      ))}
    </ul>
  );
}
