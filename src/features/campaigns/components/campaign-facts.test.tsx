import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  CampaignFacts,
  CampaignFactsTab,
} from "@/features/campaigns/components/campaign-facts";
import { findPreviewCampaignById } from "@/features/campaigns/content/preview-campaigns";
import type { Campaign } from "@/features/campaigns/types";

afterEach(cleanup);

function campaignById(id: string): Campaign {
  const campaign = findPreviewCampaignById(id);
  if (!campaign) throw new Error(`Expected the ${id} fixture`);
  return campaign;
}

describe("CampaignFacts", () => {
  it("renders nothing for a campaign that published no facts", () => {
    const campaign = campaignById("campaign-sungrid");
    const { container } = render(
      <CampaignFacts campaign={{ ...campaign, facts: [] }} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("lists each published fact and names the creator", () => {
    const campaign = campaignById("campaign-sungrid");
    render(<CampaignFacts campaign={campaign} />);

    const [firstFact] = campaign.facts;
    expect(firstFact).toBeDefined();
    expect(screen.getByText(firstFact!.label)).toBeInTheDocument();
    expect(screen.getByText(firstFact!.value)).toBeInTheDocument();
    expect(screen.getByText(campaign.creator.name)).toBeInTheDocument();
  });

  it("uses one heading in the rail and one on the facts tab", () => {
    const campaign = campaignById("campaign-sungrid");

    const rail = render(<CampaignFacts campaign={campaign} />);
    expect(
      screen.getByRole("heading", { name: "Campaign facts" }),
    ).toBeInTheDocument();
    rail.unmount();

    render(<CampaignFactsTab campaign={campaign} />);
    expect(
      screen.getAllByRole("heading", { name: "Campaign facts" }).length,
    ).toBeGreaterThan(0);
  });
});

describe("CampaignFactsTab", () => {
  it("publishes the budget, the escrow rules and the disclosures", () => {
    render(<CampaignFactsTab campaign={campaignById("campaign-sungrid")} />);

    expect(
      screen.getByRole("heading", { name: "How your contribution is used" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Escrow and release terms" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Before you contribute" }),
    ).toBeInTheDocument();
  });
});
