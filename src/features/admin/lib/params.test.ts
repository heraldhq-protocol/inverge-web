import { describe, expect, it } from "vitest";

import {
  paramAuditEntrySchema,
  paramAuditListSchema,
  paramAuditQuerySchema,
  platformParamsSchema,
  platformParamValueSchema,
  updateParamsSchema,
} from "./params";

describe("platformParamValueSchema", () => {
  it("accepts strings, numbers, booleans, and null", () => {
    expect(platformParamValueSchema.parse("test")).toBe("test");
    expect(platformParamValueSchema.parse(42)).toBe(42);
    expect(platformParamValueSchema.parse(true)).toBe(true);
    expect(platformParamValueSchema.parse(false)).toBe(false);
    expect(platformParamValueSchema.parse(null)).toBeNull();
  });

  it("rejects non-primitive values", () => {
    expect(() => platformParamValueSchema.parse([1, 2, 3])).toThrow();
    expect(() => platformParamValueSchema.parse({ foo: "bar" })).toThrow();
    expect(() => platformParamValueSchema.parse(undefined)).toThrow();
  });
});

describe("platformParamsSchema", () => {
  it("validates a dictionary of platform parameters", () => {
    const raw = {
      "boost.featured.priceUSD": 150,
      "editorial.emails.enabled": true,
      "platform.notice": "Maintenance at midnight",
      "deprecated.param": null,
    };
    const parsed = platformParamsSchema.parse(raw);
    expect(parsed["boost.featured.priceUSD"]).toBe(150);
    expect(parsed["editorial.emails.enabled"]).toBe(true);
    expect(parsed["platform.notice"]).toBe("Maintenance at midnight");
    expect(parsed["deprecated.param"]).toBeNull();
  });
});

describe("updateParamsSchema", () => {
  it("accepts valid non-empty updates", () => {
    const parsed = updateParamsSchema.parse({
      params: {
        "boost.featured.priceUSD": 200,
        "editorial.emails.enabled": false,
      },
    });
    expect(parsed.params["boost.featured.priceUSD"]).toBe(200);
    expect(parsed.params["editorial.emails.enabled"]).toBe(false);
  });

  it("rejects empty params object or empty keys", () => {
    expect(() => updateParamsSchema.parse({ params: {} })).toThrow();
    expect(() => updateParamsSchema.parse({ params: { "": "value" } })).toThrow();
  });
});

describe("paramAuditEntrySchema and paramAuditListSchema", () => {
  it("parses single audit entries", () => {
    const entry = paramAuditEntrySchema.parse({
      id: "aud_1",
      key: "boost.featured.priceUSD",
      oldValue: 150,
      newValue: 200,
      actorId: "usr_admin_1",
      actorName: "Ada Admin",
      changedAt: "2026-11-16T12:00:00Z",
      reason: "Quarterly review",
    });
    expect(entry.id).toBe("aud_1");
    expect(entry.key).toBe("boost.featured.priceUSD");
    expect(entry.oldValue).toBe(150);
    expect(entry.newValue).toBe(200);
  });

  it("parses audit list as bare array or wrapped object", () => {
    const list = [
      {
        id: "aud_1",
        key: "boost.featured.priceUSD",
        oldValue: 150,
        newValue: 200,
      },
    ];
    expect(paramAuditListSchema.parse(list)).toHaveLength(1);
    expect(paramAuditListSchema.parse({ items: list, total: 1 })).toHaveLength(1);
  });
});

describe("paramAuditQuerySchema", () => {
  it("applies defaults and coercions", () => {
    const q1 = paramAuditQuerySchema.parse({});
    expect(q1.limit).toBe(100);
    expect(q1.offset).toBe(0);
    expect(q1.key).toBeUndefined();

    const q2 = paramAuditQuerySchema.parse({
      key: "  boost.featured.priceUSD  ",
      limit: "50",
      offset: "10",
    });
    expect(q2.key).toBe("boost.featured.priceUSD");
    expect(q2.limit).toBe(50);
    expect(q2.offset).toBe(10);
  });
});
