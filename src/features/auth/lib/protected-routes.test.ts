import { describe, expect, it } from "vitest";

import {
  isProtectedPath,
  signInHrefFor,
} from "@/features/auth/lib/protected-routes";

describe("protected routes", () => {
  it("protects the dashboard root and every nested route", () => {
    expect(isProtectedPath("/d")).toBe(true);
    expect(isProtectedPath("/d/creator/campaigns/abc")).toBe(true);
    expect(isProtectedPath("/admin/verification/abc")).toBe(true);
  });

  it("does not protect public or lookalike paths", () => {
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/ideas")).toBe(false);
    expect(isProtectedPath("/u/amara")).toBe(false);
    expect(isProtectedPath("/dashboard")).toBe(false);
    expect(isProtectedPath("/d-archive")).toBe(false);
  });

  it("preserves the requested path and query in the sign-in link", () => {
    expect(signInHrefFor("/d/creator", "?tab=drafts")).toBe(
      "/auth?next=%2Fd%2Fcreator%3Ftab%3Ddrafts",
    );
  });

  it("drops a return path that would loop through sign-in", () => {
    expect(signInHrefFor("/auth")).toBe("/auth");
  });
});
