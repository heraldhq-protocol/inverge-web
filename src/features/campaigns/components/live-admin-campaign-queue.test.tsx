import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
import { reviewQueueFixture } from "@/test/admin-campaign-review";
import { LiveAdminCampaignQueue } from "./live-admin-campaign-queue";
import { AdminReviewUnavailable } from "./admin-review-refresh";

afterEach(cleanup);
describe("live campaign review queue", () => {
  it("uses backend counts and status filters with pagination", () => {
    const queue = { ...reviewQueueFixture(), total: 101, skip: 50 };
    render(<LiveAdminCampaignQueue queue={queue} />);
    expect(screen.getByRole("link", { name: /Water project/ })).toHaveAttribute(
      "href",
      "/admin/campaigns/campaign-test",
    );
    expect(screen.getByText("1 milestones")).toBeDefined();
    expect(screen.getByRole("combobox", { name: "Review status" })).toHaveValue(
      "IN_REVIEW",
    );
    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute(
      "href",
      "/admin/campaigns?reviewStatus=IN_REVIEW&skip=100",
    );
    expect(screen.getByRole("link", { name: "Previous page" })).toHaveAttribute(
      "href",
      "/admin/campaigns?reviewStatus=IN_REVIEW&skip=0",
    );
    expect(screen.queryByText(/fixture|stay in this browser/)).toBeNull();
  });
  it("renders an empty queue without invented campaigns or totals", () => {
    render(
      <LiveAdminCampaignQueue
        queue={{
          items: [],
          total: 0,
          skip: 0,
          take: 50,
          reviewStatus: "APPROVED",
        }}
      />,
    );
    expect(
      screen.getByText("No campaigns match this review status."),
    ).toBeDefined();
    expect(screen.queryByRole("link", { name: "Next page" })).toBeNull();
  });
  it("offers first-page recovery after the queue shrinks", () => {
    render(
      <LiveAdminCampaignQueue
        queue={{ items: [], total: 2, skip: 50, take: 50, reviewStatus: "ALL" }}
      />,
    );
    expect(screen.getByRole("link", { name: "First page" })).toHaveAttribute(
      "href",
      "/admin/campaigns?reviewStatus=ALL&skip=0",
    );
    expect(screen.getByText(/no campaigns on this page/)).toBeDefined();
  });
  it("distinguishes an unavailable read from an empty queue", () => {
    render(<AdminReviewUnavailable message="Your session has expired." />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Your session has expired.",
    );
    expect(
      screen.getByRole("button", { name: "Refresh review" }),
    ).toBeDefined();
    expect(
      screen.queryByText("No campaigns match this review status."),
    ).toBeNull();
  });
});
