import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NotFound from "@/app/not-found";

describe("NotFound", () => {
  it("renders the 404 heading and navigation actions", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /We couldn't find this page\./i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/Page not found/i)).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Go to home/i })).toHaveAttribute(
      "href",
      "/",
    );

    expect(
      screen.getByRole("link", { name: /Explore guides/i }),
    ).toHaveAttribute("href", "/guides");

    expect(
      screen.getByRole("link", {
        name: /Still having trouble\? Contact support/i,
      }),
    ).toHaveAttribute("href", "/contact");
  });
});
