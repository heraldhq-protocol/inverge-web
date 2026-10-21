import { describe, expect, it } from "vitest";

import type { WalletCapability } from "@/features/wallet/types";
import {
  auditWalletCapabilities,
  capabilityStatus,
  describeCapabilityStatus,
  type WalletCapabilityInput,
} from "@/features/wallet/lib/capabilities";

const off: WalletCapabilityInput = {
  addressAvailable: false,
  exportSupported: false,
  onRampConfigured: false,
  providerConfigured: false,
  refundServiceConfigured: false,
  sdkInstalled: false,
  sessionAvailable: false,
};

const on: WalletCapabilityInput = {
  addressAvailable: true,
  exportSupported: true,
  onRampConfigured: true,
  providerConfigured: true,
  refundServiceConfigured: true,
  sdkInstalled: true,
  sessionAvailable: true,
};

describe("auditWalletCapabilities", () => {
  it("marks an unimplemented integration unavailable, not preview", () => {
    const capabilities = auditWalletCapabilities(off);
    const byId = new Map(capabilities.map((item) => [item.id, item]));

    expect(byId.get("provisioning")?.status).toBe("unavailable");
    expect(byId.get("receive")?.status).toBe("unavailable");
    expect(byId.get("signing")?.status).toBe("unavailable");
    expect(byId.get("on-ramp")?.status).toBe("unavailable");
    expect(byId.get("withdrawal")?.status).toBe("unavailable");
    expect(byId.get("refunds")?.status).toBe("unavailable");
    expect(byId.get("export")?.status).toBe("unavailable");
  });

  it("marks derived balances and activity as preview data", () => {
    const capabilities = auditWalletCapabilities(off);
    const byId = new Map(capabilities.map((item) => [item.id, item]));

    expect(byId.get("balance")?.status).toBe("preview");
    expect(byId.get("activity")?.status).toBe("preview");
    expect(byId.get("balance")?.reason).toMatch(/labelled samples/i);
  });

  it("marks every capability connected only when the whole mechanism exists", () => {
    const capabilities = auditWalletCapabilities(on);

    expect(capabilities.every((item) => item.status === "available")).toBe(
      true,
    );
    expect(capabilities.every((item) => item.reason === null)).toBe(true);
  });

  it("names the missing provider, SDK, or session separately", () => {
    const noProvider = auditWalletCapabilities({ ...off, sdkInstalled: true });
    const noSdk = auditWalletCapabilities({ ...off, providerConfigured: true });
    const noSession = auditWalletCapabilities({
      ...off,
      providerConfigured: true,
      sdkInstalled: true,
    });

    const reason = (capabilities: readonly WalletCapability[]) =>
      capabilities.find((item) => item.id === "provisioning")?.reason;

    expect(reason(noProvider)).toMatch(/provider is configured/);
    expect(reason(noSdk)).toMatch(/SDK is not installed/);
    expect(reason(noSession)).toMatch(/authenticated Inverge session/);
  });

  it("never makes key export available from an address alone", () => {
    const input = {
      ...off,
      addressAvailable: true,
      providerConfigured: true,
      sdkInstalled: true,
      sessionAvailable: true,
    };

    expect(capabilityStatus(auditWalletCapabilities(input), "export")).toBe(
      "unavailable",
    );
  });
});

describe("capability helpers", () => {
  it("falls back to unavailable for an unknown capability id", () => {
    expect(capabilityStatus([], "signing")).toBe("unavailable");
  });

  it("gives every status a word, not only a colour", () => {
    expect(describeCapabilityStatus("available")).toBe("Connected");
    expect(describeCapabilityStatus("preview")).toBe("Preview only");
    expect(describeCapabilityStatus("unavailable")).toBe("Not available");
  });
});
