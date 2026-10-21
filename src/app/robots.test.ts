import { afterEach, describe, expect, it, vi } from "vitest";
import type { MetadataRoute } from "next";

import robots from "@/app/robots";

afterEach(() => {
  vi.unstubAllEnvs();
});

type RobotsRule = {
  allow?: string | string[] | undefined;
  disallow?: string | string[] | undefined;
  userAgent?: string | string[] | undefined;
};

/**
 * `MetadataRoute.Robots` types `rules` as one rule *or* an array of them, and
 * each field as a string or an array of strings. Flatten every combination to
 * a single list so the assertions read plainly.
 */
function fieldOf(
  config: MetadataRoute.Robots,
  key: keyof RobotsRule,
): string[] {
  const rules: unknown = config.rules;
  const list: unknown[] = Array.isArray(rules) ? rules : [rules];

  return list.flatMap((rule) => {
    const value = (rule as RobotsRule)[key];
    if (value === undefined) return [];
    return Array.isArray(value) ? value : [value];
  });
}

describe("robots", () => {
  it("points crawlers at an absolute sitemap on the canonical origin", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://inverge.africa");

    const config = robots();

    expect(config.sitemap).toBe("https://inverge.africa/sitemap.xml");
    expect(config.host).toBe("inverge.africa");
  });

  it("blocks every private route family", () => {
    const disallow = fieldOf(robots(), "disallow");

    for (const prefix of [
      "/admin",
      "/api",
      "/auth",
      "/d",
      "/onboarding",
      "/sign-out",
    ]) {
      expect(disallow).toContain(prefix);
    }
  });

  it("still allows the public site to be crawled for every agent", () => {
    expect(fieldOf(robots(), "allow")).toContain("/");
    expect(fieldOf(robots(), "userAgent")).toContain("*");
  });

  it("leaves the share-image endpoint reachable so previews render", () => {
    const disallow = fieldOf(robots(), "disallow");

    expect(disallow).not.toContain("/og");
    expect(disallow.every((prefix) => prefix.startsWith("/"))).toBe(true);
  });
});
