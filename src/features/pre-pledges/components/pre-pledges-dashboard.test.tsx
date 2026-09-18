import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PrePledgesDashboard } from "@/features/pre-pledges/components/pre-pledges-dashboard";
import { prePledgesPreviewData } from "@/features/pre-pledges/content/preview-data";
import { filterAndSortPrePledges } from "@/features/pre-pledges/lib/filter-pre-pledges";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/pre-pledges",
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
}));

afterEach(() => {
  cleanup();
  replace.mockClear();
});

describe("PrePledgesDashboard", () => {
  it("renders non-binding intent from the shared preview model", () => {
    render(<PrePledgesDashboard data={prePledgesPreviewData} />);

    expect(
      screen.getByRole("heading", { name: "Your pre-pledges" }),
    ).toBeInTheDocument();
    expect(screen.getByText("₦100,000")).toBeInTheDocument();
    expect(screen.getByText("No payment yet")).toBeInTheDocument();
    expect(screen.getByText(/won't be charged/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Active pre-pledges" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Past pre-pledges" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Showing all 3")).toBeInTheDocument();
    expect(screen.getByText("Showing all 2")).toBeInTheDocument();
    expect(screen.getAllByRole("progressbar")).toHaveLength(3);
  });

  it("shows only records matching the selected lifecycle status", () => {
    render(
      <PrePledgesDashboard
        data={prePledgesPreviewData}
        status="near-validation"
      />,
    );

    expect(screen.getByRole("heading", { name: "CampusKonekt" })).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "SunGrid Community Power" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Kitchen Collective" }),
    ).not.toBeInTheDocument();
  });

  it("offers a clear recovery action when filters have no matches", () => {
    render(
      <PrePledgesDashboard
        data={prePledgesPreviewData}
        query="not-a-real-idea"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Try another filter" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clear filters" })).toHaveAttribute(
      "href",
      "/pre-pledges",
    );
  });

  it("updates filters in the URL without moving the viewport", () => {
    render(<PrePledgesDashboard data={prePledgesPreviewData} />);

    fireEvent.click(screen.getByLabelText("Status"));
    fireEvent.click(screen.getByRole("option", { name: "Still validating" }));

    expect(replace).toHaveBeenCalledWith("/pre-pledges?status=validating", {
      scroll: false,
    });
  });
});

describe("filterAndSortPrePledges", () => {
  it("sorts money using atomic units without floating-point arithmetic", () => {
    const items = filterAndSortPrePledges({
      items: prePledgesPreviewData.active,
      query: "",
      sort: "highest-intent",
      status: "all",
    });

    expect(items.map((item) => item.idea.id)).toEqual([
      "campus-konekt",
      "sungrid-community-power",
      "farmlink-coldbox",
    ]);
  });
});
