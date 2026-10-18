import { Container } from "@/components/ui/container";
import { StatePanel } from "@/components/ui/state-panel";
import { PreviewDataChip } from "@/features/campaigns/components/prototype-notice";
import { campaignPhaseDescriptions } from "@/features/campaigns/lib/status";
import type { Campaign } from "@/features/campaigns/types";

/**
 * Shown when a campaign exists but cannot be contributed to right now.
 *
 * The phase's own description is used verbatim, so this page and the campaign
 * itself never give two different accounts of why contributions are closed.
 */
export function CampaignUnavailable({ campaign }: { campaign: Campaign }) {
  return (
    <Container className="py-10">
      <div className="mb-4 flex justify-end">
        <PreviewDataChip />
      </div>
      <StatePanel
        variant="unavailable"
        eyebrow="Not accepting contributions"
        title={campaign.title}
        description={campaignPhaseDescriptions[campaign.phase]}
      />
    </Container>
  );
}
