import { describe, expect, it } from "vitest";

import {
  amlHistoryEndpoint,
  AML_KIND_LABELS,
  AML_SCREEN_TIMEOUT_MS,
  AML_SOURCE_LABELS,
  AML_STATUSES,
  AML_STATUS_LABELS,
  AML_STATUS_TONES,
  amlScreenEndpoint,
  amlScreeningRecordSchema,
  amlScreeningResultSchema,
  amlScreenSchema,
  isAmlKind,
} from "./aml";

describe("AML screening request schema (FR-103, FR-104)", () => {
  it("accepts and trims the documented fields", () => {
    expect(
      amlScreenSchema.parse({
        kind: "individual",
        userId: " user-1 ",
        fullName: " Test Person ",
      }),
    ).toEqual({
      kind: "individual",
      userId: "user-1",
      fullName: "Test Person",
    });
    expect(
      amlScreenSchema.safeParse({
        kind: "business",
        userId: "user-2",
        fullName: "Business Ltd",
        dateOfBirth: "1990-01-31",
        documentNumber: "A0123456",
        nationality: "NGA",
      }).success,
    ).toBe(true);
  });

  it("requires the subject and rejects unsupported values", () => {
    expect(amlScreenSchema.safeParse({ kind: "individual" }).success).toBe(
      false,
    );
    expect(
      amlScreenSchema.safeParse({
        kind: "individual",
        userId: "",
        fullName: "A",
      }).success,
    ).toBe(false);
    expect(
      amlScreenSchema.safeParse({
        kind: "individual",
        userId: "user-1",
        fullName: "A",
        dateOfBirth: "31/01/1990",
      }).success,
    ).toBe(false);
    expect(
      amlScreenSchema.safeParse({
        kind: "individual",
        userId: "user-1",
        fullName: "A",
        nationality: "N",
      }).success,
    ).toBe(false);
    expect(
      amlScreenSchema.safeParse({
        kind: "entity",
        userId: "user-1",
        fullName: "A",
      }).success,
    ).toBe(false);
    // entityType is decided by the endpoint path, not the request.
    expect(
      amlScreenSchema.safeParse({
        kind: "individual",
        userId: "user-1",
        fullName: "A",
        entityType: "person",
      }).success,
    ).toBe(false);
  });

  it("maps each kind to its endpoint and encodes the history path", () => {
    expect(amlScreenEndpoint("individual")).toBe("/kyc/admin/aml-screen");
    expect(amlScreenEndpoint("business")).toBe("/kyb/admin/aml-screen");
    expect(amlHistoryEndpoint("individual", "user 1")).toBe(
      "/kyc/admin/aml/user%201",
    );
    expect(amlHistoryEndpoint("business", "user-2")).toBe(
      "/kyb/admin/aml/user-2",
    );
    expect(AML_SCREEN_TIMEOUT_MS).toBe(30_000);
    expect(isAmlKind("business")).toBe(true);
    expect(isAmlKind("company")).toBe(false);
    expect(Object.keys(AML_KIND_LABELS)).toHaveLength(2);
  });
});

describe("AML screening result schema (NFR-19)", () => {
  const result = {
    datasets: ["sanctions", "watchlists"],
    topRiskScore: null,
    totalHits: 0,
    status: "CLEAR",
  };

  it("accepts a documented result with no matches", () => {
    expect(amlScreeningResultSchema.parse(result)).toEqual({
      ...result,
      status: "CLEAR",
    });
  });

  it("normalises decimal scores supplied as numeric strings", () => {
    expect(
      amlScreeningResultSchema.parse({
        ...result,
        status: "FLAGGED",
        topRiskScore: "0.8",
        totalHits: 3,
      }),
    ).toMatchObject({ topRiskScore: 0.8, totalHits: 3 });
    expect(
      amlScreeningResultSchema.parse({
        ...result,
        status: "IN_REVIEW",
        topRiskScore: 0.4,
      }),
    ).toMatchObject({ topRiskScore: 0.4 });
  });

  it("rejects malformed scores, hit counts and statuses", () => {
    for (const topRiskScore of [-1, -0.5, "-0.5", "abc", ""]) {
      expect(
        amlScreeningResultSchema.safeParse({ ...result, topRiskScore }).success,
      ).toBe(false);
    }
    expect(
      amlScreeningResultSchema.safeParse({ ...result, totalHits: -1 }).success,
    ).toBe(false);
    expect(
      amlScreeningResultSchema.safeParse({ ...result, totalHits: 1.5 }).success,
    ).toBe(false);
    expect(
      amlScreeningResultSchema.safeParse({ ...result, status: "PENDING" })
        .success,
    ).toBe(false);
  });
});

describe("AML history schema (NFR-19)", () => {
  const record = {
    id: "screen-1",
    source: "STANDALONE",
    status: "CLEAR",
    topRiskScore: null,
    totalHits: 0,
    datasets: ["sanctions"],
    createdAt: "2026-11-16T09:30:00Z",
  };

  it("accepts a documented history record and rejects malformed ones", () => {
    expect(amlScreeningRecordSchema.parse(record)).toEqual(record);
    expect(
      amlScreeningRecordSchema.safeParse({
        ...record,
        createdAt: "16/11/2026",
      }).success,
    ).toBe(false);
    expect(
      amlScreeningRecordSchema.safeParse({ ...record, source: "ADMIN" })
        .success,
    ).toBe(false);
    expect(
      amlScreeningRecordSchema.safeParse({ ...record, id: "" }).success,
    ).toBe(false);
    expect(
      amlScreeningRecordSchema.safeParse({
        ...record,
        createdAt: "2026-11-16T09:30:00+01:00",
      }).success,
    ).toBe(true);
  });

  it("keeps a closed label and tone vocabulary", () => {
    expect(Object.keys(AML_STATUS_LABELS)).toEqual([...AML_STATUSES]);
    expect(Object.keys(AML_STATUS_TONES)).toEqual([...AML_STATUSES]);
    expect(Object.keys(AML_SOURCE_LABELS)).toEqual([
      "KYC_SESSION",
      "STANDALONE",
    ]);
  });
});
