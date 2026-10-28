import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SiteHeader } from "@/features/marketing/components/site-header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Next's client Link pulls an ESM helper out of a CommonJS package, which the
// Vitest module runner cannot load. A plain anchor preserves the href
// assertions this test makes.
vi.mock("next/link", () => ({ default: "a" }));

// The avatar module imports next/image, which has the same ESM helper problem.
vi.mock("next/image", () => ({ default: "img" }));

afterEach(cleanup);

describe("SiteHeader", () => {
  it("shows the existing sign-in and creator calls to action when signed out", () => {
    // #given no session viewer
    render(<SiteHeader viewer={null} />);

    // #then the marketing actions are unchanged
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/auth",
    );
    expect(
      screen.getByRole("link", { name: "Start building" }),
    ).toHaveAttribute("href", "/auth?intent=creator");
    expect(
      screen.queryByRole("button", { name: "Account menu" }),
    ).not.toBeInTheDocument();
  });

  it("replaces sign-in actions with an account menu when signed in", () => {
    // #given a live session with a public handle
    render(
      <SiteHeader
        viewer={{
          avatarUrl: null,
          displayName: "Amara Okonkwo",
          mode: "live",
          username: "amaraokonkwo",
        }}
      />,
    );

    // #then the navbar is not pretending the visitor is signed out
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));

    expect(screen.getByRole("menu", { name: "Account" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/d",
    );
    expect(
      screen.getByRole("menuitem", { name: "Public profile" }),
    ).toHaveAttribute("href", "/u/amaraokonkwo");
    expect(screen.getByRole("menuitem", { name: "Sign out" })).toHaveAttribute(
      "href",
      "/sign-out",
    );
  });

  it("labels a preview identity without presenting it as a live account", () => {
    render(
      <SiteHeader
        viewer={{
          avatarUrl: null,
          displayName: "Amara",
          mode: "preview",
          username: "amara",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));

    expect(screen.getByText("Preview account")).toBeInTheDocument();
    expect(
      screen.getByText(/not connected to Inverge services/i),
    ).toBeInTheDocument();
  });

  it("keeps the account actions reachable in the mobile panel", () => {
    render(
      <SiteHeader
        viewer={{
          avatarUrl: null,
          displayName: "Amara Okonkwo",
          mode: "live",
          username: "amaraokonkwo",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    expect(
      screen.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/d",
    );
    expect(
      screen.getByRole("link", { name: "Public profile" }),
    ).toHaveAttribute("href", "/u/amaraokonkwo");
    expect(screen.getByRole("link", { name: "Sign out" })).toHaveAttribute(
      "href",
      "/sign-out",
    );
  });
});
