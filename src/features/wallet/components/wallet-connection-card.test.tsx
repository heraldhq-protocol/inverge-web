import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
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
  session: undefined as
    { account: { address: { toString: () => string } } } | undefined,
  services: {
    checkout: vi.fn(async () => undefined),
    error: null as unknown,
    loading: false,
    receive: vi.fn(async () => undefined),
    walletUi: vi.fn(async () => undefined),
  },
  wallet: {
    accounts: null as string[] | null,
    rpc: null as unknown,
  },
  usdc: { status: "ready", atomic: 0n, decimals: 6 } as unknown,
}));

function walletSession(address: string) {
  return { account: { address: { toString: () => address } } };
}

vi.mock("@solana/kit", () => ({
  address: (value: string) => value,
}));

vi.mock("@solana/react-hooks", () => ({
  useWalletSession: () => mocks.session,
}));

vi.mock("@web3auth/modal/react", () => ({
  useCheckout: () => ({
    error: mocks.services.error,
    loading: mocks.services.loading,
    showCheckout: mocks.services.checkout,
  }),
  useReceive: () => ({
    error: mocks.services.error,
    loading: mocks.services.loading,
    showReceive: mocks.services.receive,
  }),
  useWalletUI: () => ({
    error: mocks.services.error,
    loading: mocks.services.loading,
    showWalletUI: mocks.services.walletUi,
  }),
  useWeb3Auth: () => mocks.auth,
  useWeb3AuthConnect: () => ({
    connect: mocks.connect,
    error: mocks.connectState.error,
    isConnected: mocks.auth.isConnected,
    loading: mocks.connectState.loading,
  }),
}));

vi.mock("@/features/wallet/lib/use-sol-price", () => ({
  formatUsd: (value: number) => `$${value.toFixed(2)}`,
  useSolPrice: () => ({
    status: "ready",
    stale: false,
    updatedAt: null,
    usd: 150,
  }),
}));

vi.mock("@/features/wallet/lib/use-spl-token-balance", () => ({
  useSplTokenBalance: () => mocks.usdc,
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
  mocks.session = undefined;
  mocks.services = {
    checkout: vi.fn(async () => undefined),
    error: null,
    loading: false,
    receive: vi.fn(async () => undefined),
    walletUi: vi.fn(async () => undefined),
  };
  mocks.wallet = { accounts: null, rpc: null };
  mocks.usdc = { status: "ready", atomic: 0n, decimals: 6 };
  mocks.connect.mockClear();
  writeText.mockClear();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

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

  it("waits for the Solana client session before reporting a missing account", () => {
    vi.useFakeTimers();
    mocks.auth.isConnected = true;
    renderCard();

    expect(
      screen.getByRole("heading", {
        name: "Setting up your Solana wallet.",
      }),
    ).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(8_000));

    expect(
      screen.getByRole("heading", {
        name: "We couldn’t find a Solana wallet for this sign-in.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Sign out and try again" }),
    ).toHaveAttribute("href", "/sign-out");
    expect(screen.queryByRole("button", { name: /disconnect/i })).toBeNull();
  });
});

describe("WalletConnectionCard address and balance", () => {
  beforeEach(() => {
    mocks.auth.isConnected = true;
    mocks.session = walletSession(ADDRESS);
  });

  it("uses the reactive Solana client session even when the provider accounts array is empty", () => {
    mocks.wallet.accounts = null;
    renderCard();

    expect(screen.getByTitle(ADDRESS)).toHaveTextContent("7xKX…gAsU");
  });

  it("falls back to the provider accounts array while the client session is pending", () => {
    mocks.session = undefined;
    mocks.wallet.accounts = [ADDRESS];
    renderCard();

    expect(screen.getByTitle(ADDRESS)).toHaveTextContent("7xKX…gAsU");
  });

  it("shows the provider address, marks it unlinked, and copies the full value", async () => {
    renderCard();

    expect(screen.getByTitle(ADDRESS)).toHaveTextContent("7xKX…gAsU");
    expect(
      screen.getByText(/Not linked to your Inverge account yet/),
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

    expect((await screen.findAllByText(/0\.42/)).length).toBeGreaterThan(0);
    expect(getBalance).toHaveBeenCalledTimes(1);
  });

  it("shows the USDC balance for the active network and adds it to the total", async () => {
    mocks.wallet.rpc = {
      getBalance: () => ({
        send: () => Promise.resolve({ value: 420000000n }),
      }),
    };
    mocks.usdc = { status: "ready", atomic: 10_000_000n, decimals: 6 };

    renderCard();

    expect(await screen.findByText("10 USDC")).toBeInTheDocument();
    expect(await screen.findByText("$73.00")).toBeInTheDocument();
  });

  it("says USDC is unavailable instead of showing zero when its read fails", async () => {
    mocks.wallet.rpc = {
      getBalance: () => ({
        send: () => Promise.resolve({ value: 420000000n }),
      }),
    };
    mocks.usdc = { status: "unavailable" };

    renderCard();

    expect(await screen.findByText(/USDC unavailable/)).toBeInTheDocument();
    expect(screen.queryByText(/0 USDC/)).toBeNull();
  });

  it("opens wallet services for receive, send and add funds", () => {
    renderCard();

    fireEvent.click(screen.getByRole("button", { name: "Receive" }));
    expect(mocks.services.receive).toHaveBeenCalledWith({ show: true });

    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(mocks.services.walletUi).toHaveBeenCalledWith({
      show: true,
      path: "send",
    });

    fireEvent.click(screen.getByRole("button", { name: "Add funds" }));
    expect(mocks.services.checkout).toHaveBeenCalledWith({
      show: true,
      tokenList: ["SOL"],
      fiatList: ["USD", "NGN", "KES"],
    });
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
    expect(
      screen.getByRole("link", { name: "Sign out and try again" }),
    ).toHaveAttribute("href", "/sign-out");
    expect(screen.queryByRole("button", { name: /disconnect/i })).toBeNull();
  });

  it("shows the sign-out action instead of a disconnect control", () => {
    renderCard();

    expect(screen.queryByRole("button", { name: /disconnect/i })).toBeNull();
  });
});
