import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { IdeasDashboard } from "@/features/ideas/components/ideas-dashboard";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";

afterEach(cleanup);

describe("IdeasDashboard", () => {
  it("filters categories in place without navigation links", () => {
    render(<IdeasDashboard data={ideasPreviewData} />);

    expect(
      screen.getByRole("heading", {
        name: "Find something worth believing in.",
      }),
    ).toBeInTheDocument();

    const agriculture = screen.getByRole("button", { name: "Agriculture" });
    fireEvent.click(agriculture);

    expect(agriculture).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("heading", { name: "FarmLink ColdBox" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "AgroRoute" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "SunGrid Community Power" }),
    ).not.toBeInTheDocument();
  });

  it("supports search, a useful empty state, and recovery", () => {
    render(<IdeasDashboard data={ideasPreviewData} />);

    const search = screen.getByRole("searchbox", { name: "Search ideas" });
    fireEvent.change(search, { target: { value: "no such project" } });

    expect(
      screen.getAllByRole("button", { name: "Clear idea search" }),
    ).toHaveLength(1);

    expect(
      screen.getByRole("heading", { name: "Try a broader search" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear all filters" }));
    expect(search).toHaveValue("");
    expect(
      screen.getByRole("heading", { name: "Featured this week" }),
    ).toBeInTheDocument();
  });

  it("reveals more catalogue results explicitly", () => {
    render(<IdeasDashboard data={ideasPreviewData} />);

    expect(
      screen.queryByRole("heading", { name: "NaijaCraft Collective" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show more ideas" }));

    expect(
      screen.getByRole("heading", { name: "NaijaCraft Collective" }),
    ).toBeInTheDocument();
  });

  it("gives visitors an authenticated participation path", () => {
    render(<IdeasDashboard data={ideasPreviewData} viewer="visitor" />);

    expect(
      screen.getByRole("heading", {
        name: "Support, give feedback, or record a pre-pledge.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create account" }),
    ).toHaveAttribute("href", "/sign-up");
  });
});
