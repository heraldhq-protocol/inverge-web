import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DesktopNavigation,
  MobileNavigation,
} from "@/features/app-shell/components/product-navigation";

const { route } = vi.hoisted(() => ({ route: { pathname: "/d" } }));

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
}));

afterEach(() => {
  cleanup();
  route.pathname = "/d";
});

describe("DesktopNavigation", () => {
  it("groups navigation and marks only home current on the dashboard root", () => {
    render(<DesktopNavigation collapsed={false} unreadCount={3} />);

    expect(screen.getByText("Your space")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "My ideas" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("keeps discovery separate from the creator's own ideas", () => {
    route.pathname = "/d/discover";

    render(<DesktopNavigation collapsed={false} unreadCount={0} />);

    expect(screen.getByRole("link", { name: "Discover" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "My ideas" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("keeps My ideas current across the authoring routes", () => {
    route.pathname = "/d/creator/ideas/skill-circle/feedback";

    render(<DesktopNavigation collapsed={false} unreadCount={0} />);

    expect(screen.getByRole("link", { name: "My ideas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Creator Studio" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("gives the analytics workspace to Creator Studio", () => {
    route.pathname = "/d/creator/ideas/skill-circle/insights/supporters";

    render(<DesktopNavigation collapsed={false} unreadCount={0} />);

    expect(
      screen.getByRole("link", { name: "Creator Studio" }),
    ).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "My ideas" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("renders an unread badge only when there is something unread", () => {
    render(<DesktopNavigation collapsed={false} unreadCount={4} />);

    expect(
      screen.getByRole("link", { name: /Notifications/ }),
    ).toHaveTextContent("4");
  });

  it("omits the badge at zero unread", () => {
    render(<DesktopNavigation collapsed={false} unreadCount={0} />);

    expect(
      screen.getByRole("link", { name: "Notifications" }),
    ).not.toHaveTextContent("4");
  });

  it("labels the collapsed rail through title attributes", () => {
    render(<DesktopNavigation collapsed unreadCount={0} />);

    expect(screen.getByRole("link", { name: "Ideathons" })).toHaveAttribute(
      "title",
      "Ideathons",
    );
  });
});

describe("MobileNavigation", () => {
  it("marks discovery current on the discovery route", () => {
    route.pathname = "/d/discover";

    render(<MobileNavigation unreadCount={0} />);

    expect(screen.getByRole("link", { name: "Discover" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("keeps My ideas highlighted while creating an idea", () => {
    route.pathname = "/d/creator/ideas/new";

    render(<MobileNavigation unreadCount={0} />);

    expect(screen.getByRole("link", { name: "Create" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("offers only five destinations so each target stays comfortable", () => {
    render(<MobileNavigation unreadCount={0} />);

    expect(screen.getAllByRole("link")).toHaveLength(5);
  });
});
