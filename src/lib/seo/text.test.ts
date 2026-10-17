import { describe, expect, it } from "vitest";

import { sanitizeText, truncateText } from "@/lib/seo/text";

describe("truncateText", () => {
  it("returns the value unchanged when it fits", () => {
    expect(truncateText("Short", 20)).toBe("Short");
  });

  it("returns an empty string for a non-positive budget", () => {
    expect(truncateText("Anything", 0)).toBe("");
    expect(truncateText("Anything", -1)).toBe("");
  });

  it("reserves one character for the ellipsis so the result never exceeds the budget", () => {
    const result = truncateText("abcdefghij", 5);

    expect(result).toBe("abcd…");
    expect(result.length).toBe(5);
  });
});

describe("sanitizeText", () => {
  it("collapses whitespace and trims", () => {
    expect(sanitizeText("  a   b \n c  ", 40)).toBe("a b c");
  });

  it("replaces control characters with a space rather than deleting them", () => {
    expect(sanitizeText("a\u0000b\u001fc", 40)).toBe("a b c");
  });

  it("truncates after normalising", () => {
    expect(sanitizeText("aaaa        bbbb", 6)).toBe("aaaa…");
  });

  it("returns an empty string for whitespace-only input", () => {
    expect(sanitizeText("   \n\t ", 40)).toBe("");
  });
});
