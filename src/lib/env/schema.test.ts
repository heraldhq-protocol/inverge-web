import { describe, expect, it } from "vitest";

import { parseEnvironment } from "@/lib/env/schema";

describe("parseEnvironment", () => {
  it("uses development when Next.js has not set NODE_ENV yet", () => {
    expect(parseEnvironment({})).toEqual({ NODE_ENV: "development" });
  });

  it("rejects unsupported runtime environments", () => {
    expect(() => parseEnvironment({ NODE_ENV: "staging" })).toThrow();
  });
});
