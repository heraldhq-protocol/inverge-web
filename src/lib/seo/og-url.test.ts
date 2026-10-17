import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildOgImageUrl,
  isOgTemplate,
  parseOgTemplate,
} from "@/lib/seo/og-url";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("parseOgTemplate", () => {
  it("accepts each known template", () => {
    expect(parseOgTemplate("idea")).toBe("idea");
    expect(parseOgTemplate("creator")).toBe("creator");
    expect(parseOgTemplate("ideathon")).toBe("ideathon");
  });

  it("falls back to the brand default for an unknown or absent value", () => {
    expect(parseOgTemplate("../../etc/passwd")).toBe("default");
    expect(parseOgTemplate(null)).toBe("default");
    expect(parseOgTemplate(undefined)).toBe("default");
  });
});

describe("isOgTemplate", () => {
  it("rejects non-strings", () => {
    expect(isOgTemplate(7)).toBe(false);
    expect(isOgTemplate({})).toBe(false);
  });
});

describe("buildOgImageUrl", () => {
  it("produces a deterministic URL on the canonical origin", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://inverge.africa");

    expect(
      buildOgImageUrl({ template: "idea", title: "Cold-chain boxes" }),
    ).toBe("https://inverge.africa/og?template=idea&title=Cold-chain+boxes");
  });

  it("collapses whitespace so equivalent titles share one cache key", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://inverge.africa");

    const spaced = buildOgImageUrl({
      template: "default",
      title: "Cold   chain\nboxes",
    });
    const tidy = buildOgImageUrl({
      template: "default",
      title: "Cold chain boxes",
    });

    expect(spaced).toBe(tidy);
  });

  it("omits empty optional fields instead of emitting blank parameters", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://inverge.africa");

    const url = buildOgImageUrl({
      description: "   ",
      eyebrow: "",
      template: "default",
      title: "Title",
    });

    expect(url).toBe("https://inverge.africa/og?template=default&title=Title");
  });

  it("bounds a long description so the URL stays short", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://inverge.africa");

    const url = buildOgImageUrl({
      description: "x".repeat(500),
      template: "guide",
      title: "Title",
    });

    const description = new URLSearchParams(url.split("?")[1]).get(
      "description",
    );

    expect(description?.length).toBe(160);
    expect(description?.endsWith("…")).toBe(true);
  });

  it("encodes reserved characters rather than breaking the query", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://inverge.africa");

    const url = buildOgImageUrl({
      template: "idea",
      title: "Ampersand & hash # slash /",
    });

    expect(url).not.toContain("#");
    expect(new URL(url).searchParams.get("title")).toBe(
      "Ampersand & hash # slash /",
    );
  });
});
