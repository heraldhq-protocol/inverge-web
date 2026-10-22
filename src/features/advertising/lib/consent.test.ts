import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  AD_CONSENT_STORAGE_KEY,
  ESSENTIAL_ONLY_CONSENT,
  consentAllowsMeasurement,
  consentAllowsPersonalisedAds,
  createAdConsentRecord,
  parseAdConsent,
  shouldRenderThirdPartyAd,
} from "@/features/advertising/lib/consent";
import {
  advertisingAnalyticsEnabled,
  resolveAdFlags,
} from "@/features/advertising/lib/flags";

const AT = "2026-10-22T12:00:00.000Z";

describe("parseAdConsent", () => {
  it("accepts a complete version 2 record", () => {
    const raw = JSON.stringify({
      measurement: true,
      personalisedAds: false,
      updatedAt: AT,
      version: 2,
    });

    expect(parseAdConsent(raw)).toEqual({
      measurement: true,
      personalisedAds: false,
      updatedAt: AT,
      version: 2,
    });
  });

  it("fails closed for an older version, a partial record, or garbage", () => {
    for (const raw of [
      null,
      "",
      "not-json",
      JSON.stringify({ measurement: true, personalisedAds: true }),
      JSON.stringify({
        measurement: true,
        personalisedAds: true,
        updatedAt: AT,
        version: 1,
      }),
      JSON.stringify({
        measurement: "yes",
        personalisedAds: true,
        updatedAt: AT,
        version: 2,
      }),
      JSON.stringify({
        measurement: true,
        personalisedAds: true,
        updatedAt: "soon",
        version: 2,
      }),
    ]) {
      expect(parseAdConsent(raw)).toBeNull();
    }
  });

  it("does not read missing purposes as granted", () => {
    const record = parseAdConsent(
      JSON.stringify({
        measurement: false,
        personalisedAds: false,
        updatedAt: AT,
        version: 2,
      }),
    );

    expect(consentAllowsMeasurement(record)).toBe(false);
    expect(consentAllowsPersonalisedAds(record)).toBe(false);
    expect(consentAllowsMeasurement(null)).toBe(false);
    expect(consentAllowsPersonalisedAds(null)).toBe(false);
  });
});

describe("createAdConsentRecord", () => {
  it("stamps the current version and time", () => {
    expect(createAdConsentRecord(ESSENTIAL_ONLY_CONSENT, AT)).toEqual({
      measurement: false,
      personalisedAds: false,
      updatedAt: AT,
      version: 2,
    });
  });

  it("does not share mutable state with the essential default", () => {
    const record = createAdConsentRecord(ESSENTIAL_ONLY_CONSENT, AT);
    expect(record).not.toBe(ESSENTIAL_ONLY_CONSENT);
  });
});

describe("shouldRenderThirdPartyAd", () => {
  const consent = createAdConsentRecord(
    { measurement: false, personalisedAds: true },
    AT,
  );

  it("requires a client id, a slot id, and explicit personalisation", () => {
    expect(
      shouldRenderThirdPartyAd({
        clientId: "ca-pub-123",
        consent,
        slotId: "456",
      }),
    ).toBe(true);
  });

  it("refuses a missing identifier", () => {
    for (const input of [
      { clientId: undefined, consent, slotId: "456" },
      { clientId: "", consent, slotId: "456" },
      { clientId: "ca-pub-123", consent, slotId: undefined },
      { clientId: "ca-pub-123", consent, slotId: "" },
    ]) {
      expect(shouldRenderThirdPartyAd(input)).toBe(false);
    }
  });

  it("refuses before consent, including a record that only allows measurement", () => {
    expect(
      shouldRenderThirdPartyAd({
        clientId: "ca-pub-123",
        consent: null,
        slotId: "456",
      }),
    ).toBe(false);

    expect(
      shouldRenderThirdPartyAd({
        clientId: "ca-pub-123",
        consent: createAdConsentRecord(
          { measurement: true, personalisedAds: false },
          AT,
        ),
        slotId: "456",
      }),
    ).toBe(false);
  });
});

