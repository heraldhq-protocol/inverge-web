import { describe, expect, it } from "vitest";

import {
  createPreviewWalletView,
  previewWalletFundingSnapshot,
} from "@/features/wallet/content/preview-wallet";
import { capabilityStatus } from "@/features/wallet/lib/capabilities";

/**
 * The preview view must change what it *says* when the SDK and Client ID are
 * present, without ever claiming provisioning, an address, or a balance read.
 */
describe("createPreviewWalletView integration flags", () => {
  it("stays unconfigured and SDK-absent with no flags", () => {
    const view = createPreviewWalletView();

    expect(view.account.provider.configured).toBe(false);
    expect(capabilityStatus(view.capabilities, "provisioning")).toBe(
      "unavailable",
    );
  });

  it("reports a configured provider but keeps provisioning unavailable", () => {
    const view = createPreviewWalletView({
      providerConfigured: true,
      sdkInstalled: true,
    });

    expect(view.account.provider.configured).toBe(true);
    expect(view.account.address).toBeNull();
    expect(capabilityStatus(view.capabilities, "provisioning")).toBe(
      "unavailable",
    );
    expect(
      view.capabilities.find((item) => item.id === "provisioning")?.reason,
    ).toMatch(/No authenticated Inverge session/);
  });

  it("still labels both balances as samples", () => {
    const view = createPreviewWalletView({
      providerConfigured: true,
      sdkInstalled: true,
    });

    expect(view.balances).toHaveLength(2);
    expect(view.balances.every((balance) => balance.sample)).toBe(true);
  });

  it("carries the provider flag into the funding snapshot", () => {
    expect(
      previewWalletFundingSnapshot({
        providerConfigured: true,
        sdkInstalled: true,
      }).configured,
    ).toBe(true);
    expect(previewWalletFundingSnapshot().configured).toBe(false);
  });
});
