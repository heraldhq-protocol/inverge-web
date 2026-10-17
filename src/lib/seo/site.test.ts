import { afterEach, describe, expect, it, vi } from "vitest";

import {
  absoluteUrl,
  DEVELOPMENT_ORIGIN,
  FALLBACK_PRODUCTION_ORIGIN,
  normalizeOrigin,
  resolveSiteOrigin,
  twitterSiteHandle,
} from "@/lib/seo/site";

describe("normalizeOrigin", () => {
  it("keeps a well-formed https origin", () => {
    expect(normalizeOrigin("https://inverge.africa")).toBe(
      "https://inverge.africa",
    );
  });

  it("reduces a URL with a path and trailing slash to its origin", () => {
    expect(normalizeOrigin("https://inverge.africa/ideas/")).toBe(
      "https://inverge.africa",
    );
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeOrigin("  https://inverge.africa  ")).toBe(
      "https://inverge.africa",
    );
  });

  it("rejects an absent, empty, or unparseable value", () => {
    expect(normalizeOrigin(undefined)).toBeNull();
    expect(normalizeOrigin("")).toBeNull();
    expect(normalizeOrigin("   ")).toBeNull();
    expect(normalizeOrigin("not a url")).toBeNull();
  });

  it("rejects a non-http scheme", () => {
    expect(normalizeOrigin("ftp://inverge.africa")).toBeNull();
    expect(normalizeOrigin("javascript:alert(1)")).toBeNull();
  });
});

describe("resolveSiteOrigin", () => {
  it("prefers a valid configured origin in any environment", () => {
    expect(
      resolveSiteOrigin({
        configured: "https://preview.example.com",
        nodeEnv: "production",
      }),
    ).toBe("https://preview.example.com");
  });

  it("falls back to the production origin when a production build is unconfigured", () => {
    expect(
      resolveSiteOrigin({ configured: undefined, nodeEnv: "production" }),
    ).toBe(FALLBACK_PRODUCTION_ORIGIN);
  });

  it("ignores an invalid configured value rather than coercing it", () => {
    expect(
      resolveSiteOrigin({ configured: "nonsense", nodeEnv: "production" }),
    ).toBe(FALLBACK_PRODUCTION_ORIGIN);
  });

  it("uses the local origin outside production", () => {
    expect(
      resolveSiteOrigin({ configured: undefined, nodeEnv: "development" }),
    ).toBe(DEVELOPMENT_ORIGIN);
    expect(resolveSiteOrigin({ configured: "", nodeEnv: "test" })).toBe(
      DEVELOPMENT_ORIGIN,
    );
  });
});

describe("absoluteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds from the configured origin and keeps a leading slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://inverge.africa");

    expect(absoluteUrl("/ideas")).toBe("https://inverge.africa/ideas");
  });

  it("adds a missing leading slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://inverge.africa");

    expect(absoluteUrl("ideas")).toBe("https://inverge.africa/ideas");
  });

  it("resolves an empty path to the site root", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://inverge.africa");

    expect(absoluteUrl("")).toBe("https://inverge.africa/");
  });

  it("never emits the site name twice for an already-absolute-looking path", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://inverge.africa/");

    expect(absoluteUrl("/about")).toBe("https://inverge.africa/about");
  });
});

describe("twitterSiteHandle", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when unset so no handle is asserted", () => {
    vi.stubEnv("NEXT_PUBLIC_TWITTER_HANDLE", "");
    expect(twitterSiteHandle()).toBeNull();
  });

  it("normalises a bare handle to an at-prefixed one", () => {
    vi.stubEnv("NEXT_PUBLIC_TWITTER_HANDLE", "inverge");
    expect(twitterSiteHandle()).toBe("@inverge");
  });

  it("keeps an existing at-prefixed handle", () => {
    vi.stubEnv("NEXT_PUBLIC_TWITTER_HANDLE", "@inverge");
    expect(twitterSiteHandle()).toBe("@inverge");
  });
});
