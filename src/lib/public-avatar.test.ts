import { describe, expect, it } from "vitest";

import { safeAvatarUrl } from "@/lib/public-avatar";

describe("safeAvatarUrl", () => {
  it("#given an uploaded asset reference #then it is kept as stored", () => {
    expect(safeAvatarUrl("/api/media/clx0mediaasset0001abcdef")).toBe(
      "/api/media/clx0mediaasset0001abcdef",
    );
  });

  it("#given a provider avatar on an allowlisted host #then it is allowed", () => {
    expect(
      safeAvatarUrl("https://lh3.googleusercontent.com/a/ACg8oc-example=s96-c"),
    ).toBe("https://lh3.googleusercontent.com/a/ACg8oc-example=s96-c");
  });

  it("#given a foreign host #then it is rejected", () => {
    expect(safeAvatarUrl("https://evil.test/avatar.png")).toBeNull();
  });

  it("#given a media path that is not a real asset id #then it is rejected", () => {
    expect(safeAvatarUrl("/api/media/../../etc/passwd")).toBeNull();
    expect(safeAvatarUrl("/api/media/")).toBeNull();
  });

  it("#given a non-https scheme #then it is rejected", () => {
    expect(safeAvatarUrl("javascript:alert(1)")).toBeNull();
    expect(safeAvatarUrl("http://lh3.googleusercontent.com/a/x")).toBeNull();
  });
});
