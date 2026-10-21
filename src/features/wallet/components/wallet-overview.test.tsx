import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { WalletOverview } from "@/features/wallet/components/wallet-overview";
import { createPreviewWalletView } from "@/features/wallet/content/preview-wallet";

afterEach(cleanup);

/**
 * The overview has to be honest about what is not there. These assertions are
 * mostly about absences: no address, no claim control, no connected capability.
 */
function renderOverview() {
  return render(<WalletOverview view={createPreviewWalletView()} />);
}

describe("WalletOverview account", () => {
  it("names the provider and network without inventing an address", () => {
    renderOverview();

    expect(screen.getByText("MetaMask Embedded Wallets")).toBeInTheDocument();
    expect(screen.getByText("Solana devnet")).toBeInTheDocument();
    expect(screen.getByText("No address linked yet")).toBeInTheDocument();
    expect(screen.getAllByText("Not provisioned").length).toBeGreaterThan(0);
    expect(
      screen.getByText(/This build does not invent an address/),
    ).toBeInTheDocument();
  });

  it("surfaces the records that need attention with a link to them", () => {
    renderOverview();

    expect(
      screen.getByText("4 wallet records need your attention."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review them" })).toHaveAttribute(
      "href",
      "/d/wallet/activity?filter=attention",
    );
  });
});

describe("WalletOverview sign-in", () => {
  it("shows the wallet sign-in boundary", () => {
    renderOverview();

    expect(
      screen.getByRole("heading", { name: "Your account" }),
    ).toBeInTheDocument();
  });
});

describe("WalletOverview balances and refunds", () => {
  it("labels both balances as samples rather than a chain read", () => {
    renderOverview();

    expect(screen.getAllByText("Sample balance")).toHaveLength(2);
    expect(screen.getByText("1,250.5")).toBeInTheDocument();
    expect(screen.getByText("0.42")).toBeInTheDocument();
  });

  it("shows refund totals as derived figures, not as money that moved", () => {
    renderOverview();

    expect(screen.getByText("$5,000")).toBeInTheDocument();
    expect(screen.getByText("$2,500")).toBeInTheDocument();
    expect(
      screen.getByText(/Refund eligibility is a campaign outcome/),
    ).toBeInTheDocument();
  });
});

describe("WalletOverview capabilities", () => {
  it("marks only the derived surfaces as preview and the rest unavailable", () => {
    renderOverview();

    expect(screen.getAllByText("Preview only")).toHaveLength(2);
    expect(screen.getAllByText("Not available")).toHaveLength(7);
    expect(
      screen.getByText(/No embedded-wallet provider is configured/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/never reads, stores, or displays a private key/),
    ).toBeInTheDocument();
  });

  it("offers no control that claims money can be claimed or sent", () => {
    renderOverview();

    expect(screen.queryByRole("button", { name: /claim/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /withdraw/i })).toBeNull();
  });
});
