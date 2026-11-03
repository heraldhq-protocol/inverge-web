import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
const refresh = vi.fn();

import { AdminOverview } from "@/features/admin/components/admin-overview";
import type { AdminOverviewData } from "@/features/admin/lib/overview";
import AdminLoading from "@/app/admin/loading";

function view(): AdminOverviewData {
  return {
    period: 30,
    range: { from: "2026-10-05", to: "2026-11-03" },
    readAt: "2026-11-03T10:00:00.000Z",
    summary: {
      status: "ready",
      data: {
        asOf: "2026-11-03T10:00:00.000Z",
        publishedIdeas: 12,
        activeCampaigns: 3,
        completedCampaigns: 2,
        totalCampaigns: 5,
      },
    },
    escrow: {
      status: "ready",
      data: {
        asOf: "2026-11-03T09:00:00.000Z",
        heldUsd: "123.45",
        releasedUsd: "0.01",
        refundedUsd: "0.00",
        counts: { active: 3, completed: 2, refunded: 1 },
      },
    },
    analytics: {
      status: "ready",
      data: {
        from: "2026-10-05",
        to: "2026-11-03",
        generatedAt: "2026-11-03T10:00:00.000Z",
        lastAggregatedDay: "2026-11-02",
        totals: { views: 125, uniqueSessions: 90, uniqueSessionsExact: false },
        resources: [{ resourceType: "IDEA", views: 125, uniqueSessions: 90 }],
      },
    },
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("admin overview reporting", () => {
  it("shows API figures, exact cents, and the limits of escrow and session estimates", () => {
    render(<AdminOverview name="Test admin" view={view()} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Operating overview" }),
    ).toBeInTheDocument();
    expect(screen.getByText("$123.45")).toBeInTheDocument();
    expect(screen.getByText("$0.01")).toBeInTheDocument();
    expect(
      screen.getByText(/not a verified escrow balance/),
    ).toBeInTheDocument();
    expect(screen.getByText(/more than five minutes old/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /this does not confirm that backers have claimed refunds/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/A session seen on multiple days/),
    ).toBeInTheDocument();
    expect(screen.queryByText("Unique sessions")).not.toBeInTheDocument();
    const table = screen.getByRole("table", { name: "Activity by resource" });
    expect(
      within(table).getByRole("rowheader", { name: "Ideas" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Recent preview decisions/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open review queue" }),
    ).toHaveAttribute("href", "/admin/campaigns");
  });

  it("keeps successful reports visible when another section is unavailable", () => {
    const data = view();
    data.escrow = {
      status: "unavailable",
      reason: "Escrow could not be loaded.",
    };
    render(<AdminOverview name="Test admin" view={data} />);
    expect(screen.getByText("Escrow could not be loaded.")).toBeInTheDocument();
    expect(screen.getByText("Published ideas")).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "Activity by resource" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("$0.00")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Refresh overview" }));
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("distinguishes an empty platform and pending aggregation from a failed read", () => {
    const data = view();
    data.summary = {
      status: "ready",
      data: {
        asOf: data.readAt,
        publishedIdeas: 0,
        activeCampaigns: 0,
        completedCampaigns: 0,
        totalCampaigns: 0,
      },
    };
    if (data.analytics.status !== "ready")
      throw new Error("Expected analytics fixture");
    data.analytics.data.resources = [];
    data.analytics.data.lastAggregatedDay = null;
    data.analytics.data.totals = {
      views: 0,
      uniqueSessions: 0,
      uniqueSessionsExact: true,
    };
    render(<AdminOverview name="Test admin" view={data} />);
    expect(
      screen.getByText("No ideas or campaigns have been published yet."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No resource activity was reported for this period."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No daily aggregation has been reported yet/),
    ).toBeInTheDocument();
    expect(screen.getByText("Unique sessions")).toBeInTheDocument();
    expect(screen.queryByText("Report unavailable")).not.toBeInTheDocument();
  });

  it("submits the selected period through an accessible GET form", () => {
    render(<AdminOverview name="Test admin" view={view()} />);
    const select = screen.getByRole("combobox", { name: "Activity period" });
    expect(select).toHaveValue("30");
    fireEvent.change(select, { target: { value: "7" } });
    expect(select).toHaveValue("7");
    const button = screen.getByRole("button", { name: "Apply period" });
    expect(button.closest("form")).toHaveAttribute("method", "get");
    expect(button.closest("form")).toHaveAttribute("action", "/admin");
  });

  it("announces the loading state", () => {
    render(<AdminLoading />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Loading admin workspace")).toBeInTheDocument();
  });
});
