import type { IdentityBadge } from "@/features/settings/components/account-identity-card";
import type { SettingsVerification } from "@/features/settings/types";

/**
 * A settings-safe summary of provider state. The provider label is never shown:
 * only whether the account is clear, waiting, or needs action.
 */
export function verificationBadge(
  verification: SettingsVerification,
): IdentityBadge {
  const status = (
    verification.latestCaseStatus ??
    verification.kycStatus ??
    ""
  ).toUpperCase();

  if (status === "VERIFIED" || status === "APPROVED") {
    return { label: "Verified", tone: "success" };
  }
  if (
    status === "PENDING" ||
    status === "SESSION_CREATED" ||
    status === "AWAITING_USER" ||
    status === "SUBMITTED" ||
    status === "IN_REVIEW"
  ) {
    return { label: "In review", tone: "warning" };
  }
  if (
    status === "DECLINED" ||
    status === "REJECTED" ||
    status === "ACTION_REQUIRED" ||
    status === "EXPIRED" ||
    status === "ERROR"
  ) {
    return { label: "Needs attention", tone: "danger" };
  }
  return { label: "Not started", tone: "neutral" };
}
