import { afterEach, describe, expect, it, vi } from "vitest";

import {
  articleJsonLd,
  breadcrumbJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo/json-ld";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("organizationJsonLd", () => {
  it("asserts identity and nothing that must be earned", () => {
    const node = organizationJsonLd();

    expect(node["@type"]).toBe("Organization");
    // Claims the platform cannot yet substantiate must never appear.
    expect(node).not.toHaveProperty("aggregateRating");
    expect(node).not.toHaveProperty("review");
    expect(node).not.toHaveProperty("award");
    expect(node).not.toHaveProperty("sameAs");
  });
});

describe("websiteJsonLd", () => {
  it("points at the canonical root and names a publisher", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://inverge.africa");

    const node = websiteJsonLd();

    expect(node["@type"]).toBe("WebSite");
    expect(node.url).toBe("https://inverge.africa/");
    expect(node.publisher).toMatchObject({ "@type": "Organization" });
  });
});

describe("breadcrumbJsonLd", () => {
  it("numbers items from one and absolutises each path", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://inverge.africa");

    const node = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Ideas", path: "/ideas" },
      { name: "Cold-chain boxes", path: "/ideas/cold-chain-boxes" },
    ]);

    expect(node.itemListElement).toEqual([
      {
        "@type": "ListItem",
        item: "https://inverge.africa/",
        name: "Home",
        position: 1,
      },
      {
        "@type": "ListItem",
        item: "https://inverge.africa/ideas",
        name: "Ideas",
        position: 2,
      },
      {
        "@type": "ListItem",
        item: "https://inverge.africa/ideas/cold-chain-boxes",
        name: "Cold-chain boxes",
        position: 3,
      },
    ]);
  });
});

describe("articleJsonLd", () => {
  it("defaults to Article and attributes the organisation as author", () => {
    const node = articleJsonLd({
      description: "A summary.",
      path: "/guides/a",
      title: "A guide",
    });

    expect(node["@type"]).toBe("Article");
    expect(node.author).toMatchObject({ "@type": "Organization" });
    expect(node.headline).toBe("A guide");
  });

  it("uses BlogPosting for the journal when asked", () => {
    const node = articleJsonLd({
      description: "A summary.",
      path: "/blog/b",
      title: "An entry",
      type: "BlogPosting",
    });

    expect(node["@type"]).toBe("BlogPosting");
  });

  it("omits a publication date rather than inventing one", () => {
    const node = articleJsonLd({
      description: "A summary.",
      path: "/guides/a",
      title: "A guide",
    });

    expect(node).not.toHaveProperty("datePublished");
    expect(JSON.parse(JSON.stringify(node))).not.toHaveProperty(
      "datePublished",
    );
  });

  it("includes modification time only when supplied", () => {
    const node = articleJsonLd({
      description: "A summary.",
      modifiedAt: "2026-02-01T00:00:00.000Z",
      path: "/guides/a",
      publishedAt: "2026-01-01T00:00:00.000Z",
      title: "A guide",
    });

    expect(node.dateModified).toBe("2026-02-01T00:00:00.000Z");
  });

  it("claims no reader, rating, or payment figures", () => {
    const node = articleJsonLd({
      description: "A summary.",
      path: "/guides/a",
      title: "A guide",
    });

    expect(node).not.toHaveProperty("aggregateRating");
    expect(node).not.toHaveProperty("review");
    expect(node).not.toHaveProperty("offers");
    expect(node).not.toHaveProperty("wordCount");
  });
});
