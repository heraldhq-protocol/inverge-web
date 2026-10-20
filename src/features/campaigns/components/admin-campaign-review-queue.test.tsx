import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AdminCampaignReviewQueue } from "@/features/campaigns/components/admin-campaign-review-queue";
import {
  findPreviewCampaignById,
  previewCampaigns,
} from "@/features/campaigns/content/preview-campaigns";
import type { Campaign } from "@/features/campaigns/types";

function fixture(id: string): Campaign {
  const campaign = findPreviewCampaignById(id);
  if (!campaign) throw new Error(`Expected the ${id} fixture`);
  return campaign;
}

afterEach(cleanup);

describe("AdminCampaignReviewQueue", () => {
  it("states the preview boundary before showing any campaign", () => {
    render(<AdminCampaignReviewQueue initialCampaigns={previewCampaigns} />);

    expect(
      screen.getByText("Decisions recorded here stay in this browser"),
    ).toBeDefined();
    expect(screen.getByText(/not a production state change/)).toBeDefined();
  });

  it("groups submitted campaigns by review state and links each row to its review", () => {
    render(<AdminCampaignReviewQueue initialCampaigns={previewCampaigns} />);

    const awaiting = screen.getByRole("region", { name: "Awaiting review" });
    expect(
      within(awaiting)
        .getByRole("link", { name: /NaijaCraft Marketplace/ })
        .getAttribute("href"),
    ).toBe("/admin/campaigns/campaign-naija-craft");
    expect(within(awaiting).queryByText(/Green Miles/)).toBeNull();

    const changes = screen.getByRole("region", { name: "Changes requested" });
    expect(
      within(changes)
        .getByRole("link", { name: /Green Miles Cold Logistics/ })
        .getAttribute("href"),
    ).toBe("/admin/campaigns/campaign-green-miles");
    expect(within(changes).getByText(/Reviewer note:/)).toBeDefined();

    const decided = screen.getByRole("region", { name: "Decided" });
    expect(
      within(decided).getByText(
        "No campaign has an approval or rejection yet.",
      ),
    ).toBeDefined();
  });

  it("marks a row awaiting on its creator as a view rather than an action", () => {
    render(<AdminCampaignReviewQueue initialCampaigns={previewCampaigns} />);

    const changes = screen.getByRole("region", { name: "Changes requested" });
    expect(within(changes).getByText("View decision")).toBeDefined();

    const awaiting = screen.getByRole("region", { name: "Awaiting review" });
    expect(within(awaiting).getByText("Review campaign")).toBeDefined();
  });

  it("says plainly when nothing has been submitted for review", () => {
    render(
      <AdminCampaignReviewQueue
        initialCampaigns={[fixture("campaign-sungrid")]}
      />,
    );

    expect(
      screen.getByText(
        "No campaign has been submitted for review in this preview.",
      ),
    ).toBeDefined();
    expect(
      screen.getByText("Nothing is waiting for a review decision."),
    ).toBeDefined();
    expect(
      screen.getByText("No campaign is waiting on its creator."),
    ).toBeDefined();
  });
});
