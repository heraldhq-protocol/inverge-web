import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { WalletActivityDashboard } from "@/features/wallet/components/wallet-activity-dashboard";
import { createPreviewWalletView } from "@/features/wallet/content/preview-wallet";

afterEach(cleanup);

function renderDashboard({
  filter = "all" as const,
  query = "",
}: {
  filter?: "all" | "contributions" | "refunds" | "pending" | "attention";
  query?: string;
} = {}) {
  return render(
    <WalletActivityDashboard
      filter={filter}
      query={query}
      view={createPreviewWalletView()}
    />,
  );
}

function contributionLinks(container: HTMLElement) {
  return container.querySelectorAll('a[href^="/d/backing/"]');
}

describe("WalletActivityDashboard overview", () => {
  it("counts the unified history and names no fabricated deposit", () => {
    renderDashboard();

    expect(screen.getByText("15 records")).toBeInTheDocument();
    expect(
      screen.getByText(/No deposit or withdrawal is fabricated/),
    ).toBeInTheDocument();
    expect(screen.getByText("15 records match")).toBeInTheDocument();
  });

  it("shows each filter with its own count and a shareable link", () => {
    renderDashboard();

    expect(screen.getByRole("link", { name: /All activity/ })).toHaveAttribute(
      "href",
      "/d/wallet/activity",
    );
    expect(
      screen.getByRole("link", { name: /Needs attention/ }),
    ).toHaveAttribute("href", "/d/wallet/activity?filter=attention");
    expect(screen.getByRole("link", { name: /Refunds/ })).toHaveAttribute(
      "href",
      "/d/wallet/activity?filter=refunds",
    );
  });
});

describe("WalletActivityDashboard filtering", () => {
  it("keeps only refund rows under the refund filter", () => {
    const { container } = renderDashboard({ filter: "refunds" });

    expect(
      screen.getByText("2 records match the current filter"),
    ).toBeInTheDocument();
    expect(contributionLinks(container)).toHaveLength(2);
    expect(screen.queryByText(/Contribution to/)).toBeNull();
  });

  it("searches by campaign without widening the kind filter", () => {
    const { container } = renderDashboard({ filter: "all", query: "sungrid" });

    expect(
      screen.getByText("2 records match the current filter"),
    ).toBeInTheDocument();
    expect(contributionLinks(container)).toHaveLength(2);
  });

  it("carries the active filter into the search form as a hidden field", () => {
    const { container } = renderDashboard({ filter: "pending" });

    const hidden = container.querySelector(
      'input[type="hidden"][name="filter"]',
    );
    expect(hidden).toHaveAttribute("value", "pending");
  });

  it("shows the empty panel with a way to clear filters when nothing matches", () => {
    renderDashboard({ filter: "attention", query: "sungrid" });

    expect(
      screen.getByText("Nothing matches those filters"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clear filters" })).toHaveAttribute(
      "href",
      "/d/wallet/activity",
    );
  });
});
