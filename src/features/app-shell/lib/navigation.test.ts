import { describe, expect, it } from "vitest";

import {
  isCurrentNavigationHref,
  mobileSectionHref,
} from "@/features/app-shell/lib/navigation";

describe("isCurrentNavigationHref", () => {
  it("marks only home current on the dashboard root", () => {
    expect(isCurrentNavigationHref("/d", "/d")).toBe(true);
    expect(isCurrentNavigationHref("/d", "/d/discover")).toBe(false);
    expect(isCurrentNavigationHref("/d", "/d/ideas")).toBe(false);
  });

  it("keeps a section current across its child routes", () => {
    expect(isCurrentNavigationHref("/d/ideas", "/d/ideas")).toBe(true);
    expect(isCurrentNavigationHref("/d/ideas/new", "/d/ideas")).toBe(true);
    expect(
      isCurrentNavigationHref("/d/ideas/skill-circle/feedback", "/d/ideas"),
    ).toBe(true);
    expect(isCurrentNavigationHref("/d/notifications", "/d/notifications")).toBe(
      true,
    );
  });

  it("gives the analytics workspace to Creator Studio, not to My ideas", () => {
    expect(
      isCurrentNavigationHref(
        "/d/ideas/skill-circle/insights/supporters",
        "/d/ideas",
      ),
    ).toBe(false);
    expect(
      isCurrentNavigationHref(
        "/d/ideas/skill-circle/insights/supporters",
        "/d/creator",
      ),
    ).toBe(true);
    expect(isCurrentNavigationHref("/d/creator", "/d/creator")).toBe(true);
  });

  it("does not treat discovery as a creator route", () => {
    expect(isCurrentNavigationHref("/d/discover", "/d/discover")).toBe(true);
    expect(isCurrentNavigationHref("/d/discover", "/d/creator")).toBe(false);
  });

  it("matches the guides index and its articles", () => {
    expect(isCurrentNavigationHref("/guides", "/guides")).toBe(true);
    expect(
      isCurrentNavigationHref("/guides/validating-an-idea", "/guides"),
    ).toBe(true);
  });
});

describe("mobileSectionHref", () => {
  it("highlights My ideas while the creation flow is open", () => {
    expect(mobileSectionHref("/d/ideas/new")).toBe("/d/ideas");
    expect(mobileSectionHref("/d/discover")).toBe("/d/discover");
  });
});
