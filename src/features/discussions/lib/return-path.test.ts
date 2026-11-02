import { describe, expect, it } from "vitest";

import { safeReturnPath } from "@/features/auth/lib/auth-routes";
import { withComposeIntent } from "@/features/discussions/lib/return-path";

describe("withComposeIntent", () => {
  it("adds the composer hint without changing the destination", () => {
    expect(withComposeIntent("/ideas/idea-1")).toBe(
      "/ideas/idea-1?compose=1",
    );
    expect(withComposeIntent("/campaigns/community-power?tab=discussion")).toBe(
      "/campaigns/community-power?tab=discussion&compose=1",
    );
  });

  it("keeps a fragment", () => {
    expect(withComposeIntent("/ideas/idea-1#idea-discussion")).toBe(
      "/ideas/idea-1?compose=1#idea-discussion",
    );
  });

  it("never introduces an off-site destination", () => {
    expect(withComposeIntent("https://evil.test/idea")).toBe("/");
    expect(withComposeIntent("//evil.test/idea")).toBe("/");
  });

  it("round-trips through the auth destination sanitiser", () => {
    const href = safeReturnPath(withComposeIntent("/ideas/idea-1"));
    expect(href).toBe("/ideas/idea-1?compose=1");
  });
});
