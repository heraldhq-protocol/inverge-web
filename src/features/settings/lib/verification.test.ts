import { describe, expect, it } from "vitest";

import { verificationBadge } from "@/features/settings/lib/verification";

const base = {
  amlStatus: null,
  kycStatus: null,
  latestCaseAt: null,
  latestCaseStatus: null,
};

describe("verificationBadge", () => {
  it.each([
    ["APPROVED", "Verified", "success"],
    ["IN_REVIEW", "In review", "warning"],
    ["DECLINED", "Needs attention", "danger"],
    [null, "Not started", "neutral"],
  ] as const)("maps %s to %s", (latestCaseStatus, label, tone) => {
    expect(verificationBadge({ ...base, latestCaseStatus })).toEqual({
      label,
      tone,
    });
  });

  it("falls back to the KYC status when no case exists", () => {
    expect(verificationBadge({ ...base, kycStatus: "VERIFIED" })).toEqual({
      label: "Verified",
      tone: "success",
    });
  });
});
