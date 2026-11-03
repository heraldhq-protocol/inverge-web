import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/programmes/server/access", () => ({
  getProgrammeAdminAccess: vi.fn(),
}));
vi.mock("@/features/auth/server/session", () => ({
  readSessionToken: vi.fn(),
}));
vi.mock("@/lib/api/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/server")>()),
  fetchApiJson: vi.fn(),
  isApiConfigured: vi.fn(),
}));

import { getAdminOverview } from "@/features/admin/server/overview";
import { readSessionToken } from "@/features/auth/server/session";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";
import {
  ApiRequestError,
  fetchApiJson,
  isApiConfigured,
} from "@/lib/api/server";

const actor = {
  id: "test-admin",
  name: "Test admin",
  role: "platform_admin" as const,
};
const summary = {
  asOf: "2026-11-03T10:00:00.000Z",
  publishedIdeas: 12,
  activeCampaigns: 3,
  completedCampaigns: 2,
  totalCampaigns: 5,
};
const escrow = {
  asOf: summary.asOf,
  heldUsd: "123.45",
  releasedUsd: "10.25",
  refundedUsd: "0.00",
  counts: { active: 3, completed: 2, refunded: 0 },
};
const analytics = {
  from: "2026-10-05",
  to: "2026-11-03",
  generatedAt: summary.asOf,
  lastAggregatedDay: "2026-11-02",
  totals: { views: 10, uniqueSessions: 8, uniqueSessionsExact: true },
  resources: [],
};

function reportFor(path: string): unknown {
  return path === "/platform/summary"
    ? summary
    : path === "/platform/escrow"
      ? escrow
      : analytics;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-03T10:00:00.000Z"));
  vi.mocked(getProgrammeAdminAccess).mockResolvedValue({
    allowed: true,
    actor,
    preview: false,
    reason: "Admin",
  });
  vi.mocked(readSessionToken).mockResolvedValue("test-session");
  vi.mocked(isApiConfigured).mockReturnValue(true);
  vi.mocked(fetchApiJson).mockImplementation(async (path) => reportFor(path));
});

afterEach(() => vi.useRealTimers());

describe("admin overview data access (FR-901)", () => {
  it("does not fetch reports for a denied account", async () => {
    vi.mocked(getProgrammeAdminAccess).mockResolvedValue({
      allowed: false,
      preview: false,
      reason: "Denied",
    });
    expect(await getAdminOverview(30)).toEqual({ status: "denied" });
    expect(readSessionToken).not.toHaveBeenCalled();
    expect(fetchApiJson).not.toHaveBeenCalled();
  });

  it("keeps preview auth isolated even when an API is configured", async () => {
    vi.mocked(getProgrammeAdminAccess).mockResolvedValue({
      allowed: true,
      actor,
      preview: true,
      reason: "Preview",
    });
    expect(await getAdminOverview(30)).toEqual({ status: "preview", actor });
    expect(fetchApiJson).not.toHaveBeenCalled();
  });

  it.each(["session", "configuration"])(
    "does not substitute previews when live %s is missing",
    async (missing) => {
      if (missing === "session")
        vi.mocked(readSessionToken).mockResolvedValue(null);
      else vi.mocked(isApiConfigured).mockReturnValue(false);
      const result = await getAdminOverview(30);
      expect(result.status).toBe("live");
      if (result.status !== "live") throw new Error("Expected live result");
      expect(result.view.summary.status).toBe("unavailable");
      expect(result.view.escrow.status).toBe("unavailable");
      expect(result.view.analytics.status).toBe("unavailable");
      expect(fetchApiJson).not.toHaveBeenCalled();
    },
  );

  it("validates all three reports and sends the session only to admin analytics", async () => {
    const result = await getAdminOverview(30);
    expect(result).toEqual({
      status: "live",
      actor,
      view: {
        summary: { status: "ready", data: summary },
        escrow: { status: "ready", data: escrow },
        analytics: { status: "ready", data: analytics },
        period: 30,
        range: { from: "2026-10-05", to: "2026-11-03" },
        readAt: summary.asOf,
      },
    });
    expect(fetchApiJson).toHaveBeenCalledWith("/platform/summary", {});
    expect(fetchApiJson).toHaveBeenCalledWith("/platform/escrow", {});
    expect(fetchApiJson).toHaveBeenCalledWith(
      "/admin/analytics/overview?from=2026-10-05&to=2026-11-03&interval=day",
      { token: "test-session" },
    );
    expect(JSON.stringify(result)).not.toContain("test-session");
  });

  it("starts independent reads together and keeps successful sections on partial failure", async () => {
    let finishSummary: ((value: unknown) => void) | undefined;
    vi.mocked(fetchApiJson).mockImplementation((path) => {
      if (path === "/platform/summary")
        return new Promise((resolve) => {
          finishSummary = resolve;
        });
      if (path === "/platform/escrow")
        return Promise.reject(new Error("private upstream detail"));
      return Promise.resolve(analytics);
    });
    const pending = getAdminOverview(30);
    await vi.waitFor(() => expect(fetchApiJson).toHaveBeenCalledTimes(3));
    finishSummary?.(summary);
    const result = await pending;
    if (result.status !== "live") throw new Error("Expected live result");
    expect(result.view.summary.status).toBe("ready");
    expect(result.view.analytics.status).toBe("ready");
    expect(result.view.escrow.status).toBe("unavailable");
    expect(JSON.stringify(result)).not.toContain("private upstream detail");
  });

  it("rejects reports for a different period and invalid financial payloads", async () => {
    vi.mocked(fetchApiJson).mockImplementation(async (path) =>
      path === "/platform/summary"
        ? summary
        : path === "/platform/escrow"
          ? { ...escrow, heldUsd: "-10.00" }
          : { ...analytics, from: "2026-10-01" },
    );
    const result = await getAdminOverview(30);
    if (result.status !== "live") throw new Error("Expected live result");
    expect(result.view.summary.status).toBe("ready");
    expect(result.view.escrow.status).toBe("unavailable");
    expect(result.view.analytics.status).toBe("unavailable");
  });

  it.each([401, 403, 404, 503])(
    "handles an analytics %i without treating it as an empty report",
    async (status) => {
      vi.mocked(fetchApiJson).mockImplementation(async (path) => {
        if (path.startsWith("/admin/"))
          throw new ApiRequestError("private error", status, "API_ERROR");
        return reportFor(path);
      });
      const result = await getAdminOverview(30);
      if (result.status !== "live") throw new Error("Expected live result");
      expect(result.view.analytics.status).toBe("unavailable");
      expect(result.view.summary.status).toBe("ready");
      expect(JSON.stringify(result)).not.toContain("private error");
    },
  );
});
