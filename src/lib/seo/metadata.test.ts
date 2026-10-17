import { afterEach, describe, expect, it, vi } from "vitest";

import { buildPageMetadata, PRIVATE_ROBOTS } from "@/lib/seo/metadata";

afterEach(() => {
  vi.unstubAllEnvs();
});

/**
 * Next types `openGraph` and `twitter` as unions whose members expose `type`,
 * `card`, and friends only on some branches, so compare the serialised form
 * instead of casting through `any`.
 */
function jsonOf(value: unknown): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

describe("buildPageMetadata", () => {
  it("derives canonical, Open Graph, and Twitter URLs from the canonical origin", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://inverge.africa");

    const metadata = buildPageMetadata({
      description: "A description.",
      path: "/ideas/cold-chain-boxes",
      title: "Cold-chain boxes",
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://inverge.africa/ideas/cold-chain-boxes",
    );
    expect(metadata.openGraph?.url).toBe(
      "https://inverge.africa/ideas/cold-chain-boxes",
    );
  });

  it("leaves the title bare so the root layout's template appends the site name once", () => {
    const metadata = buildPageMetadata({
      description: "A description.",
      path: "/about",
      title: "About",
    });

    expect(metadata.title).toBe("About");
    expect(metadata.title).not.toContain("Inverge");
  });

  it("never derives a canonical from the request, even for two paths on one origin", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://inverge.africa");

    const first = buildPageMetadata({
      description: "a",
      path: "/ideas/one",
      title: "One",
    });
    const second = buildPageMetadata({
      description: "b",
      path: "/ideas/two",
      title: "Two",
    });

    expect(first.alternates?.canonical).not.toBe(second.alternates?.canonical);
  });

  it("emits a 1200x630 share image with an alt that describes the image", () => {
    const metadata = buildPageMetadata({
      description: "A description.",
      og: { alt: "Cold-chain boxes — an idea on Inverge" },
      path: "/ideas/cold-chain-boxes",
      title: "Cold-chain boxes",
    });

    const images = metadata.openGraph?.images;
    const image = Array.isArray(images) ? images[0] : images;

    expect(image).toMatchObject({
      alt: "Cold-chain boxes — an idea on Inverge",
      height: 630,
      width: 1200,
    });
  });

  it("defaults the image alt to the page title", () => {
    const metadata = buildPageMetadata({
      description: "A description.",
      path: "/about",
      title: "About",
    });

    const images = metadata.openGraph?.images;
    const image = Array.isArray(images) ? images[0] : images;

    expect((image as { alt?: string }).alt).toBe("About");
  });

  it("marks a page indexable by default", () => {
    const metadata = buildPageMetadata({
      description: "A description.",
      path: "/about",
      title: "About",
    });

    expect(metadata.robots).toEqual({ follow: true, index: true });
  });

  it("marks a page noindex and nofollow when asked", () => {
    const metadata = buildPageMetadata({
      description: "A description.",
      path: "/ideas/unlisted",
      robots: "noindex",
      title: "Unlisted",
    });

    expect(metadata.robots).toEqual({ follow: false, index: false });
  });

  it("uses the article type only when a publication date is known", () => {
    const undated = buildPageMetadata({
      description: "A description.",
      path: "/guides/a",
      title: "A",
    });
    const dated = buildPageMetadata({
      description: "A description.",
      path: "/blog/b",
      publishedAt: "2026-01-01T00:00:00.000Z",
      title: "B",
    });

    expect(jsonOf(undated.openGraph).type).toBe("website");
    expect(jsonOf(dated.openGraph).type).toBe("article");
    expect(dated.openGraph).toMatchObject({
      publishedTime: "2026-01-01T00:00:00.000Z",
    });
  });

  it("omits a Twitter handle when the deployment has not configured one", () => {
    vi.stubEnv("NEXT_PUBLIC_TWITTER_HANDLE", "");

    const metadata = buildPageMetadata({
      description: "A description.",
      path: "/about",
      title: "About",
    });

    expect(metadata.twitter).not.toHaveProperty("site");
  });

  it("always requests a large summary card", () => {
    const metadata = buildPageMetadata({
      description: "A description.",
      path: "/about",
      title: "About",
    });

    expect(jsonOf(metadata.twitter).card).toBe("summary_large_image");
  });
});

describe("PRIVATE_ROBOTS", () => {
  it("excludes a surface from the index and from crawling", () => {
    expect(PRIVATE_ROBOTS).toEqual({ follow: false, index: false });
  });
});
