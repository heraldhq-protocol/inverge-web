import { describe, expect, it } from "vitest";

import { safeAvatarUrl } from "@/lib/public-avatar";

describe("safeAvatarUrl", () => {
  it("accepts a Google profile image", () => {
    expect(
      safeAvatarUrl("https://lh3.googleusercontent.com/a/ACg8oc-example=s96-c"),
    ).toBe("https://lh3.googleusercontent.com/a/ACg8oc-example=s96-c");
  });

  it("accepts the existing Unsplash fixture path", () => {
    expect(safeAvatarUrl("https://images.unsplash.com/photo-1")).toBe(
      "https://images.unsplash.com/photo-1",
    );
  });

  it("rejects a host outside the allowlist", () => {
    expect(safeAvatarUrl("https://evil.test/avatar.png")).toBeNull();
  });

  it("rejects a non-HTTPS URL, credentials and unsupported paths", () => {
    expect(
      safeAvatarUrl("http://lh3.googleusercontent.com/a/example"),
    ).toBeNull();
    expect(
      safeAvatarUrl("https://user:pass@lh3.googleusercontent.com/a/example"),
    ).toBeNull();
    expect(
      safeAvatarUrl("https://lh3.googleusercontent.com/not-a-profile"),
    ).toBeNull();
    expect(safeAvatarUrl("https://images.unsplash.com/avatar.png")).toBeNull();
  });

  it("rejects malformed and overlong values", () => {
    expect(safeAvatarUrl("not a url")).toBeNull();
    expect(safeAvatarUrl(123)).toBeNull();
    expect(
      safeAvatarUrl(`https://lh3.googleusercontent.com/a/${"x".repeat(2048)}`),
    ).toBeNull();
  });
});
