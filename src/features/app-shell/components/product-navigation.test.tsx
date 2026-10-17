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
  it("marks the home item current on the dashboard root", () => {
    route.pathname = "/d";

    render(<DesktopNavigation collapsed={false} />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Ideas" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("does not keep home current on a nested dashboard route", () => {
    route.pathname = "/d/ideas";

    render(<DesktopNavigation collapsed={false} />);

    expect(screen.getByRole("link", { name: "Ideas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("keeps a section current across its child routes", () => {
    route.pathname = "/d/ideas/123";

    render(<DesktopNavigation collapsed={false} />);

    expect(screen.getByRole("link", { name: "Ideas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks only settings current on the settings route", () => {
    route.pathname = "/d/settings";

    render(<DesktopNavigation collapsed={false} />);

    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks analytics current inside an idea's analytics workspace", () => {
    route.pathname = "/d/ideas/skill-circle/insights/supporters";

    render(<DesktopNavigation collapsed={false} />);

    expect(screen.getByRole("link", { name: "Analytics" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Ideas" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});

describe("MobileNavigation", () => {
  it("does not keep home current on a nested dashboard route", () => {
    route.pathname = "/d/pre-pledges";

    render(<MobileNavigation />);

    expect(screen.getByRole("link", { name: "Pre-pledges" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
