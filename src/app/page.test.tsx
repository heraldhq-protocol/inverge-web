import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "@/app/(marketing)/page";

describe("HomePage", () => {
  it("renders the marketing promise and primary actions", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Back bold ideas\. Keep delivery accountable\./i,
      }),
    ).toBeInTheDocument();

    // The hero renders desktop and mobile variants of the primary action.
    for (const link of screen.getAllByRole("link", {
      name: /Explore ideas/i,
    })) {
      expect(link).toHaveAttribute("href", "/ideas");
    }

    for (const link of screen.getAllByRole("link", {
      name: /Start an idea/i,
    })) {
      expect(link).toHaveAttribute("href", "/auth?intent=creator");
    }
  });
});
