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
  it("shows each refund record with its own state and amount", () => {
    render(<WalletRefunds view={createPreviewWalletView()} />);

    expect(screen.getByText("Refund available")).toBeInTheDocument();
    expect(screen.getByText("Refund confirmed")).toBeInTheDocument();
    expect(screen.getAllByText("$5,000").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("$2,500").length).toBeGreaterThanOrEqual(2);
  });

  it("labels preview records as example data", () => {
    render(<WalletRefunds view={createPreviewWalletView()} />);

    expect(screen.getByText("Example data")).toBeInTheDocument();
  });

  it("does not render a claim control while refund execution is missing", () => {
    render(<WalletRefunds view={createPreviewWalletView()} />);

    expect(screen.queryByRole("button", { name: /claim/i })).toBeNull();
    expect(
      screen.getByText(/Refund claims can’t be submitted yet/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Claiming isn’t available yet/),
    ).toBeInTheDocument();
  });

  it("states that a confirmed refund is complete rather than offering another claim", () => {
    render(<WalletRefunds view={createPreviewWalletView()} />);

    expect(
      screen.getByText("The refund has been returned."),
    ).toBeInTheDocument();
    expect(screen.queryByText("None exists")).toBeNull();
  });

  it("keeps the contribution reference for every record", () => {
    render(<WalletRefunds view={createPreviewWalletView()} />);

    expect(
      screen.getAllByRole("link", { name: /View contribution/ }).length,
    ).toBeGreaterThan(0);
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
