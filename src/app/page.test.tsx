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

    expect(
      screen.getByRole("link", { name: /Explore ideas/i }),
    ).toHaveAttribute("href", "/discover");

    expect(
      screen.getByRole("link", { name: /Start an idea/i }),
    ).toHaveAttribute("href", "/sign-up");
  });
});
