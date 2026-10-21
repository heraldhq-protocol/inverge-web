import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { WalletRefunds } from "@/features/wallet/components/wallet-refunds";
import { createPreviewWalletView } from "@/features/wallet/content/preview-wallet";
import type { WalletView } from "@/features/wallet/types";

afterEach(cleanup);

function viewWithRefunds(refunds: WalletView["refunds"]): WalletView {
  return { ...createPreviewWalletView(), refunds };
}

describe("WalletRefunds", () => {
  it("shows each refund record with its own state", () => {
    render(<WalletRefunds view={createPreviewWalletView()} />);

    expect(screen.getByText("Refund available")).toBeInTheDocument();
    expect(screen.getByText("Refund confirmed")).toBeInTheDocument();
    // Once in the summary metrics, once as the record's eligible amount.
    expect(screen.getAllByText("$5,000").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("$2,500").length).toBeGreaterThanOrEqual(2);
  });

  it("offers a claim control only where one is possible, and keeps it disabled", () => {
    render(<WalletRefunds view={createPreviewWalletView()} />);

    const claim = screen.getByRole("button", { name: "Claim refund" });
    expect(claim).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: /refund confirmed/i }),
    ).toBeNull();
  });

  it("attaches the reason a claim cannot be submitted to the disabled control", () => {
    render(<WalletRefunds view={createPreviewWalletView()} />);

    const claim = screen.getByRole("button", { name: "Claim refund" });
    const reasonId = claim.getAttribute("aria-describedby");
    expect(reasonId).toBeTruthy();
    expect(document.getElementById(reasonId ?? "")).toHaveTextContent(
      "Refund execution is not connected in this build",
    );
  });

  it("states that a confirmed refund is complete rather than offering another claim", () => {
    render(<WalletRefunds view={createPreviewWalletView()} />);

    expect(screen.getByText("This refund is complete.")).toBeInTheDocument();
    expect(screen.getAllByText("None exists")).toHaveLength(2);
  });

  it("explains the missing service instead of showing an empty state with records", () => {
    render(<WalletRefunds view={createPreviewWalletView()} />);

    expect(
      screen.getByText(/No refund service or escrow index is connected/),
    ).toBeInTheDocument();
    expect(screen.getByText(/none of them moves money/)).toBeInTheDocument();
  });
});

describe("WalletRefunds empty state", () => {
  it("shows the empty panel with no refund records", () => {
    render(<WalletRefunds view={viewWithRefunds([])} />);

    expect(
      screen.getByText("Nothing is refundable right now"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /claim/i })).toBeNull();
  });
});
