import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WalletSecurity } from "@/features/wallet/components/wallet-security";
import { createPreviewWalletView } from "@/features/wallet/content/preview-wallet";

vi.mock("@/features/wallet/components/wallet-security-actions", () => ({
  WalletSecurityActions: () => null,
}));

afterEach(cleanup);

function renderSecurity() {
  return render(<WalletSecurity view={createPreviewWalletView()} />);
}

describe("WalletSecurity posture", () => {
  it("states the protection boundary without repeating wallet details", () => {
    renderSecurity();

    expect(
      screen.getByRole("heading", { name: "How this wallet is protected" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /The provider holds the key shares\. Inverge only receives your public address/,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Wallet details")).not.toBeInTheDocument();
  });

  it("shows an honest provider state", () => {
    renderSecurity();

    expect(screen.getByText("Not configured")).toBeInTheDocument();
    expect(
      screen.getByText(/Embedded wallet services are not configured/),
    ).toBeInTheDocument();
  });

  it("points provider-hosted controls at the wallet UI", () => {
    renderSecurity();

    expect(
      screen.getByRole("heading", { name: "Manage your wallet" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Recovery, key export, connected sessions/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/no provider SDK is installed/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        /No embedded-wallet provider is configured in this build/i,
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Sessions and devices")).not.toBeInTheDocument();
  });

  it("warns that a request for wallet secrets is fraud", () => {
    renderSecurity();

    expect(screen.getByText(/Treat any request as fraud/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Open the help centre/ }),
    ).toHaveAttribute("href", "/help");
  });
});
