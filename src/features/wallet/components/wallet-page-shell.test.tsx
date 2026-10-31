import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { WalletPageShell } from "@/features/wallet/components/wallet-page-shell";

afterEach(cleanup);

describe("WalletPageShell", () => {
  it("keeps the wallet to three primary destinations", () => {
    render(
      <WalletPageShell active="overview" description="Your wallet.">
        <p>Content</p>
      </WalletPageShell>,
    );

    const nav = screen.getByRole("navigation", { name: "Wallet sections" });
    const links = within(nav).getAllByRole("link");

    expect(links.map((link) => link.textContent)).toEqual([
      "Overview",
      "Activity",
      "Refunds",
    ]);
    expect(within(nav).queryByText("Send")).toBeNull();
    expect(within(nav).queryByText("Receive")).toBeNull();
    expect(within(nav).queryByText("Security")).toBeNull();
  });

  it("marks the current destination without hiding the others", () => {
    render(
      <WalletPageShell active="refunds" description="Refunds." title="Refunds">
        <p>Content</p>
      </WalletPageShell>,
    );

    expect(screen.getByRole("link", { name: "Refunds" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("keeps the page introduction short and free of provider diagnostics", () => {
    render(
      <WalletPageShell
        active="overview"
        description="Your wallet for backing ideas and tracking contributions."
      >
        <p>Content</p>
      </WalletPageShell>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Wallet" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your wallet for backing ideas and tracking contributions.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/SDK/)).toBeNull();
    expect(screen.queryByText(/provision/i)).toBeNull();
  });
});
