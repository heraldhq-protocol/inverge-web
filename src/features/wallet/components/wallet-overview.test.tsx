import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { WalletOverview } from "@/features/wallet/components/wallet-overview";
import { createPreviewWalletView } from "@/features/wallet/content/preview-wallet";

afterEach(cleanup);

/**
 * The overview is deliberately short. These assertions cover the three things
 * it must keep honest: no fabricated balance, preview activity labelled as an
 * example, and no action for a capability that is not connected.
 */
function renderOverview() {
  return render(
    <WalletOverview authenticated view={createPreviewWalletView()} />,
  );
}

describe("WalletOverview", () => {
  it("does not present a sample balance as real money", () => {
    renderOverview();

    expect(screen.queryByText("Sample balance")).toBeNull();
    expect(screen.queryByText("1,250.5")).toBeNull();
    expect(screen.queryByText("0.42")).toBeNull();
  });

  it("labels preview activity as example data", () => {
    renderOverview();

    expect(
      screen.getByRole("heading", { name: "Recent activity" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Example data")).toBeInTheDocument();
    expect(
      screen.getByText(/Sample contributions and refunds/),
    ).toBeInTheDocument();
  });

  it("offers only actions this build actually supports", () => {
    renderOverview();

    const actions = screen.getByRole("complementary", {
      name: "Quick actions",
    });

    expect(
      within(actions).getByRole("link", { name: /Back a campaign/ }),
    ).toHaveAttribute("href", "/campaigns");
    expect(
      within(actions).getByRole("link", { name: /View activity/ }),
    ).toHaveAttribute("href", "/d/wallet/activity");
    expect(
      within(actions).getByRole("link", { name: /Refunds/ }),
    ).toHaveAttribute("href", "/d/wallet/refunds");
    expect(within(actions).queryByText(/Send/)).toBeNull();
    expect(within(actions).queryByText(/Receive/)).toBeNull();
    expect(within(actions).queryByText(/Add funds/)).toBeNull();
  });

  it("keeps security reachable without making it a primary wallet tab", () => {
    renderOverview();

    expect(
      screen.getByRole("link", { name: "Wallet security" }),
    ).toHaveAttribute("href", "/d/wallet/security");
  });

  it("does not repeat the capability audit on the overview", () => {
    renderOverview();

    expect(screen.queryByText("Connected capabilities")).toBeNull();
    expect(screen.queryByText("What is real here")).toBeNull();
    expect(screen.queryByText("Not available")).toBeNull();
  });

  it("shows a calm empty state when there is no activity", () => {
    const view = { ...createPreviewWalletView(), activity: [] };

    render(<WalletOverview authenticated view={view} />);

    expect(screen.getByText("No activity yet")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Explore campaigns/ }),
    ).toHaveAttribute("href", "/campaigns");
  });
});
