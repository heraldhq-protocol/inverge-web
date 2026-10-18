import { describe, expect, it } from "vitest";

import {
  isCurrentNavigationHref,
  mobileSectionHref,
} from "@/features/app-shell/lib/navigation";

describe("isCurrentNavigationHref", () => {
  it("marks only home current on the dashboard root", () => {
    expect(isCurrentNavigationHref("/d", "/d")).toBe(true);
    expect(isCurrentNavigationHref("/d", "/d/discover")).toBe(false);
    expect(isCurrentNavigationHref("/d", "/d/creator/ideas")).toBe(false);
  });

  it("keeps a section current across its child routes", () => {
    expect(
      isCurrentNavigationHref("/d/creator/ideas", "/d/creator/ideas"),
    ).toBe(true);
    expect(
      isCurrentNavigationHref("/d/creator/ideas/new", "/d/creator/ideas"),
    ).toBe(true);
    expect(
      isCurrentNavigationHref(
        "/d/creator/ideas/skill-circle/feedback",
        "/d/creator/ideas",
      ),
    ).toBe(true);
    expect(
      isCurrentNavigationHref("/d/notifications", "/d/notifications"),
    ).toBe(true);
  });

  it("gives the analytics workspace to Creator Studio, not to My ideas", () => {
    expect(
      isCurrentNavigationHref(
        "/d/creator/ideas/skill-circle/insights/supporters",
        "/d/creator/ideas",
      ),
    ).toBe(false);
    expect(
      isCurrentNavigationHref(
        "/d/creator/ideas/skill-circle/insights/supporters",
        "/d/creator",
      ),
    ).toBe(true);
    expect(isCurrentNavigationHref("/d/creator/analytics", "/d/creator")).toBe(
      true,
    );
    expect(isCurrentNavigationHref("/d/creator", "/d/creator")).toBe(true);
  });

  it("keeps the feedback inbox with Studio and the list on its own item", () => {
    expect(isCurrentNavigationHref("/d/creator/feedback", "/d/creator")).toBe(
      true,
    );
    expect(
      isCurrentNavigationHref("/d/creator/feedback", "/d/creator/ideas"),
    ).toBe(false);
    expect(isCurrentNavigationHref("/d/creator/ideas", "/d/creator")).toBe(
      false,
    );
  });

  it("gives the campaign list its own highlight, not Creator Studio's", () => {
    expect(
      isCurrentNavigationHref("/d/creator/campaigns", "/d/creator/campaigns"),
    ).toBe(true);
    expect(
      isCurrentNavigationHref(
        "/d/creator/campaigns/solar-mini-grid/new",
        "/d/creator/campaigns",
      ),
    ).toBe(true);
    expect(isCurrentNavigationHref("/d/creator/campaigns", "/d/creator")).toBe(
      false,
    );
    expect(
      isCurrentNavigationHref("/d/creator/campaigns", "/d/creator/ideas"),
    ).toBe(false);
  });

  it("keeps a backing record with the backing history", () => {
    expect(isCurrentNavigationHref("/d/backing", "/d/backing")).toBe(true);
    expect(
      isCurrentNavigationHref("/d/backing/contribution-1", "/d/backing"),
    ).toBe(true);
    expect(isCurrentNavigationHref("/d/backing", "/d/pre-pledges")).toBe(false);
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
    expect(mobileSectionHref("/d/creator/ideas/new")).toBe("/d/creator/ideas");
    expect(mobileSectionHref("/d/discover")).toBe("/d/discover");
  });
});
