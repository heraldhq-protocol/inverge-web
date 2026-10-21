import { describe, expect, it } from "vitest";

import {
  resolveWalletNetworkId,
  resolveWalletSdkConfig,
  resolveWalletSdkNetwork,
} from "@/features/wallet/lib/provider-config";

const noCluster = {
  cluster: undefined,
  rpcUrl: undefined,
} as const;

describe("resolveWalletSdkConfig", () => {
  it("returns null when the Client ID is absent", () => {
    expect(
      resolveWalletSdkConfig({
        clientId: undefined,
        network: undefined,
        ...noCluster,
      }),
    ).toBeNull();
  });

  it("returns null when the Client ID is blank", () => {
    expect(
      resolveWalletSdkConfig({
        clientId: "   ",
        network: "sapphire-mainnet",
        ...noCluster,
      }),
    ).toBeNull();
  });

  it("declares a Solana chain, because the dashboard only offers EVM ones", () => {
    const config = resolveWalletSdkConfig({
      clientId: "client-id",
      network: undefined,
      ...noCluster,
    });

    expect(config?.chain).toEqual({
      blockExplorerUrl: "https://explorer.solana.com/?cluster=devnet",
      chainId: "0x67",
      chainNamespace: "solana",
      decimals: 9,
      displayName: "Solana Devnet",
      isTestnet: true,
      logo: expect.stringMatching(/^https:\/\//),
      rpcTarget: "https://api.devnet.solana.com",
      ticker: "SOL",
      tickerName: "Solana",
      wsTarget: "wss://api.devnet.solana.com",
    });
  });

  it("starts the connection on the declared chain", () => {
    const config = resolveWalletSdkConfig({
      clientId: "client-id",
      network: undefined,
      ...noCluster,
    });

    expect(config?.defaultChainId).toBe(config?.chain.chainId);
  });

  it("defaults both the provider network and the cluster to devnet", () => {
    const config = resolveWalletSdkConfig({
      clientId: "client-id",
      network: undefined,
      ...noCluster,
    });

    expect(config?.network).toBe("sapphire-devnet");
    expect(config?.chain.chainId).toBe("0x67");
  });

  it("uses the mainnet cluster only when it is named explicitly", () => {
    const config = resolveWalletSdkConfig({
      clientId: "client-id",
      network: "sapphire-mainnet",
      cluster: "solana-mainnet-beta",
      rpcUrl: undefined,
    });

    expect(config?.network).toBe("sapphire-mainnet");
    expect(config?.chain.chainId).toBe("0x65");
    expect(config?.chain.isTestnet).toBe(false);
    expect(config?.chain.blockExplorerUrl).toBe("https://explorer.solana.com");
    expect(config?.defaultChainId).toBe("0x65");
  });

  it("keeps an unrecognised cluster on devnet", () => {
    const config = resolveWalletSdkConfig({
      clientId: "client-id",
      network: undefined,
      cluster: "solana-testnet",
      rpcUrl: undefined,
    });

    expect(config?.chain.chainId).toBe("0x67");
  });

  it("honours an RPC override and derives its websocket target", () => {
    const config = resolveWalletSdkConfig({
      clientId: "client-id",
      network: undefined,
      cluster: undefined,
      rpcUrl: "  https://devnet.helius-rpc.com/?api-key=abc  ",
    });

    expect(config?.chain.rpcTarget).toBe(
      "https://devnet.helius-rpc.com/?api-key=abc",
    );
    expect(config?.chain.wsTarget).toBe(
      "wss://devnet.helius-rpc.com/?api-key=abc",
    );
  });

  it("trims surrounding whitespace from the Client ID", () => {
    expect(
      resolveWalletSdkConfig({
        clientId: "  client-id  ",
        network: undefined,
        ...noCluster,
      })?.clientId,
    ).toBe("client-id");
  });
});

describe("resolveWalletSdkNetwork", () => {
  it("does not treat an unrecognised network as mainnet", () => {
    expect(resolveWalletSdkNetwork("mainnet-beta")).toBe("sapphire-devnet");
  });

  it("tolerates whitespace around an explicit mainnet value", () => {
    expect(resolveWalletSdkNetwork("  sapphire-mainnet ")).toBe(
      "sapphire-mainnet",
    );
  });
});

describe("resolveWalletNetworkId", () => {
  it("does not treat an unrecognised cluster as mainnet", () => {
    expect(resolveWalletNetworkId("mainnet")).toBe("solana-devnet");
  });

  it("tolerates whitespace around an explicit mainnet value", () => {
    expect(resolveWalletNetworkId("  solana-mainnet-beta ")).toBe(
      "solana-mainnet-beta",
    );
  });
});
