import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/client", () => ({ sendJson: vi.fn() }));

import { sendJson } from "@/lib/api/client";
import type {
  AdminAnalyticsAccessRequest,
  AnalyticsAccessList,
} from "@/features/admin/lib/analytics-access";
import { AnalyticsAccessQueue } from "./analytics-access-queue";

const grant: AdminAnalyticsAccessRequest = {
  id: "analytics-1",
  userId: "user-1",
  email: "builder@example.com",
  displayName: "Amara Okonkwo",
  username: "amara",
  creatorTier: "ESTABLISHED",
  status: "APPROVED",
  source: "PAID",
  requestedAt: "2026-11-01T09:00:00Z",
  decidedAt: "2026-11-03T09:00:00Z",
  expiresAt: "2099-01-01T12:15:27.123Z",
};
const list: AnalyticsAccessList = {
  data: [grant],
  page: {
    limit: 24,
    nextCursor: "opaque+/=",
    hasMore: true,
    total: null,
    totalKind: "omitted",
  },
};
const asOf = "2026-11-05T10:00:00Z";

beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);

describe("analytics access controls", () => {
  it("preserves the filter while paging and resets the cursor when changing filters", () => {
    render(
      <AnalyticsAccessQueue
        list={list}
        query={{ status: "APPROVED", limit: 24, cursor: "current" }}
        asOf={asOf}
      />,
    );
    expect(
      screen.getByRole("link", { name: "Older requests" }),
    ).toHaveAttribute(
      "href",
      "/admin/analytics-access?status=APPROVED&cursor=opaque%2B%2F%3D",
    );
    expect(
      screen.getByRole("link", { name: "Back to first page" }),
    ).toHaveAttribute("href", "/admin/analytics-access?status=APPROVED");
    expect(screen.getByRole("link", { name: "Pending" })).toHaveAttribute(
      "href",
      "/admin/analytics-access?status=PENDING",
    );
    expect(
      screen.getByText(/Amara Okonkwo · @amara · Established creator/),
    ).toBeInTheDocument();
    expect(screen.getByText(/1 request on this page/)).toBeInTheDocument();
  });
  it("recovers an empty later page without removing the selected status or page size", () => {
    render(
      <AnalyticsAccessQueue
        list={{
          data: [],
          page: { ...list.page, limit: 50, hasMore: false, nextCursor: null },
        }}
        query={{ status: "REJECTED", limit: 50, cursor: "old" }}
        asOf={asOf}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "No requests on this page" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to first page" }),
    ).toHaveAttribute(
      "href",
      "/admin/analytics-access?status=REJECTED&limit=50",
    );
    expect(screen.queryByRole("link", { name: "Older requests" })).toBeNull();
  });
  it("preserves the exact existing expiry when it has not been edited", async () => {
    vi.mocked(sendJson).mockResolvedValue({
      ok: true,
      data: { mode: "live", request: grant },
    });
    render(
      <AnalyticsAccessQueue
        list={list}
        query={{ status: "APPROVED", limit: 24 }}
        asOf={asOf}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Change access" }));
    expect(screen.getByLabelText("Expiry (optional)")).not.toHaveValue("");
    fireEvent.submit(screen.getByRole("form", { name: /Review request for/ }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Access approved until",
    );
    expect(sendJson).toHaveBeenCalledWith(
      "/api/admin/analytics/access-requests/analytics-1",
      {
        method: "PATCH",
        body: { status: "APPROVED", expiresAt: grant.expiresAt },
      },
    );
  });
  it("revokes an approved grant only after receiving confirmation", async () => {
    vi.mocked(sendJson).mockResolvedValue({
      ok: true,
      data: {
        mode: "live",
        request: { ...grant, status: "REJECTED", expiresAt: null },
      },
    });
    render(
      <AnalyticsAccessQueue
        list={list}
        query={{ status: "APPROVED", limit: 24 }}
        asOf={asOf}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Change access" }));
    fireEvent.click(screen.getByRole("radio", { name: "Revoke access" }));
    expect(screen.queryByLabelText("Expiry (optional)")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Revoke access" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Access revoked.",
    );
    expect(sendJson).toHaveBeenCalledWith(
      "/api/admin/analytics/access-requests/analytics-1",
      { method: "PATCH", body: { status: "REJECTED" } },
    );
  });
  it.each(["", "2099-02-01T15:30"])(
    "can change an existing expiry to %s without reusing the old instant",
    async (expiry) => {
      const expiresAt = expiry ? new Date(expiry).toISOString() : null;
      vi.mocked(sendJson).mockResolvedValue({
        ok: true,
        data: { mode: "live", request: { ...grant, expiresAt } },
      });
      render(
        <AnalyticsAccessQueue
          list={list}
          query={{ status: "APPROVED", limit: 24 }}
          asOf={asOf}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Change access" }));
      fireEvent.change(screen.getByLabelText("Expiry (optional)"), {
        target: { value: expiry },
      });
      fireEvent.submit(
        screen.getByRole("form", { name: /Review request for/ }),
      );
      expect(await screen.findByRole("status")).toHaveTextContent(
        expiresAt
          ? "Access approved until"
          : "Access approved without an expiry.",
      );
      expect(sendJson).toHaveBeenCalledWith(
        "/api/admin/analytics/access-requests/analytics-1",
        {
          method: "PATCH",
          body: { status: "APPROVED", ...(expiresAt ? { expiresAt } : {}) },
        },
      );
    },
  );
});
