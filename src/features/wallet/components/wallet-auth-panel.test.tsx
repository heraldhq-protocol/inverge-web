import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WalletAuthPanel } from "@/features/wallet/components/wallet-auth-panel";
import { WalletAuthUnavailable } from "@/features/wallet/components/wallet-auth-unavailable";
import { createPreviewWalletView } from "@/features/wallet/content/preview-wallet";

const account = createPreviewWalletView().account;

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("WalletAuthPanel", () => {
  it("explains the gap when no Client ID is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_WEB3AUTH_CLIENT_ID", "");

    render(
      <WalletAuthPanel
        account={account}
        authenticated
        networkLabel="Solana devnet"
      />,
    );

    expect(
      screen.getByText(/Wallet connection isn’t available/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /connect wallet/i }),
    ).toBeNull();
  });

  it("mounts the client-only boundary, not the SDK, when configured", () => {
    vi.stubEnv("NEXT_PUBLIC_WEB3AUTH_CLIENT_ID", "test-client-id");

    render(
      <WalletAuthPanel
        account={account}
        authenticated
        networkLabel="Solana devnet"
      />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

describe("WalletAuthUnavailable", () => {
  it("labels the state without offering a sign-in control", () => {
    render(<WalletAuthUnavailable />);

    expect(screen.getByText("Not configured")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sign in/i })).toBeNull();
  });
});
