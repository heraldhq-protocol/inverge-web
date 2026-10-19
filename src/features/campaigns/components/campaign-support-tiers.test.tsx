import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CampaignSupportTiers } from "@/features/campaigns/components/campaign-support-tiers";
import { findPreviewCampaignById } from "@/features/campaigns/content/preview-campaigns";
import type { Campaign } from "@/features/campaigns/types";

afterEach(cleanup);

function campaignById(id: string): Campaign {
  const campaign = findPreviewCampaignById(id);
  if (!campaign) throw new Error(`Expected the ${id} fixture`);
  return campaign;
}

describe("CampaignSupportTiers catalogue", () => {
  it("names each posted reward's destinations and the creator's own rate for them", () => {
    render(
      <CampaignSupportTiers campaign={campaignById("campaign-sungrid")} />,
    );

    expect(
      screen.getAllByText(/Ships to: Inside Nigeria — \$8 per order/).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Ships to: Nigeria — free/).length,
    ).toBeGreaterThan(0);
  });

  it("shows no shipping line at all on a reward that posts nothing", () => {
    render(
      <CampaignSupportTiers campaign={campaignById("campaign-sungrid")} />,
    );

    // Two of the four rewards are posted; the two digital ones carry no
    // destination, no rate, and no postal wording.
    expect(screen.getAllByText(/Ships to:/)).toHaveLength(2);
  });

  it("shows what each reward includes, and what it still asks the backer to choose", () => {
    render(
      <CampaignSupportTiers campaign={campaignById("campaign-sungrid")} />,
    );

    expect(
      screen.getByText(/A printed assembly and care card/),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/3 add-ons available/).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText(/Up to 4 per backer/).length).toBeGreaterThan(0);
  });

  it("shows the creator's own reward artwork where they supplied it", () => {
    render(
      <CampaignSupportTiers campaign={campaignById("campaign-sungrid")} />,
    );

    expect(
      screen.getAllByRole("img", { name: "Lantern kit reward" }).length,
    ).toBeGreaterThan(0);
  });

  it("attributes every postage figure to the creator rather than to Inverge", () => {
    render(
      <CampaignSupportTiers campaign={campaignById("campaign-sungrid")} />,
    );

    expect(
      screen.getByText(/Postage figures are the creator's own declared rates/),
    ).toBeInTheDocument();
  });

  it("links each reward into the backing flow with that reward chosen", () => {
    render(
      <CampaignSupportTiers campaign={campaignById("campaign-sungrid")} />,
    );

    expect(
      screen
        .getAllByRole("link", {
          name: /Select the Lantern kit reward when backing/,
        })
        .at(0),
    ).toHaveAttribute(
      "href",
      "/campaigns/sungrid-community-power/back?tier=sungrid-tier-lantern",
    );
  });

  it("describes a donation-based campaign as having no reward to select", () => {
    render(
      <CampaignSupportTiers
        campaign={campaignById("campaign-harmattan-kiosks")}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Donation-based" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Physical")).toBeNull();
    expect(screen.queryByText(/Ships to:/)).toBeNull();
  });
});

describe("CampaignSupportTiers rail", () => {
  it("carries the same delivery facts into the supporting column", () => {
    render(
      <CampaignSupportTiers
        campaign={campaignById("campaign-sungrid")}
        variant="rail"
      />,
    );

    expect(
      screen.getAllByText(/Ships to: Inside Nigeria — \$8 per order/).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: "Optional rewards" }),
    ).toBeInTheDocument();
  });

  it("labels a donation-based campaign as such in the rail", () => {
    render(
      <CampaignSupportTiers
        campaign={campaignById("campaign-harmattan-kiosks")}
        variant="rail"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Donation-based" }),
    ).toBeInTheDocument();
  });
});
