import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WalletAuthPanel } from "@/features/wallet/components/wallet-auth-panel";
import { WalletAuthUnavailable } from "@/features/wallet/components/wallet-auth-unavailable";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("WalletAuthPanel", () => {
  it("explains the gap when no Client ID is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_WEB3AUTH_CLIENT_ID", "");

    render(<WalletAuthPanel />);

    expect(
      screen.getByText(/sign-in isn't set up in this environment/i),
    ).toBeInTheDocument();
  });

  it("mounts the client-only boundary, not the SDK, when configured", () => {
    vi.stubEnv("NEXT_PUBLIC_WEB3AUTH_CLIENT_ID", "test-client-id");

    render(<WalletAuthPanel />);

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
