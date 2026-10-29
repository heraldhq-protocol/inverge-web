/**
 * Wire shapes for the email-verification BFF.
 *
 * Kept free of `server-only` imports so the client card and the server route can
 * share the same parser. The API is still the authority; these helpers only
 * narrow what crosses the boundary.
 */

export type EmailVerificationChallenge = {
  email: string;
  purpose: "SIGNUP" | "CHANGE";
  expiresAt: string;
  resendAvailableAt: string;
  attemptsRemaining: number;
};

export type EmailVerificationStatus = {
  email: string | null;
  verified: boolean;
  verifiedAt: string | null;
  pendingEmail: string | null;
  pendingRequestedAt: string | null;
  challenge: EmailVerificationChallenge | null;
};

export type EmailVerificationResult =
  | {
      status: "code_sent";
      email: string;
      expiresAt: string;
      resendAvailableAt: string;
    }
  | { status: "already_verified"; email: string }
  | { status: "verified"; email: string };

const EMAIL_VERIFICATION_ERRORS = new Set([
  "EMAIL_CODE_EXPIRED",
  "EMAIL_CODE_INVALID",
  "EMAIL_DELIVERY_FAILED",
  "EMAIL_INVALID",
  "EMAIL_NO_ACTIVE_CODE",
  "EMAIL_RATE_LIMITED",
  "EMAIL_RESEND_COOLDOWN",
  "EMAIL_TOO_MANY_ATTEMPTS",
  "EMAIL_UNAVAILABLE",
  "EMAIL_VERIFICATION_REQUIRED",
]);

export function isEmailVerificationError(value: unknown): value is string {
  return typeof value === "string" && EMAIL_VERIFICATION_ERRORS.has(value);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function asDateString(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  return Number.isNaN(Date.parse(value)) ? null : value;
}

export function parseEmailVerificationStatus(
  payload: unknown,
): EmailVerificationStatus | null {
  const record = asRecord(payload);
  if (!record || typeof record.verified !== "boolean") return null;

  const rawChallenge = asRecord(record.challenge);
  const challengeEmail =
    typeof rawChallenge?.email === "string" ? rawChallenge.email : null;
  const expiresAt = asDateString(rawChallenge?.expiresAt);
  const resendAvailableAt = asDateString(rawChallenge?.resendAvailableAt);
  const purpose =
    rawChallenge?.purpose === "CHANGE" || rawChallenge?.purpose === "SIGNUP"
      ? rawChallenge.purpose
      : null;

  return {
    challenge:
      rawChallenge &&
      challengeEmail &&
      expiresAt &&
      resendAvailableAt &&
      purpose
        ? {
            email: challengeEmail,
            purpose,
            expiresAt,
            resendAvailableAt,
            attemptsRemaining:
              typeof rawChallenge.attemptsRemaining === "number"
                ? rawChallenge.attemptsRemaining
                : 0,
          }
        : null,
    email: typeof record.email === "string" ? record.email : null,
    pendingEmail:
      typeof record.pendingEmail === "string" ? record.pendingEmail : null,
    pendingRequestedAt: asDateString(record.pendingRequestedAt),
    verified: record.verified,
    verifiedAt: asDateString(record.verifiedAt),
  };
}

export function parseEmailVerificationResult(
  payload: unknown,
): EmailVerificationResult | null {
  const record = asRecord(payload);
  if (!record || typeof record.email !== "string") return null;

  if (record.status === "already_verified") {
    return { status: "already_verified", email: record.email };
  }
  if (record.status === "verified") {
    return { status: "verified", email: record.email };
  }

  const expiresAt = asDateString(record.expiresAt);
  const resendAvailableAt = asDateString(record.resendAvailableAt);
  if (record.status === "code_sent" && expiresAt && resendAvailableAt) {
    return {
      status: "code_sent",
      email: record.email,
      expiresAt,
      resendAvailableAt,
    };
  }

  return null;
}

/** `ada.lovelace@example.com` -> `a***@example.com`. */
export function maskEmail(email: string | null): string | null {
  if (!email) return null;
  const at = email.lastIndexOf("@");
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  return `${local.slice(0, 1)}***@${domain}`;
}
