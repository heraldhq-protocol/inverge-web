"use client";

import { CampaignsError as CampaignsErrorState } from "@/features/campaigns/components/campaigns-error";

export default function CampaignsErrorRoute({ reset }: { reset: () => void }) {
  return <CampaignsErrorState reset={reset} />;
}
