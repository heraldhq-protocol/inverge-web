import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { IdeasDashboard } from "@/features/ideas/components/ideas-dashboard";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { previewTopics } from "@/features/ideas/content/topics";

afterEach(cleanup);

function renderDashboard(viewer?: "visitor") {
  return render(
    viewer ? (
      <IdeasDashboard
        data={ideasPreviewData}
        topics={previewTopics}
        viewer={viewer}
      />
    ) : (
      <IdeasDashboard data={ideasPreviewData} topics={previewTopics} />
    ),
  );
}

describe("IdeasDashboard", () => {
  it("leads with a real featured idea and filters categories in place", () => {
    renderDashboard();

    expect(
      screen.getByRole("heading", {
        name: /Real ideas\. Real people\./,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /CampusKonekt/ }).length,
    ).toBeGreaterThanOrEqual(1);

    // Several featured ideas become a carousel, not a stack in the hero.
    expect(
      screen.getByRole("heading", { name: "Featured this week" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`1 of ${ideasPreviewData.featured.length}`),
    ).toBeInTheDocument();

    const agriculture = screen.getByRole("radio", { name: "Agriculture" });
    fireEvent.click(agriculture);

    expect(agriculture).toBeChecked();
    const results = within(
      screen.getByRole("region", { name: "Idea results" }),
    );
    expect(
      results.getByRole("heading", { name: "FarmLink ColdBox" }),
    ).toBeInTheDocument();
    expect(
      results.queryByRole("heading", { name: "SunGrid Community Power" }),
    ).not.toBeInTheDocument();
  });

  it("supports search, a useful empty state, and recovery", () => {
    renderDashboard();

    const search = screen.getByRole("searchbox", { name: "Search ideas" });
    fireEvent.change(search, { target: { value: "no such project" } });

    expect(
      screen.getByRole("heading", { name: "Try a broader search" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear all filters" }));
    expect(search).toHaveValue("");
    expect(
      screen.getByRole("heading", { name: /Real ideas\. Real people\./ }),
    ).toBeInTheDocument();
  });

  it("pages the catalogue without losing the result count", () => {
    renderDashboard();

    const grid = () =>
      within(screen.getByRole("region", { name: "Idea results" }));

    expect(
      grid().queryByRole("heading", { name: "CareBridge" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Page 2" }));

    expect(
      grid().getByRole("heading", { name: "CareBridge" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("shows the active filter as a removable chip", () => {
    renderDashboard();

    fireEvent.click(screen.getByRole("radio", { name: "Ghana" }));

    const chip = screen.getByRole("button", { name: /Ghana/ });
    expect(chip).toBeInTheDocument();

    fireEvent.click(chip);
    expect(screen.getByRole("radio", { name: "All locations" })).toBeChecked();
  });

  it("gives visitors an authenticated participation path", () => {
    renderDashboard("visitor");

    expect(
      screen.getByRole("heading", {
        name: "Support, give feedback, or record a pre-pledge.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create account" }),
    ).toHaveAttribute("href", "/auth");
  });

  it("counts only public ideas in the topic directory", () => {
    renderDashboard();

    const directory = within(
      screen.getByRole("region", { name: "Browse by topic" }),
    );
    const campusLife = directory.getByRole("link", { name: /Campus life/ });

    expect(campusLife).toHaveAttribute("href", "/topics/campus-life");
    expect(within(campusLife).getByText("3 ideas")).toBeInTheDocument();
  });
});
