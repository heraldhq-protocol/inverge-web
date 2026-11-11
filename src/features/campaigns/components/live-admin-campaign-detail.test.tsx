import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { refresh, send } = vi.hoisted(() => ({
  refresh: vi.fn(),
  send: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@/lib/api/client", () => ({ sendJson: send }));

import {
  reviewDecisionFixture,
  reviewDetailFixture,
} from "@/test/admin-campaign-review";
import { getCampaignReviewStoreKey } from "@/features/campaigns/lib/admin-review-store";
import type { AdminActor } from "@/features/admin/permissions";
import { LiveAdminCampaignDetail } from "./live-admin-campaign-detail";

const actor: AdminActor = {
  id: "admin-test",
  role: "platform_admin",
  name: "Reviewer",
};
function approve() {
  fireEvent.click(screen.getByRole("radio", { name: /Approve campaign/ }));
  fireEvent.click(screen.getByRole("button", { name: "Record decision" }));
}
beforeEach(() => {
  vi.resetAllMocks();
  window.localStorage.clear();
});
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("FR-304 live campaign review", () => {
  it("shows backend facts and structured evidence without a preview override", () => {
    window.localStorage.setItem(
      getCampaignReviewStoreKey(),
      JSON.stringify({
        version: 1,
        overrides: {
          "campaign-test": {
            campaignId: "campaign-test",
            review: {
              status: "approved",
              approvedAt: "2026-11-02T10:00:00.000Z",
            },
            phase: "funding",
            publishedAt: "2026-11-02T10:00:00.000Z",
            updatedAt: "2026-11-02T10:00:00.000Z",
          },
        },
        events: [],
      }),
    );
    render(
      <LiveAdminCampaignDetail detail={reviewDetailFixture()} actor={actor} />,
    );
    expect(screen.getByText("Awaiting review")).toBeDefined();
    expect(screen.getByText("Independent installation report")).toBeDefined();
    expect(screen.getAllByText("Satisfied")).toHaveLength(2);
    expect(screen.getByText("$25,000.25")).toBeDefined();
    expect(
      screen.getByText(/does not include the authored campaign story/),
    ).toBeDefined();
    expect(
      screen.queryByText(/Decisions recorded here stay in this browser/),
    ).toBeNull();
  });
  it("waits for a valid API receipt, keeps funding unchanged and refreshes the server", async () => {
    let resolve!: (value: unknown) => void;
    send.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    render(
      <LiveAdminCampaignDetail detail={reviewDetailFixture()} actor={actor} />,
    );
    approve();
    expect(
      screen.getByRole("button", { name: "Recording decision…" }),
    ).toBeDisabled();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(screen.getByText("No review decisions recorded.")).toBeDefined();
    await act(async () =>
      resolve({
        ok: true,
        data: { mode: "live", decision: reviewDecisionFixture() },
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("Decision confirmed");
    expect(screen.getByText("admin@example.test · ADMIN")).toBeDefined();
    expect(screen.getByText("Funding lifecycle: in review")).toBeDefined();
    expect(window.localStorage.getItem(getCampaignReviewStoreKey())).toBeNull();
    expect(refresh).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole("button", { name: "Record decision" }),
    ).toBeNull();
    expect(send).toHaveBeenCalledWith(
      "/api/admin/campaigns/campaign-test/review",
      { method: "POST", body: { action: "APPROVE", reason: undefined } },
    );
  });
  it("blocks approval using actual gates while allowing changes and rejection", () => {
    const detail = reviewDetailFixture();
    detail.preconditions.eligible = false;
    detail.preconditions.blockers = ["Compliance hold"];
    detail.preconditions.checks[0]!.satisfied = false;
    render(<LiveAdminCampaignDetail detail={detail} actor={actor} />);
    expect(
      screen.getByRole("radio", { name: /Approve campaign/ }),
    ).toBeDisabled();
    expect(
      screen.getByRole("radio", { name: /Request changes/ }),
    ).not.toBeDisabled();
    expect(screen.getByText("Compliance hold")).toBeDefined();
  });
  it("requires a reason and focuses the field before sending a change request", async () => {
    send.mockResolvedValue({
      ok: false,
      status: 403,
      message: "Admin required",
    });
    render(
      <LiveAdminCampaignDetail detail={reviewDetailFixture()} actor={actor} />,
    );
    fireEvent.click(screen.getByRole("radio", { name: /Request changes/ }));
    fireEvent.click(screen.getByRole("button", { name: "Record decision" }));
    expect(screen.getByRole("textbox")).toHaveFocus();
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(send).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("textbox"), {
      target: {
        value: "  Add independent evidence for the installation milestone.  ",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Record decision" }));
    await waitFor(() =>
      expect(send).toHaveBeenCalledWith(expect.any(String), {
        method: "POST",
        body: {
          action: "REQUEST_CHANGES",
          reason: "Add independent evidence for the installation milestone.",
        },
      }),
    );
  });
  it.each([401, 403, 409, 422, 503, 0])(
    "does not confirm a failed decision (%s)",
    async (status) => {
      send.mockResolvedValue({
        ok: false,
        status,
        message: "Review refused",
        details: { blockers: ["Verification changed"] },
      });
      render(
        <LiveAdminCampaignDetail
          detail={reviewDetailFixture()}
          actor={actor}
        />,
      );
      approve();
      await screen.findByRole("alert");
      expect(screen.getByText("Awaiting review")).toBeDefined();
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
      expect(screen.getByText("Verification changed")).toBeDefined();
      expect(refresh).not.toHaveBeenCalled();
      expect(
        window.localStorage.getItem(getCampaignReviewStoreKey()),
      ).toBeNull();
      if (status === 0 || status >= 500 || status === 409) {
        expect(
          screen.getByRole("link", { name: "Reload review" }),
        ).toHaveAttribute("href", "/admin/campaigns/campaign-test");
        expect(
          screen.getByRole("button", { name: "Record decision" }),
        ).toBeDisabled();
      }
    },
  );
  it.each([
    null,
    { ok: true, data: { preview: true } },
    { mode: "live", decision: { ...reviewDecisionFixture(), id: "different" } },
  ])("refuses malformed or preview success envelopes", async (data) => {
    send.mockResolvedValue({ ok: true, data });
    render(
      <LiveAdminCampaignDetail detail={reviewDetailFixture()} actor={actor} />,
    );
    approve();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "could not be confirmed",
    );
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(refresh).not.toHaveBeenCalled();
  });
  it("hides the form from a non-reviewer and an already decided campaign", () => {
    const { rerender } = render(
      <LiveAdminCampaignDetail
        detail={reviewDetailFixture()}
        actor={{ ...actor, role: "organiser" }}
      />,
    );
    expect(screen.queryByRole("radio")).toBeNull();
    const detail = reviewDetailFixture();
    detail.campaign.reviewStatus = "REJECTED";
    rerender(<LiveAdminCampaignDetail detail={detail} actor={actor} />);
    expect(screen.queryByRole("radio")).toBeNull();
  });
});
