import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/client", () => ({ sendJson: vi.fn() }));

import { sendJson } from "@/lib/api/client";
import type { AdminAccessRequest } from "@/features/admin/lib/access-requests";
import { AccessRequestRow } from "./access-request-row";
import { AiAccessQueue } from "./ai-access-queue";

const request: AdminAccessRequest = {
  id: "grant-1",
  userId: "user-1",
  email: "builder@example.com",
  status: "PENDING",
  source: "REQUEST",
  requestedAt: "2026-11-01T09:00:00Z",
  decidedAt: null,
  expiresAt: null,
};
const receipt = {
  mode: "live",
  request: {
    ...request,
    status: "APPROVED",
    source: "ADMIN",
    decidedAt: "2026-11-05T09:00:00Z",
  },
};
function row(record = request) {
  return render(
    <ul>
      <AccessRequestRow
        request={record}
        endpointBase="/api/admin/ai/access-requests"
        queueHref="/admin/ai-access?status=PENDING"
        featureLabel="AI assistant"
        asOf="2026-11-05T10:00:00Z"
      />
    </ul>,
  );
}
function submit() {
  fireEvent.submit(screen.getByRole("form", { name: /Review request for/ }));
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(sendJson).mockResolvedValue({ ok: true, data: receipt });
});
afterEach(cleanup);

describe("access request review", () => {
  it("keeps an approval pending until confirmation and prevents duplicate submissions (FR-901)", async () => {
    const pending =
      Promise.withResolvers<Awaited<ReturnType<typeof sendJson>>>();
    vi.mocked(sendJson).mockReturnValue(pending.promise);
    row();
    fireEvent.click(screen.getByRole("button", { name: "Review request" }));
    submit();
    submit();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Saving decision..." }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole("form"), { key: "Escape" });
    expect(screen.getByRole("form")).toBeInTheDocument();
    expect(sendJson).toHaveBeenCalledTimes(1);
    pending.resolve({ ok: true, data: receipt });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Access approved without an expiry.",
    );
    expect(screen.getByRole("status")).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Review request" })).toBeNull();
  });
  it("discards an unsaved decision with Escape and restores focus", () => {
    row();
    const trigger = screen.getByRole("button", { name: "Review request" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("radio", { name: "Reject request" }));
    fireEvent.keyDown(screen.getByRole("form"), { key: "Escape" });
    expect(screen.queryByRole("form")).toBeNull();
    expect(trigger).toHaveFocus();
    fireEvent.click(trigger);
    expect(screen.getByRole("radio", { name: "Approve access" })).toBeChecked();
    expect(sendJson).not.toHaveBeenCalled();
  });
  it("rejects a request without sending a hidden approval expiry", async () => {
    vi.mocked(sendJson).mockResolvedValue({
      ok: true,
      data: { ...receipt, request: { ...receipt.request, status: "REJECTED" } },
    });
    row();
    fireEvent.click(screen.getByRole("button", { name: "Review request" }));
    fireEvent.change(screen.getByLabelText("Expiry (optional)"), {
      target: { value: "2099-01-01T12:00" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Reject request" }));
    submit();
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Access request rejected.",
    );
    expect(sendJson).toHaveBeenCalledWith(
      "/api/admin/ai/access-requests/grant-1",
      { method: "PATCH", body: { status: "REJECTED" } },
    );
  });
  it("requires a reload after a conflict and preserves the last confirmed status", async () => {
    vi.mocked(sendJson).mockResolvedValue({
      ok: false,
      status: 409,
      code: "CONFLICT",
      message: "Already decided.",
    });
    row();
    fireEvent.click(screen.getByRole("button", { name: "Review request" }));
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Already decided",
    );
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Approve access" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("link", { name: "Reload requests" }),
    ).toHaveAttribute("href", "/admin/ai-access?status=PENDING");
    expect(screen.queryByRole("status")).toBeNull();
  });
  it("does not accept a receipt for another account", async () => {
    vi.mocked(sendJson).mockResolvedValue({
      ok: true,
      data: {
        ...receipt,
        request: { ...receipt.request, userId: "another-user" },
      },
    });
    row();
    fireEvent.click(screen.getByRole("button", { name: "Review request" }));
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "did not confirm",
    );
    expect(screen.queryByRole("status")).toBeNull();
  });
  it("keeps already decided AI requests read-only", () => {
    row({
      ...request,
      status: "APPROVED",
      decidedAt: "2026-11-04T09:00:00Z",
      expiresAt: "2026-11-04T12:00:00Z",
    });
    expect(screen.getByText("Expired approval")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });
  it("provides honest empty and bounded-list states", () => {
    const view = render(
      <AiAccessQueue
        requests={[]}
        query={{ status: "PENDING", limit: 50 }}
        asOf="2026-11-05T10:00:00Z"
      />,
    );
    expect(
      screen.getByRole("heading", { name: "No pending requests" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View all requests" }),
    ).toHaveAttribute("href", "/admin/ai-access?status=ALL");
    view.rerender(
      <AiAccessQueue
        requests={[request]}
        query={{ status: "PENDING", limit: 1 }}
        asOf="2026-11-05T10:00:00Z"
      />,
    );
    expect(screen.getByText(/More requests may exist/)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Next page/ })).toBeNull();
  });
});
