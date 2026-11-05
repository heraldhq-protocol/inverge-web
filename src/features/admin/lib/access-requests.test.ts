import { describe, expect, it } from "vitest";

import {
  accessDecisionSchema,
  accessStatusLabel,
  adminAccessRequestSchema,
  matchesAccessDecision,
} from "./access-requests";
import { aiAccessHref, parseAiAccessQuery } from "./ai-access";

const request = {
  id: "grant-1",
  userId: "user-1",
  email: "builder@example.com",
  status: "APPROVED" as const,
  source: "ADMIN" as const,
  requestedAt: "2026-11-01T09:00:00.000Z",
  decidedAt: "2026-11-05T09:00:00.000Z",
  expiresAt: null,
};

describe("admin access contracts (FR-901, D-055)", () => {
  it("rejects malformed dates and unknown lifecycle states from the API", () => {
    expect(
      adminAccessRequestSchema.safeParse({
        ...request,
        requestedAt: "not-a-date",
      }).success,
    ).toBe(false);
    expect(
      adminAccessRequestSchema.safeParse({ ...request, status: "ACTIVE" })
        .success,
    ).toBe(false);
  });
  it("accepts an approval with an explicit future instant or no expiry", () => {
    expect(
      accessDecisionSchema.safeParse({
        status: "APPROVED",
        expiresAt: "2099-01-01T12:00:00+01:00",
      }).success,
    ).toBe(true);
    expect(accessDecisionSchema.safeParse({ status: "APPROVED" }).success).toBe(
      true,
    );
  });
  it("rejects expired approvals, rejection expiries, and extra privilege fields", () => {
    for (const input of [
      { status: "APPROVED", expiresAt: "2020-01-01T00:00:00Z" },
      { status: "REJECTED", expiresAt: "2099-01-01T00:00:00Z" },
      { status: "APPROVED", role: "ADMIN" },
    ])
      expect(accessDecisionSchema.safeParse(input).success).toBe(false);
  });
  it("requires the intended record, decision and expiry in a confirmation", () => {
    expect(
      matchesAccessDecision(request, "grant-1", { status: "APPROVED" }),
    ).toBe(true);
    expect(
      matchesAccessDecision(request, "grant-2", { status: "APPROVED" }),
    ).toBe(false);
    expect(
      matchesAccessDecision({ ...request, decidedAt: null }, "grant-1", {
        status: "APPROVED",
      }),
    ).toBe(false);
    expect(
      matchesAccessDecision(request, "grant-1", { status: "REJECTED" }),
    ).toBe(false);
    expect(
      matchesAccessDecision(request, "grant-1", {
        status: "APPROVED",
        expiresAt: "2099-01-01T00:00:00Z",
      }),
    ).toBe(false);
  });
  it("labels an expired approval without inventing an API filter", () => {
    expect(
      accessStatusLabel(
        { ...request, expiresAt: "2026-11-02T00:00:00Z" },
        "2026-11-05T00:00:00Z",
      ),
    ).toBe("Expired approval");
    expect(parseAiAccessQuery({ status: "EXPIRED", limit: "100000" })).toEqual({
      status: "PENDING",
      limit: 50,
    });
    expect(aiAccessHref({ status: "APPROVED", limit: 200 })).toBe(
      "/admin/ai-access?status=APPROVED&limit=200",
    );
  });
});
