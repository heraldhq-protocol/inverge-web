import { describe, expect, it } from "vitest";

import { createRateLimiter } from "@/lib/api/rate-limit";

describe("createRateLimiter", () => {
  it("allows requests up to the limit and then reports the wait", () => {
    const limiter = createRateLimiter(2, 10_000);

    expect(limiter.check("client", 1_000)).toEqual({
      allowed: true,
      remaining: 1,
    });
    expect(limiter.check("client", 1_001)).toEqual({
      allowed: true,
      remaining: 0,
    });
    expect(limiter.check("client", 1_002)).toEqual({
      allowed: false,
      retryAfterSeconds: 9,
    });
  });

  it("keeps separate windows per client and resets after the window", () => {
    const limiter = createRateLimiter(1, 5_000);

    expect(limiter.check("a", 0).allowed).toBe(true);
    expect(limiter.check("a", 1_000).allowed).toBe(false);
    expect(limiter.check("b", 1_000).allowed).toBe(true);
    expect(limiter.check("a", 5_001).allowed).toBe(true);
  });
});
