import { describe, expect, it } from "vitest";

import {
  matchesScreening,
  moderationCaseSchema,
  screenContentSchema,
} from "./moderation";

const record = {
  id: "screen-1",
  kind: "idea",
  ideaId: null,
  campaignId: null,
  submittedById: "admin-1",
  decision: "HELD_FOR_REVIEW",
  maxRisk: "0.8500",
  categories: [
    {
      code: "POL-SEC",
      riskScore: 0.85,
      excerpt: "guaranteed returns",
      draftReason: "Remove the return claim.",
    },
  ],
  reasonCodes: ["POL-SEC"],
  internalReason: "Return claim found.",
  externalReason: "Remove the return claim.",
  brief: "Review the claim.",
  provider: "stub",
  policyVersion: "2026-07-25",
  createdAt: "2026-11-05T12:00:00Z",
};

describe("screening contracts (FR-901, NFR-14)", () => {
  it("trims content and accepts only documented submission fields", () => {
    expect(
      screenContentSchema.parse({
        kind: "campaign",
        title: " Draft ",
        text: " Campaign copy ",
      }),
    ).toEqual({ kind: "campaign", title: "Draft", text: "Campaign copy" });
  });
  it.each([
    { kind: "idea", text: " " },
    { kind: "comment", text: "Copy" },
    { kind: "idea", text: "Copy", submittedById: "creator-1" },
    { kind: "idea", text: "Copy", ideaId: "idea-1" },
    { kind: "idea", text: "x".repeat(20_001) },
    { kind: "idea", text: "Copy", title: "x".repeat(201) },
  ])("refuses invalid content or client-selected attribution", (input) => {
    expect(screenContentSchema.safeParse(input).success).toBe(false);
  });
  it("normalizes a Decimal risk score and binds the result to the screening actor", () => {
    const parsed = moderationCaseSchema.parse(record);
    expect(parsed.maxRisk).toBe(0.85);
    expect(
      matchesScreening(parsed, { kind: "idea", text: "Copy" }, "admin-1"),
    ).toBe(true);
    expect(
      matchesScreening(parsed, { kind: "campaign", text: "Copy" }, "admin-1"),
    ).toBe(false);
    expect(
      matchesScreening(parsed, { kind: "idea", text: "Copy" }, "creator-1"),
    ).toBe(false);
    expect(
      matchesScreening(
        { ...parsed, ideaId: "other" },
        { kind: "idea", text: "Copy" },
        "admin-1",
      ),
    ).toBe(false);
  });
  it.each([
    { decision: "APPROVED" },
    { decision: "AUTO_CLEAR" },
    { reasonCodes: [] },
    { maxRisk: "NaN" },
    { maxRisk: "1.01" },
    { maxRisk: -0.1 },
    { reasonCodes: ["UNKNOWN"] },
    { createdAt: "yesterday" },
    { categories: [{ ...record.categories[0], riskScore: 2 }] },
  ])("does not accept a malformed or contradictory screening", (changes) => {
    expect(
      moderationCaseSchema.safeParse({ ...record, ...changes }).success,
    ).toBe(false);
  });
});