describe("advertising feature flags", () => {
  it("defaults on only in development", () => {
    expect(resolveAdFlags({ NODE_ENV: "development" })).toEqual({
      enabled: true,
      thirdPartyEnabled: false,
    });
    expect(resolveAdFlags({ NODE_ENV: "production" })).toEqual({
      enabled: false,
      thirdPartyEnabled: false,
    });
    expect(resolveAdFlags({})).toEqual({
      enabled: false,
      thirdPartyEnabled: false,
    });
  });

  it("lets an explicit switch win in either direction", () => {
    expect(
      resolveAdFlags({ NODE_ENV: "production", INVERGE_ADS_ENABLED: "true" }),
    ).toEqual({ enabled: true, thirdPartyEnabled: false });

    expect(
      resolveAdFlags({ NODE_ENV: "development", INVERGE_ADS_ENABLED: "false" }),
    ).toEqual({ enabled: false, thirdPartyEnabled: false });
  });

  it("requires both the third-party switch and a client id", () => {
    const base = {
      INVERGE_ADS_ENABLED: "true",
      INVERGE_ADS_THIRD_PARTY_ENABLED: "true",
    };

    expect(resolveAdFlags(base)).toEqual({
      enabled: true,
      thirdPartyEnabled: false,
    });

    expect(
      resolveAdFlags({
        ...base,
        NEXT_PUBLIC_INVERGE_ADSENSE_CLIENT_ID: "ca-pub-123",
      }),
    ).toEqual({ enabled: true, thirdPartyEnabled: true });
  });

  it("keeps third-party off when the master switch is off", () => {
    expect(
      resolveAdFlags({
        INVERGE_ADS_ENABLED: "false",
        INVERGE_ADS_THIRD_PARTY_ENABLED: "true",
        NEXT_PUBLIC_INVERGE_ADSENSE_CLIENT_ID: "ca-pub-123",
      }),
    ).toEqual({ enabled: false, thirdPartyEnabled: false });
  });

  it("treats only an explicit true as advertising measurement", () => {
    expect(advertisingAnalyticsEnabled({})).toBe(false);
    expect(
      advertisingAnalyticsEnabled({ INVERGE_ADS_ANALYTICS_ENABLED: "false" }),
    ).toBe(false);
    expect(
      advertisingAnalyticsEnabled({ INVERGE_ADS_ANALYTICS_ENABLED: "yes" }),
    ).toBe(false);
    expect(
      advertisingAnalyticsEnabled({ INVERGE_ADS_ANALYTICS_ENABLED: "true" }),
    ).toBe(true);
  });
});

describe("browser consent store", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.resetModules();
  });

  it("has no choice on the server or on a first visit", async () => {
    const store = await import("@/features/advertising/lib/consent-store");

    expect(store.getServerAdConsentSnapshot()).toBeNull();
    expect(store.getAdConsentSnapshot()).toBeNull();
  });

  it("persists an explicit choice and reloads it", async () => {
    const store = await import("@/features/advertising/lib/consent-store");
    const saved = store.saveAdConsent(
      { measurement: true, personalisedAds: false },
      AT,
    );

    expect(saved.version).toBe(2);
    expect(
      JSON.parse(window.localStorage.getItem(AD_CONSENT_STORAGE_KEY)!),
    ).toEqual(saved);

    vi.resetModules();
    const reloaded = await import("@/features/advertising/lib/consent-store");
    expect(reloaded.getAdConsentSnapshot()).toEqual(saved);
  });

  it("notifies subscribers on save", async () => {
    const store = await import("@/features/advertising/lib/consent-store");
    const listener = vi.fn();
    const unsubscribe = store.subscribeAdConsent(listener);

    store.saveAdConsent({ measurement: false, personalisedAds: true }, AT);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.saveAdConsent(ESSENTIAL_ONLY_CONSENT, AT);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("fails closed when the stored value is corrupt", async () => {
    window.localStorage.setItem(AD_CONSENT_STORAGE_KEY, "{not-json");
    const store = await import("@/features/advertising/lib/consent-store");

    expect(store.getAdConsentSnapshot()).toBeNull();
  });
});
