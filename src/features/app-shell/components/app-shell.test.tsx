import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/features/app-shell/components/app-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/home",
}));

afterEach(cleanup);

describe("AppShell", () => {
  it("collapses to an accessible icon rail and expands again", () => {
    render(
      <AppShell>
        <p>Product content</p>
      </AppShell>,
    );

    const sidebar = document.querySelector("#product-sidebar");
    const collapseButton = screen.getByRole("button", {
      name: "Collapse sidebar",
    });

    expect(sidebar).not.toHaveAttribute("data-collapsed");
    expect(collapseButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(collapseButton);

    const expandButton = screen.getByRole("button", {
      name: "Expand sidebar",
    });
    expect(sidebar).toHaveAttribute("data-collapsed", "true");
    expect(expandButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("link", { name: "Start an idea" })).toHaveAttribute(
      "title",
      "Start an idea",
    );

    fireEvent.click(expandButton);
    expect(
      screen.getByRole("button", { name: "Collapse sidebar" }),
    ).toBeInTheDocument();
  });
});
