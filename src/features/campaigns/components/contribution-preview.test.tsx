import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ContributionPreview } from "@/features/campaigns/components/contribution-preview";
import { findPreviewCampaignById } from "@/features/campaigns/content/preview-campaigns";
import type { Campaign } from "@/features/campaigns/types";

afterEach(cleanup);

function sungrid(): Campaign {
  const campaign = findPreviewCampaignById("campaign-sungrid");
  if (!campaign) throw new Error("Expected the sungrid fixture");
  return campaign;
}

function renderFlow(campaign: Campaign = sungrid(), initialTierId?: string) {
  return render(
    <ContributionPreview
      campaign={campaign}
      initialTierId={initialTierId ?? null}
    />,
  );
}

function next() {
  fireEvent.click(screen.getByRole("button", { name: /^Continue/ }));
}

function acceptTerms() {
  fireEvent.click(screen.getByRole("checkbox"));
  next();
}

describe("ContributionPreview reward step", () => {
  it("offers the campaign's rewards alongside a way to contribute without one", () => {
    renderFlow();

    expect(
      screen.getByRole("radio", { name: /Lantern kit/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: /Contribute without a reward/ }),
    ).toBeInTheDocument();
  });

  it("preselects a reward that the campaign page passed in", () => {
    renderFlow(sungrid(), "sungrid-tier-lantern");

    expect(screen.getByRole("radio", { name: /Lantern kit/ })).toBeChecked();
    expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
  });

  it("ignores a reward id the campaign does not publish", () => {
    renderFlow(sungrid(), "not-a-tier");

    expect(
      screen.getByRole("radio", { name: /Contribute without a reward/ }),
    ).toBeChecked();
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
  });

  it("requires an amount when no reward is chosen", () => {
    renderFlow();
    next();

    expect(
      screen.getByText("Enter an amount to continue."),
    ).toBeInTheDocument();
  });

  it("carries a free amount through to the payment step", () => {
    renderFlow();
    fireEvent.change(screen.getByLabelText("Amount in USDC"), {
      target: { value: "25" },
    });
    next();

    expect(
      screen.getByRole("heading", { name: "How you'll pay" }),
    ).toBeInTheDocument();
  });

  it("adds optional support on top of a reward and shows the new total", () => {
    renderFlow();
    fireEvent.click(screen.getByRole("radio", { name: /Community supporter/ }));
    fireEvent.change(screen.getByLabelText("Additional support (optional)"), {
      target: { value: "15" },
    });

    expect(screen.getAllByText("$25").length).toBeGreaterThan(0);
  });

  it("reports an unreadable extra under its own field", () => {
    renderFlow();
    fireEvent.click(screen.getByRole("radio", { name: /Community supporter/ }));
    fireEvent.change(screen.getByLabelText("Additional support (optional)"), {
      target: { value: "abc" },
    });
    next();

    expect(screen.getByText(/at most two decimals/)).toBeInTheDocument();
  });
});

describe("ContributionPreview delivery step", () => {
  it("adds no delivery step for a reward that only exists online", () => {
    renderFlow();
    fireEvent.click(screen.getByRole("radio", { name: /Community supporter/ }));

    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();

    next();

    expect(
      screen.getByRole("heading", { name: "How you'll pay" }),
    ).toBeInTheDocument();
  });

  it("lists only the destinations the creator named for a posted reward", () => {
    renderFlow();
    fireEvent.click(screen.getByRole("radio", { name: /Lantern kit/ }));

    expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();

    next();

    expect(
      screen.getByRole("heading", { name: "Delivery" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Nigeria" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Ghana" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Kenya" })).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "Brazil" })).toBeNull();
  });

  it("will not continue from delivery until a destination is chosen", () => {
    renderFlow();
    fireEvent.click(screen.getByRole("radio", { name: /Lantern kit/ }));
    next();
    next();

    expect(
      screen.getByText("Choose where this reward should be sent."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Delivery" }),
    ).toBeInTheDocument();
  });

  it("states the creator's own terms and never a postage price", () => {
    renderFlow();
    fireEvent.click(screen.getByRole("radio", { name: /Lantern kit/ }));
    next();

    expect(
      screen.getAllByText(/Any import duty is the backer's/).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/quotes no postage/)).toBeInTheDocument();
  });
});

describe("ContributionPreview settlement step", () => {
  it("shows the naira route as blocked with its reason rather than hiding it", () => {
    const campaign = sungrid();
    renderFlow({
      ...campaign,
      funding: {
        ...campaign.funding,
        supportedSettlementAssets: ["USDC", "cNGN"],
      },
    });
    fireEvent.change(screen.getByLabelText("Amount in USDC"), {
      target: { value: "25" },
    });
    next();

    expect(
      screen.getByRole("radio", { name: /Naira card or bank transfer/ }),
    ).toBeDisabled();
    expect(screen.getByText(/needs a live exchange quote/)).toBeInTheDocument();
  });
});

describe("ContributionPreview review and handoff", () => {
  it("shows the reward and says shipping is not quoted, with no figure for it", () => {
    renderFlow();
    fireEvent.click(screen.getByRole("radio", { name: /Lantern kit/ }));
    next();
    fireEvent.click(screen.getByRole("radio", { name: "Nigeria" }));
    next();
    next();
    acceptTerms();

    expect(screen.getByRole("heading", { name: "Review" })).toBeInTheDocument();
    expect(screen.getAllByText("Lantern kit").length).toBeGreaterThan(0);
    expect(screen.getByText("Not quoted by Inverge")).toBeInTheDocument();
    expect(screen.getAllByText("Nigeria").length).toBeGreaterThan(0);
  });

  it("will not leave the review until the preview is acknowledged", () => {
    renderFlow();
    fireEvent.click(screen.getByRole("radio", { name: /Community supporter/ }));
    next();
    next();
    acceptTerms();

    next();

    expect(
      screen.getByText(/Confirm you understand this is a preview/),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Review" })).toBeInTheDocument();
  });

  it("ends on an unconnected-payment state instead of confirming a contribution", () => {
    renderFlow();
    fireEvent.click(screen.getByRole("radio", { name: /Community supporter/ }));
    next();
    next();
    acceptTerms();
    fireEvent.click(screen.getByRole("checkbox"));
    next();

    expect(
      screen.getByRole("heading", {
        name: "Payment is not connected in this build",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no transaction was\s+created/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /confirmed/i })).toBeNull();
  });
});
