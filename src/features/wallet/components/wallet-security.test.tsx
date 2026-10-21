import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { WalletSecurity } from "@/features/wallet/components/wallet-security";
import { createPreviewWalletView } from "@/features/wallet/content/preview-wallet";

afterEach(cleanup);

function renderSecurity() {
  return render(<WalletSecurity view={createPreviewWalletView()} />);
}

describe("WalletSecurity posture", () => {
  it("binds the wallet to the Inverge identity, not an address", () => {
    renderSecurity();

    expect(screen.getByText("Inverge user id")).toBeInTheDocument();
    expect(screen.getByText("None exists")).toBeInTheDocument();
    expect(screen.getByText("Authenticated session")).toBeInTheDocument();
  });

  it("states plainly that no secret material is handled", () => {
    renderSecurity();

    expect(
      screen.getByText(
        /No private key, seed phrase, or signing share is stored/,
      ),
    ).toBeInTheDocument();
  });

  it("warns that a request for wallet secrets is fraud", () => {
    renderSecurity();

    expect(screen.getByText(/Treat any request as fraud/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Open the help centre/ }),
    ).toHaveAttribute("href", "/help");
  });
});

describe("WalletSecurity controls", () => {
  it("marks no security control as connected in this build", () => {
    renderSecurity();

    expect(screen.queryByText("Connected")).toBeNull();
    expect(screen.queryByText("Preview only")).toBeNull();
    // Provisioning, signing, and key export rows all report unavailable.
    expect(screen.getAllByText("Not available").length).toBeGreaterThanOrEqual(
      5,
    );
  });

  it("offers no export button and explains why", () => {
    renderSecurity();

    expect(screen.queryByRole("button", { name: /export/i })).toBeNull();
    expect(
      screen.getByText(
        /there is nothing to export and no button that pretends otherwise/,
      ),
    ).toBeInTheDocument();
  });

  it("keeps key export unavailable rather than relying on a provider default", () => {
    renderSecurity();

    expect(
      screen.getByText(
        /Key export stays unavailable until the provider documents/,
      ),
    ).toBeInTheDocument();
  });
});
