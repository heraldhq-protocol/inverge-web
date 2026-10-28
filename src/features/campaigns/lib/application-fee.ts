/**
 * The application-fee projection the wizard is allowed to see.
 *
 * The API owns the price, the charge, and the payment provider's state. This
 * module only narrows that projection so a malformed or unexpected response
 * cannot reach the UI as a paid state. The fee is non-refundable (FR-311), so a
 * display bug must never be able to make an unpaid campaign look ready.
 */

export type ApplicationFeeStatus = "NONE" | "PENDING" | "SUCCEEDED" | "FAILED";

export type DraftApplicationFee = {
  amount: number;
  chargeId: string | null;
  currency: string;
  redirectUrl: string | null;
  status: ApplicationFeeStatus;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function appFeeStatus(value: unknown): ApplicationFeeStatus | null {
  return value === "NONE" ||
    value === "PENDING" ||
    value === "SUCCEEDED" ||
    value === "FAILED"
    ? value
    : null;
}

/**
 * Only an HTTP(S) checkout URL may leave this boundary. The provider returns an
 * absolute URL today, but a malformed or compromised response must not become a
 * `javascript:` navigation in the browser.
 */
export function safeApplicationFeeRedirect(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function readApplicationFee(value: unknown): DraftApplicationFee | null {
  const record = asRecord(value);
  if (!record) return null;

  const status = appFeeStatus(record.status);
  if (status === null) return null;

  const amount =
    typeof record.amount === "number" &&
    Number.isFinite(record.amount) &&
    record.amount >= 0
      ? record.amount
      : 0;

  const currency =
    typeof record.currency === "string" && /^[A-Z]{3}$/.test(record.currency)
      ? record.currency
      : "NGN";

  return {
    amount,
    chargeId:
      typeof record.chargeId === "string" && record.chargeId.length > 0
        ? record.chargeId
        : null,
    currency,
    redirectUrl: safeApplicationFeeRedirect(record.redirectUrl),
    status,
  };
}

export function isApplicationFeePaid(fee: DraftApplicationFee | null): boolean {
  return fee?.status === "SUCCEEDED";
}
