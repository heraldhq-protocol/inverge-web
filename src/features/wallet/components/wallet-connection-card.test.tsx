import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WalletConnectionCard } from "@/features/wallet/components/wallet-connection-card";
import { createPreviewWalletView } from "@/features/wallet/content/preview-wallet";

const ADDRESS = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
const OTHER_ADDRESS = "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgp3a8";

const mocks = vi.hoisted(() => ({
  auth: {
    initError: null as unknown,
    isConnected: false,
    isInitialized: true,
    isInitializing: false,
  },
  connect: vi.fn(async () => null),
  connectState: { error: null as unknown, loading: false },
  disconnect: vi.fn(async () => undefined),
  disconnectState: { error: null as unknown, loading: false },
  wallet: {
    accounts: null as string[] | null,
    rpc: null as unknown,
  },
}));

vi.mock("@solana/kit", () => ({
  address: (value: string) => value,
}));

vi.mock("@web3auth/modal/react", () => ({
  useWeb3Auth: () => mocks.auth,
  useWeb3AuthConnect: () => ({
    connect: mocks.connect,
    error: mocks.connectState.error,
    isConnected: mocks.auth.isConnected,
    loading: mocks.connectState.loading,
  }),
  useWeb3AuthDisconnect: () => ({
    disconnect: mocks.disconnect,
    error: mocks.disconnectState.error,
    loading: mocks.disconnectState.loading,
  }),
}));

vi.mock("@web3auth/modal/react/solana", () => ({
  useSolanaWallet: () => mocks.wallet,
}));

const writeText = vi.fn(async () => undefined);

function renderCard({
  authenticated = true,
}: { authenticated?: boolean } = {}) {
  return render(
    <WalletConnectionCard
      account={createPreviewWalletView().account}
      authenticated={authenticated}
      networkLabel="Solana devnet"
    />,
  );
}

beforeEach(() => {
  mocks.auth = {
    initError: null,
    isConnected: false,
    isInitialized: true,
    isInitializing: false,
  };
  mocks.connectState = { error: null, loading: false };
  mocks.disconnectState = { error: null, loading: false };
  mocks.wallet = { accounts: null, rpc: null };
  mocks.connect.mockClear();
  mocks.disconnect.mockClear();
  writeText.mockClear();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
});

afterEach(cleanup);

describe("WalletConnectionCard connection lifecycle", () => {
  it("does not open the provider on mount", () => {
    renderCard();

    expect(
      screen.getByRole("heading", { name: "Your wallet isn’t ready yet." }),
    ).toBeInTheDocument();
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it("opens the provider once when the user asks to connect", () => {
    renderCard();

    fireEvent.click(screen.getByRole("button", { name: "Connect wallet" }));

    expect(mocks.connect).toHaveBeenCalledTimes(1);
  });

  it("shows the signed-out state with the existing sign-in route", () => {
    renderCard({ authenticated: false });

    expect(
      screen.getByRole("heading", { name: "Your wallet starts here." }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/auth?next=%2Fd%2Fwallet",
    );
    expect(screen.queryByRole("button", { name: "Connect wallet" })).toBeNull();
  });

  it("explains a provider initialisation failure without leaking details", () => {
    mocks.auth.initError = new Error("INTERNAL_PROVIDER_STACK_TRACE");
    renderCard();

    expect(
      screen.getByRole("heading", {
        name: "We couldn’t start the wallet connection.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload page" })).toBeVisible();
    expect(screen.queryByText(/INTERNAL_PROVIDER_STACK_TRACE/)).toBeNull();
  });

  it("shows the loading shape while the SDK initialises", () => {
    mocks.auth.isInitialized = false;
    mocks.auth.isInitializing = true;
    renderCard();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Preparing your wallet",
    );
  });

  it("warns when the provider is connected without a Solana account", () => {
    mocks.auth.isConnected = true;
    renderCard();

    expect(
      screen.getByRole("heading", {
        name: "We couldn’t find a Solana wallet.",
      }),
    ).toBeInTheDocument();
  });
});

describe("WalletConnectionCard address and balance", () => {
  beforeEach(() => {
    mocks.auth.isConnected = true;
    mocks.wallet.accounts = [ADDRESS];
  });

  it("shows the provider address, marks it unlinked, and copies the full value", async () => {
    renderCard();

    expect(screen.getByTitle(ADDRESS)).toHaveTextContent("7xKX…gAsU");
    expect(
      screen.getByText(/isn’t linked to your Inverge account yet/),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Copy wallet address" }),
    );

    expect(writeText).toHaveBeenCalledWith(ADDRESS);
    expect(await screen.findByText("Address copied.")).toBeInTheDocument();
  });

  it("shows a real SOL balance read from the configured endpoint", async () => {
    const getBalance = vi.fn(() => ({
      send: () => Promise.resolve({ value: 420000000n }),
    }));
    mocks.wallet.rpc = { getBalance };

    renderCard();

    expect(await screen.findByText(/0\.42/)).toBeInTheDocument();
    expect(getBalance).toHaveBeenCalledTimes(1);
  });

  it("says the balance is unavailable instead of showing zero when the read fails", async () => {
    mocks.wallet.rpc = {
      getBalance: () => ({
        send: () => Promise.reject(new Error("rpc unavailable")),
      }),
    };

    renderCard();

    expect(await screen.findByText("Balance unavailable")).toBeInTheDocument();
    expect(screen.queryByText(/0 SOL/)).toBeNull();
  });

  it("surfaces a disagreement between the linked account and this device", () => {
    render(
      <WalletConnectionCard
        account={{
          ...createPreviewWalletView().account,
          address: OTHER_ADDRESS,
          provisioning: "ready",
        }}
        authenticated
        networkLabel="Solana devnet"
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "This wallet doesn’t match your account.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/linked to 9BB6…p3a8/)).toBeInTheDocument();
  });

  it("disconnects only when the user asks", () => {
    renderCard();

    expect(mocks.disconnect).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Disconnect wallet" }));
    expect(mocks.disconnect).toHaveBeenCalledTimes(1);
  });
});
