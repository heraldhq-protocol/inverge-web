import { describe, expect, it } from "vitest";

import { isSameOriginRequest } from "@/features/auth/server/origin";

function post(url: string, origin?: string): Request {
  const headers = new Headers();
  if (origin !== undefined) headers.set("origin", origin);

  return new Request(url, { headers, method: "POST" });
}

describe("isSameOriginRequest", () => {
  it("accepts a browser request from this app", () => {
    expect(
      isSameOriginRequest(
        post(
          "https://inverge.africa/api/auth/session",
          "https://inverge.africa",
        ),
      ),
    ).toBe(true);
  });

  it("rejects another site posting its own provider token", () => {
    expect(
      isSameOriginRequest(
        post("https://inverge.africa/api/auth/session", "https://evil.test"),
      ),
    ).toBe(false);
  });

  it("rejects a request with no origin", () => {
    expect(
      isSameOriginRequest(post("https://inverge.africa/api/auth/session")),
    ).toBe(false);
  });

  it("rejects an opaque origin", () => {
    expect(
      isSameOriginRequest(
        post("https://inverge.africa/api/auth/session", "null"),
      ),
    ).toBe(false);
  });

  it("compares scheme and port, not only the host", () => {
    expect(
      isSameOriginRequest(
        post("http://localhost:3001/api/auth/session", "http://localhost:3000"),
      ),
    ).toBe(false);
    expect(
      isSameOriginRequest(
        post(
          "https://inverge.africa/api/auth/session",
          "http://inverge.africa",
        ),
      ),
    ).toBe(false);
  });
});
