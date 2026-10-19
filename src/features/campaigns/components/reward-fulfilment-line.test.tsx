import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { RewardFulfilmentLine } from "@/features/campaigns/components/reward-fulfilment-line";
import { findPreviewCampaignById } from "@/features/campaigns/content/preview-campaigns";
import type { SupportTier } from "@/features/campaigns/types";

afterEach(cleanup);

function tier(id: string): SupportTier {
  const campaign = findPreviewCampaignById("campaign-sungrid");
  const found = campaign?.supportTiers.find((option) => option.id === id);
  if (!found) throw new Error(`Expected the ${id} fixture`);
  return found;
}

describe("RewardFulfilmentLine", () => {
  it("shows a single pill for a reward that is only digital", () => {
    render(<RewardFulfilmentLine tier={tier("sungrid-tier-community")} />);

    expect(screen.getByText("Digital")).toBeInTheDocument();
    expect(screen.queryByText("Physical")).toBeNull();
  });

  it("shows both pills for a mixed reward, rather than inventing a label", () => {
    render(<RewardFulfilmentLine tier={tier("sungrid-tier-site")} />);

    expect(screen.getByText("Digital")).toBeInTheDocument();
    expect(screen.getByText("Physical")).toBeInTheDocument();
  });

  it("states the destinations and the creator's own terms, with no price", () => {
    const { container } = render(
      <RewardFulfilmentLine tier={tier("sungrid-tier-lantern")} />,
    );

    expect(
      screen.getByText(/Ships to Nigeria, Ghana, Kenya/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Posted by courier from Lagos/),
    ).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\$/);
  });

  it("renders nothing when a reward carries no delivery facts at all", () => {
    const { container } = render(
      <RewardFulfilmentLine
        tier={{
          description: "",
          estimatedDelivery: null,
          fulfilment: null,
          id: "bare",
          image: null,
          minimum: { atomic: "1000", currency: "USD", decimals: 2 },
          shipping: null,
          title: "Bare",
        }}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
