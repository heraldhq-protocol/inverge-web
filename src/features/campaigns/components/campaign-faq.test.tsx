import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CampaignFaq } from "@/features/campaigns/components/campaign-faq";
import { findPreviewCampaignById } from "@/features/campaigns/content/preview-campaigns";
import type { Campaign } from "@/features/campaigns/types";

afterEach(cleanup);

function campaignById(id: string): Campaign {
  const campaign = findPreviewCampaignById(id);
  if (!campaign) throw new Error(`Expected the ${id} fixture`);
  return campaign;
}

describe("CampaignFaq", () => {
  it("answers each published question in a collapsible disclosure", () => {
    const campaign = campaignById("campaign-sungrid");
    const [firstFaq] = campaign.faqs;
    expect(firstFaq).toBeDefined();

    render(<CampaignFaq campaign={campaign} />);

    expect(screen.getByText(firstFaq!.question)).toBeInTheDocument();
    expect(screen.getByText(firstFaq!.answer)).toBeInTheDocument();
  });

  it("says the creator published nothing rather than showing an empty list", () => {
    const campaign = campaignById("campaign-sungrid");

    render(<CampaignFaq campaign={{ ...campaign, faqs: [] }} />);

    expect(
      screen.getByText(/has not published any questions|no questions/i),
    ).toBeInTheDocument();
  });

  it("carries the same questions into the rail", () => {
    const campaign = campaignById("campaign-sungrid");
    const [firstFaq] = campaign.faqs;

    render(<CampaignFaq campaign={campaign} variant="rail" />);

    expect(screen.getByRole("heading", { name: "FAQs" })).toBeInTheDocument();
    expect(screen.getByText(firstFaq!.question)).toBeInTheDocument();
  });
});
