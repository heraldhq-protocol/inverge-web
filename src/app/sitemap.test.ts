import { afterEach, describe, expect, it, vi } from "vitest";

import sitemap from "@/app/sitemap";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { previewTopics } from "@/features/ideas/content/topics";
import { allPublicIdeas } from "@/features/ideas/lib/catalog";
import { guides, journalEntries } from "@/features/marketing/content/editorial";

afterEach(() => {
  vi.unstubAllEnvs();
});

const PRIVATE_PREFIXES = [
  "/admin",
  "/api",
  "/auth",
  "/d",
  "/onboarding",
  "/sign-out",
];

function pathsOf(entries: ReturnType<typeof sitemap>): string[] {
  return entries.map((entry) => new URL(entry.url).pathname);
}

describe("sitemap", () => {
  it("emits only absolute URLs on the canonical origin", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://inverge.africa");

    for (const entry of sitemap()) {
      expect(entry.url).toMatch(
        /^https:\/\/inverge\.africa\/(?:[a-zA-Z0-9\-/_]*)$/,
      );
    }
  });

  it("lists no private, service, or share-image route", () => {
    for (const path of pathsOf(sitemap())) {
      expect(path).not.toBe("/og");
      expect(
        PRIVATE_PREFIXES.some(
          (prefix) => path === prefix || path.startsWith(`${prefix}/`),
        ),
      ).toBe(false);
    }
  });

  it("never collapses every dynamic page onto one canonical path", () => {
    const paths = pathsOf(sitemap());

    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toContain("/");
    expect(paths.filter((path) => path === "/").length).toBe(1);
  });

  it("lists an entry for every public discovery idea", () => {
    const catalogue = allPublicIdeas(ideasPreviewData);
    const expected = catalogue
      .filter((idea) => idea.visibility === "public")
      .map((idea) => `/ideas/${idea.id}`);
    const actual = pathsOf(sitemap()).filter((path) =>
      path.startsWith("/ideas/"),
    );

    expect(new Set(actual)).toEqual(new Set(expected));
    expect(actual.length).toBeGreaterThan(0);
  });

  it("covers every guide and journal entry", () => {
    const paths = pathsOf(sitemap());

    for (const guide of guides) {
      expect(paths).toContain(`/guides/${guide.slug}`);
    }
    for (const entry of journalEntries) {
      expect(paths).toContain(`/blog/${entry.slug}`);
    }
  });

  it("covers a topic only when it has at least one public idea", () => {
    const paths = pathsOf(sitemap());
    const publicIds = new Set(
      allPublicIdeas(ideasPreviewData)
        .filter((idea) => idea.visibility === "public")
        .map((idea) => idea.id),
    );

    const publishable = previewTopics.filter((topic) =>
      topic.ideaIds.some((id) => publicIds.has(id)),
    );

    for (const topic of publishable) {
      expect(paths).toContain(`/topics/${topic.slug}`);
    }
    expect(publishable.length).toBeGreaterThan(0);
  });
});
