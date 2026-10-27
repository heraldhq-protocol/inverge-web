import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// The page is a server component that opts into request-time rendering so the
// live activity band is fresh. Outside a Next request there is no connection to
// wait for; the data module itself falls back to labelled preview fixtures when
// no API is configured, which is the state this test renders.
vi.mock("next/server", () => ({
  connection: async () => {},
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
}));

import HomePage from "@/app/(marketing)/page";

describe("HomePage", () => {
  it("renders the marketing promise and primary actions", async () => {
    render(await HomePage());

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
