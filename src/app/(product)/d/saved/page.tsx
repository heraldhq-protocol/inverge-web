import type { Metadata } from "next";

import { SavedCampaignsDashboard } from "@/features/campaigns/components/saved-campaigns-dashboard";
import { getSavedCampaignsView } from "@/features/campaigns/server/saved";

export const metadata: Metadata = {
  description:
    "Campaigns you saved to decide on later, with their live funding state.",
  robots: { follow: false, index: false },
  title: "Saved campaigns",
};

/**
 * The saved-campaigns collection (D-022).
 *
 * Saved ids live in the viewer's browser, so the server cannot resolve them and
 * does not pretend to: it passes the public campaign set and the client
 * intersects it with the saved ids. Everything then flows through one component,
 * so the detail page's save control and this list can never disagree about what
 * a save means.
 */
export default function SavedCampaignsPage() {
  const view = getSavedCampaignsView();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <SavedCampaignsDashboard
        candidates={view.candidates}
        nowIso={view.now}
      />
    </div>
  );
}
