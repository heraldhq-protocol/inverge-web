import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { trackAdEvent } from "@/features/advertising/lib/client-events";
import {
  resetAdConsentForTests,
  saveAdConsent,
} from "@/features/advertising/lib/consent-store";

const NOW = "2026-10-22T12:00:00.000Z";
const fetchMock = vi.fn();

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  resetAdConsentForTests();
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(new Response(null, { status: 202 }));
  vi.stubGlobal("fetch", fetchMock);
  delete process.env.NEXT_PUBLIC_INVERGE_ADS_ANALYTICS_ENABLED;
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
  window.sessionStorage.clear();
  resetAdConsentForTests();
  delete process.env.NEXT_PUBLIC_INVERGE_ADS_ANALYTICS_ENABLED;
});

describe("trackAdEvent", () => {
  it("sends nothing when the deployment has no public measurement flag", () => {
    saveAdConsent({ measurement: true, personalisedAds: false }, NOW);

    trackAdEvent("ad_impression", "northstar-live", "campaign-feed-inline");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends nothing when the reader refused measurement", () => {
    process.env.NEXT_PUBLIC_INVERGE_ADS_ANALYTICS_ENABLED = "true";
    saveAdConsent({ measurement: false, personalisedAds: true }, NOW);

    trackAdEvent("ad_impression", "northstar-live", "campaign-feed-inline");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends one anonymous event after explicit consent", () => {
    process.env.NEXT_PUBLIC_INVERGE_ADS_ANALYTICS_ENABLED = "true";
    saveAdConsent({ measurement: true, personalisedAds: false }, NOW);

    trackAdEvent("ad_impression", "northstar-live", "campaign-feed-inline");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/advertising/events");
    expect(init).toMatchObject({
      headers: { "content-type": "application/json" },
      keepalive: true,
      method: "POST",
    });

    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({
      creativeId: "northstar-live",
      placementId: "campaign-feed-inline",
      type: "ad_impression",
    });
    expect(body.sessionId).toMatch(/^[A-Za-z0-9_-]{16,64}$/);
    expect(body.occurredAt).toEqual(expect.any(String));
    expect(init.body).not.toContain("email");
    expect(init.body).not.toContain("ip");
  });

  it("does not send the same event twice in one tab", () => {
    process.env.NEXT_PUBLIC_INVERGE_ADS_ANALYTICS_ENABLED = "true";
    saveAdConsent({ measurement: true, personalisedAds: false }, NOW);

    trackAdEvent("ad_impression", "northstar-live", "campaign-feed-inline");
    trackAdEvent("ad_impression", "northstar-live", "campaign-feed-inline");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("still allows a distinct event type for the same placement", () => {
    process.env.NEXT_PUBLIC_INVERGE_ADS_ANALYTICS_ENABLED = "true";
    saveAdConsent({ measurement: true, personalisedAds: false }, NOW);

    trackAdEvent("ad_impression", "northstar-live", "campaign-feed-inline");
    trackAdEvent("ad_click", "northstar-live", "campaign-feed-inline");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("never lets a failed send interrupt the page", async () => {
    process.env.NEXT_PUBLIC_INVERGE_ADS_ANALYTICS_ENABLED = "true";
    saveAdConsent({ measurement: true, personalisedAds: false }, NOW);
    fetchMock.mockRejectedValue(new Error("offline"));

    expect(() =>
      trackAdEvent("ad_click", "northstar-live", "campaign-feed-inline"),
    ).not.toThrow();
    await Promise.resolve();
  });
});
