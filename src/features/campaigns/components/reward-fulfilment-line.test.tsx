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

  it("names the destinations the creator wrote, in their own order", () => {
    render(<RewardFulfilmentLine tier={tier("sungrid-tier-lantern")} />);

    expect(
      screen.getByText(/Inside Nigeria — \$8 per order/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/West Africa — \$15 per order/),
    ).toBeInTheDocument();
    expect(screen.getByText(/and 4 more/)).toBeInTheDocument();
    expect(screen.getByText(/Brazil excluded/)).toBeInTheDocument();
  });

  it("states only the prices the creator published, and no total for the reader", () => {
    const { container } = render(
      <RewardFulfilmentLine tier={tier("sungrid-tier-lantern")} />,
    );

    // $8 and $15 are the two per-order rates the summary shows. Europe's $22 and
    // North America's $24 are beyond the shown rules, and nothing here sums them:
    // the reader has not chosen a destination, so there is no total to state.
    const figures = container.textContent?.match(/\$[\d,]+(?:\.\d{2})?/g) ?? [];

    expect(figures).toEqual(["$8", "$15"]);
  });

  it("says what the reward still needs answering without pricing the choices", () => {
    render(<RewardFulfilmentLine tier={tier("sungrid-tier-lantern")} />);

    expect(screen.getByText(/Choose Lantern colour, Plug/)).toBeInTheDocument();
    expect(screen.getByText(/3 add-ons available/)).toBeInTheDocument();
    expect(screen.getByText(/Up to 4 per backer/)).toBeInTheDocument();
  });

  it("shows no shipping line for a reward that posts nothing", () => {
    const { container } = render(
      <RewardFulfilmentLine tier={tier("sungrid-tier-community")} />,
    );

    expect(container.textContent).not.toContain("Ships to");
  });

  it("renders nothing when a reward carries no delivery facts at all", () => {
    const { container } = render(
      <RewardFulfilmentLine
        tier={{
          addOns: [],
          description: "",
          estimatedDelivery: null,
          fulfilment: null,
          id: "bare",
          image: null,
          includes: [],
          minimum: { atomic: "1000", currency: "USD", decimals: 2 },
          quantityLimit: null,
          shipping: null,
          title: "Bare",
          variants: [],
        }}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
