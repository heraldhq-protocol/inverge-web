import { describe, expect, it } from "vitest";

import { ideaViewHref } from "@/features/ideas/lib/idea-link";

describe("ideaViewHref", () => {
  it("adds a closed source value to an idea link", () => {
    expect(ideaViewHref("skill-circle", "feed")).toBe(
      "/ideas/skill-circle?source=feed",
    );
    expect(ideaViewHref("skill-circle", "search")).toBe(
      "/ideas/skill-circle?source=search",
    );
    expect(ideaViewHref("skill-circle", "internal")).toBe(
      "/ideas/skill-circle?source=internal",
    );
  });

  it("leaves shared and typed links without a source parameter", () => {
    expect(ideaViewHref("skill-circle")).toBe("/ideas/skill-circle");
  });

  it("encodes an identifier rather than treating it as a path", () => {
    expect(ideaViewHref("idea/with spaces", "feed")).toBe(
      "/ideas/idea%2Fwith%20spaces?source=feed",
    );
  });
});
