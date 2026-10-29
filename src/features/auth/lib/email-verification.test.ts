import { describe, expect, it } from "vitest";

import {
  maskEmail,
  parseEmailVerificationResult,
  parseEmailVerificationStatus,
} from "@/features/auth/lib/email-verification";

describe("maskEmail", () => {
  it("keeps only the first local character and the domain", () => {
    expect(maskEmail("ada.lovelace@example.com")).toBe("a***@example.com");
    expect(maskEmail("a@example.com")).toBe("a***@example.com");
  });

  it("returns null for a missing address instead of a fake one", () => {
    expect(maskEmail(null)).toBeNull();
    expect(maskEmail("not-an-email")).toBe("not-an-email");
  });
});

describe("parseEmailVerificationStatus", () => {
  it("accepts the API projection and drops unknown fields", () => {
    const status = parseEmailVerificationStatus({
      challenge: {
        attemptsRemaining: 4,
        email: "ada@example.com",
        expiresAt: "2026-10-29T12:10:00.000Z",
        purpose: "SIGNUP",
        resendAvailableAt: "2026-10-29T12:01:00.000Z",
        secret: "must not survive",
      },
      email: "ada@example.com",
      pendingEmail: null,
      pendingRequestedAt: null,
      verified: false,
      verifiedAt: null,
    });

    expect(status).toEqual({
      challenge: {
        attemptsRemaining: 4,
        email: "ada@example.com",
        expiresAt: "2026-10-29T12:10:00.000Z",
        purpose: "SIGNUP",
        resendAvailableAt: "2026-10-29T12:01:00.000Z",
      },
      email: "ada@example.com",
      pendingEmail: null,
      pendingRequestedAt: null,
      verified: false,
      verifiedAt: null,
    });
  });

  it("rejects a payload without a boolean verified field", () => {
    expect(parseEmailVerificationStatus({ email: "ada@example.com" })).toBeNull();
    expect(parseEmailVerificationStatus(null)).toBeNull();
  });

  it("drops a challenge with an unparseable expiry", () => {
    expect(
      parseEmailVerificationStatus({
        challenge: {
          email: "ada@example.com",
          expiresAt: "not-a-date",
          purpose: "SIGNUP",
          resendAvailableAt: "2026-10-29T12:01:00.000Z",
        },
        verified: false,
      })?.challenge,
    ).toBeNull();
  });
});

describe("parseEmailVerificationResult", () => {
  it("keeps the code-sent timing fields", () => {
    expect(
      parseEmailVerificationResult({
        email: "ada@example.com",
        expiresAt: "2026-10-29T12:10:00.000Z",
        resendAvailableAt: "2026-10-29T12:01:00.000Z",
        status: "code_sent",
      }),
    ).toEqual({
      email: "ada@example.com",
      expiresAt: "2026-10-29T12:10:00.000Z",
      resendAvailableAt: "2026-10-29T12:01:00.000Z",
      status: "code_sent",
    });
  });

  it("accepts an already-verified result without inventing timings", () => {
    expect(
      parseEmailVerificationResult({
        email: "ada@example.com",
        status: "already_verified",
      }),
    ).toEqual({ email: "ada@example.com", status: "already_verified" });
  });

  it("accepts a verified result", () => {
    expect(
      parseEmailVerificationResult({
        email: "ada@example.com",
        status: "verified",
      }),
    ).toEqual({ email: "ada@example.com", status: "verified" });
  });

  it("rejects malformed responses", () => {
    expect(parseEmailVerificationResult({ status: "code_sent" })).toBeNull();
    expect(
      parseEmailVerificationResult({ email: "ada@example.com", status: "other" }),
    ).toBeNull();
  });
});
