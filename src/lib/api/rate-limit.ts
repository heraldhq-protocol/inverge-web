export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

type Bucket = {
  count: number;
  resetAt: number;
};

/**
 * An in-process fixed-window limiter for BFF routes.
 *
 * This is best-effort by design: it stops one client from flooding a route on a
 * single instance. A distributed attacker needs the edge or the API's own
 * limiter; do not present this as a security boundary.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const buckets = new Map<string, Bucket>();

  function prune(nowMs: number) {
    if (buckets.size < 1_000) return;
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= nowMs) buckets.delete(key);
    }
  }

  return {
    check(key: string, nowMs: number = Date.now()): RateLimitResult {
      const existing = buckets.get(key);

      if (!existing || existing.resetAt <= nowMs) {
        buckets.set(key, { count: 1, resetAt: nowMs + windowMs });
        prune(nowMs);
        return { allowed: true, remaining: limit - 1 };
      }

      if (existing.count >= limit) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((existing.resetAt - nowMs) / 1_000),
          ),
        };
      }

      existing.count += 1;
      return { allowed: true, remaining: limit - existing.count };
    },
    reset() {
      buckets.clear();
    },
  };
}
