import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CampaignFeaturedCarousel } from "@/features/campaigns/components/campaign-featured-carousel";
import { findPreviewCampaign } from "@/features/campaigns/content/preview-campaigns";
import type { Campaign } from "@/features/campaigns/types";

const NOW = "2026-10-19T00:00:00.000Z";

function bySlug(slug: string): Campaign {
  const campaign = findPreviewCampaign(slug);
  if (!campaign) throw new Error(`Missing preview campaign: ${slug}`);
  return campaign;
}

afterEach(cleanup);

describe("CampaignFeaturedCarousel", () => {
  it("keeps a single featured campaign as one band", () => {
    render(
      <CampaignFeaturedCarousel
        campaigns={[bySlug("sungrid-community-power")]}
        nowIso={NOW}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "SunGrid Community Power" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Featured campaigns" }),
    ).not.toBeInTheDocument();
  });

  it("moves through several featured campaigns without changing their facts", () => {
    const campaigns = [
      bySlug("sungrid-community-power"),
      bySlug("farmlink-coldbox"),
    ];

    render(<CampaignFeaturedCarousel campaigns={campaigns} nowIso={NOW} />);

    expect(
      screen.getByRole("heading", { name: "Featured campaigns" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 of 2")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Previous featured campaign" }),
    ).toBeDisabled();

    fireEvent.click(
      screen.getByRole("button", { name: "Next featured campaign" }),
    );

    expect(screen.getByText("2 of 2")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next featured campaign" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Previous featured campaign" }),
    ).toBeEnabled();

    // The slide is a group with a position label, so a screen reader can tell
    // where it is without relying on the visible counter.
    expect(screen.getByRole("group", { name: "2 of 2" })).toBeInTheDocument();
  });

  it("jumps to a featured campaign from its dot", () => {
    render(
      <CampaignFeaturedCarousel
        campaigns={[
          bySlug("sungrid-community-power"),
          bySlug("farmlink-coldbox"),
        ]}
        nowIso={NOW}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Go to featured campaign 1" }),
    );

    expect(screen.getByText("1 of 2")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Go to featured campaign 1" }),
    ).toHaveAttribute("aria-current", "true");
  });
});
