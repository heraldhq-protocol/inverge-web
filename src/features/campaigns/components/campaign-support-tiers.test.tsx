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
  it("shows the creator's destinations on a posted reward and none on a digital one", () => {
    render(
      <CampaignSupportTiers campaign={campaignById("campaign-sungrid")} />,
    );

    expect(
      screen.getAllByText(/Ships to Nigeria, Ghana, Kenya/).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Digital").length).toBeGreaterThan(0);
  });

  it("says it quotes no postage once any reward ships", () => {
    render(
      <CampaignSupportTiers campaign={campaignById("campaign-sungrid")} />,
    );

    expect(screen.getByText(/quotes no postage/)).toBeInTheDocument();
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
      screen.getAllByText(/Ships to Nigeria, Ghana, Kenya/).length,
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
