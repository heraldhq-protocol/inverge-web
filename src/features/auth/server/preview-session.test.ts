import { describe, expect, it } from "vitest";

import { previewSubjectFromIdToken } from "@/features/auth/server/preview-session";

function token(payload: Record<string, unknown>): string {
  const part = (value: unknown) =>
    Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
  return `${part({ alg: "ES256", typ: "JWT" })}.${part(payload)}.signature`;
}

describe("previewSubjectFromIdToken", () => {
  it("derives a stable hashed subject from sub", () => {
    const first = previewSubjectFromIdToken(
      token({ sub: "google|user-1", exp: Math.floor(Date.now() / 1000) + 60 }),
    );
    const second = previewSubjectFromIdToken(
      token({ sub: "google|user-1", exp: Math.floor(Date.now() / 1000) + 60 }),
    );

    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(second).toBe(first);
    expect(first).not.toContain("google");
  });

  it("falls back to the verifier pair when sub is absent", () => {
    const subject = previewSubjectFromIdToken(
      token({
        authConnection: "google",
        userId: "user-1",
        exp: Math.floor(Date.now() / 1000) + 60,
      }),
    );

    expect(subject).toMatch(/^[a-f0-9]{64}$/);
  });

  it("falls back to a lower-cased email", () => {
    const upper = previewSubjectFromIdToken(
      token({ email: "Amara@Example.test", exp: 9_999_999_999 }),
    );
    const lower = previewSubjectFromIdToken(
      token({ email: "amara@example.test", exp: 9_999_999_999 }),
    );

    expect(upper).toBe(lower);
  });

  it("rejects an expired token", () => {
    expect(
      previewSubjectFromIdToken(
        token({ sub: "google|user-1", exp: Math.floor(Date.now() / 1000) - 1 }),
      ),
    ).toBeNull();
  });

  it("rejects an issued-at time far in the future", () => {
    expect(
      previewSubjectFromIdToken(
        token({
          sub: "google|user-1",
          iat: Math.floor(Date.now() / 1000) + 120,
        }),
      ),
    ).toBeNull();
  });

  it("rejects a token with no stable subject", () => {
    expect(previewSubjectFromIdToken(token({ email: "" }))).toBeNull();
  });

  it("rejects a malformed token", () => {
    expect(previewSubjectFromIdToken("not-a-jwt")).toBeNull();
    expect(previewSubjectFromIdToken("a.!!!!.c")).toBeNull();
  });
});
