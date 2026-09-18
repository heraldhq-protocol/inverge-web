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
    expect(screen.getByText("₦8.4M")).toBeInTheDocument();
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
});
