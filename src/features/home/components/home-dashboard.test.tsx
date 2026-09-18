import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { HomeDashboard } from "@/features/home/components/home-dashboard";
import { homePreviewData } from "@/features/home/content/preview-data";

afterEach(cleanup);

describe("HomeDashboard", () => {
  it("renders the accountable product preview from one shared data model", () => {
    render(<HomeDashboard data={homePreviewData} />);

    expect(
      screen.getByRole("heading", { name: "Good to see you, Amara." }),
    ).toBeInTheDocument();
    expect(screen.getByText("₦8.4M")).toHaveClass("tabular-nums");
    expect(screen.getByText("₦50,000 intent")).toBeInTheDocument();
    expect(screen.getByText(/No money has moved yet/i)).toBeInTheDocument();
    expect(
      screen.getAllByRole("progressbar", {
        name: "Idea validation progress",
      }),
    ).toHaveLength(3);
  });

  it("shows a useful empty search state with a recovery path", () => {
    render(<HomeDashboard data={homePreviewData} query="no-such-idea" />);

    expect(
      screen.getByRole("heading", { name: "Try a broader search" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clear search" })).toHaveAttribute(
      "href",
      "/home",
    );
  });

  it("switches discovery previews by category without client-only state", () => {
    render(
      <HomeDashboard data={homePreviewData} selectedCategory="agriculture" />,
    );

    expect(screen.getByRole("link", { name: "Agriculture" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("heading", { name: "CropCircle" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "AgroRoute" })).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "StudyMate NG" }),
    ).not.toBeInTheDocument();
  });
});
