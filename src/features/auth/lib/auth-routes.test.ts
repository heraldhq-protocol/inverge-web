import { describe, expect, it } from "vitest";

import { authHref, safeReturnPath } from "@/features/auth/lib/auth-routes";

describe("safeReturnPath", () => {
  it("keeps a same-site path", () => {
    expect(safeReturnPath("/d/wallet")).toBe("/d/wallet");
    expect(safeReturnPath(["/d/backing"])).toBe("/d/backing");
  });

  it("falls back to the dashboard when no value is given", () => {
    expect(safeReturnPath(undefined)).toBe("/d");
    expect(safeReturnPath("")).toBe("/d");
  });

  it("rejects values that would leave the site", () => {
    for (const candidate of [
      "https://evil.test",
      "//evil.test",
      "/\\evil.test",
      "javascript:alert(1)",
      "/d\u0000evil",
      "/auth",
      "/auth?next=%2Fauth",
      "/sign-out",
    ]) {
      expect(safeReturnPath(candidate)).toBe("/d");
    }
  });
});

describe("authHref", () => {
  it("omits the default destination", () => {
    expect(authHref()).toBe("/auth");
    expect(authHref("/d")).toBe("/auth");
  });

  it("carries a specific destination through the sign-in link", () => {
    expect(authHref("/d/wallet")).toBe("/auth?next=%2Fd%2Fwallet");
  });

  it("never links to an off-site destination", () => {
    expect(authHref("https://evil.test")).toBe("/auth");
  });

  it("carries creator intent without inventing a destination", () => {
    expect(authHref(undefined, "creator")).toBe("/auth?intent=creator");
  });

  it("carries both a destination and creator intent", () => {
    expect(authHref("/d/wallet", "creator")).toBe(
      "/auth?next=%2Fd%2Fwallet&intent=creator",
    );
  });
});
