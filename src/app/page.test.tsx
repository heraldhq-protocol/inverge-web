import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "@/app/(marketing)/page";

describe("HomePage", () => {
  it("renders the marketing promise as the primary heading", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Back bold ideas\. Keep delivery accountable\./i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create account" }),
    ).toHaveAttribute("href", "/sign-up");
  });
});
