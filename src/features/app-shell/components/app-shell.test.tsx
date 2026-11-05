import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/features/app-shell/components/app-shell";
import type { ShellData } from "@/features/app-shell/types";

vi.mock("next/navigation", () => ({
  usePathname: () => "/d",
  useRouter: () => ({ push: vi.fn() }),
}));

const shell: ShellData = {
  notifications: [
    {
      href: "/d/notifications",
      id: "one",
      isRead: false,
      message: "A creator replied to your feedback.",
      timeLabel: "2 hours ago",
      title: "New reply",
    },
  ],
  unreadCount: 1,
  viewer: {
    avatarUrl: null,
    capabilities: {
      creator: true,
      ideathonParticipant: false,
      programmeOrganizer: false,
    },
    dataSource: "preview",
    displayName: "Amara Okonkwo",
    handle: "amaraokonkwo",
    requiresEmailVerification: false,
  },
};

afterEach(cleanup);

describe("AppShell", () => {
  it("collapses to an accessible icon rail and expands again", () => {
    render(
      <AppShell data={shell}>
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

  it("opens the one command palette from the desktop search entry point", async () => {
    render(
      <AppShell data={shell}>
        <p>Product content</p>
      </AppShell>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Search ideas, creators, or topics",
      }),
    );

    expect(
      await screen.findByRole("dialog", { name: "Search Inverge" }),
    ).toBeInTheDocument();

    const input = screen.getByRole("combobox", {
      name: "Search ideas, campaigns, and pages",
    });
    await waitFor(() => expect(input).toHaveFocus());
    expect(
      screen.getByRole("listbox", { name: "Search results" }),
    ).toBeInTheDocument();
  });

  it("binds Ctrl+K once and closes on a second press", async () => {
    render(
      <AppShell data={shell}>
        <p>Product content</p>
      </AppShell>,
    );

    fireEvent.keyDown(window, { ctrlKey: true, key: "k" });
    expect(
      await screen.findByRole("dialog", { name: "Search Inverge" }),
    ).toBeInTheDocument();

    fireEvent.keyDown(window, { ctrlKey: true, key: "k" });
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Search Inverge" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("shows the signed-in identity without an internal id or wallet", () => {
    render(
      <AppShell data={shell}>
        <p>Product content</p>
      </AppShell>,
    );

    expect(screen.getAllByText("Amara Okonkwo").length).toBeGreaterThan(0);
    expect(screen.queryByText(/0x[0-9a-f]{6,}/i)).not.toBeInTheDocument();
  });

  it("exposes a skip link to the main region", () => {
    render(
      <AppShell data={shell}>
        <p>Product content</p>
      </AppShell>,
    );

    expect(
      screen.getByRole("link", { name: "Skip to content" }),
    ).toHaveAttribute("href", "#main-content");
    expect(document.querySelector("main#main-content")).toBeInTheDocument();
  });
});
