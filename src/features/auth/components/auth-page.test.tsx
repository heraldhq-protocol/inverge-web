import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthPage } from "@/features/auth/components/auth-page";
import { RoleOnboardingForm } from "@/features/auth/components/role-onboarding-form";

const routerPush = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  routerPush.mockReset();
});

describe("AuthPage", () => {
  it("presents one sign-in and account-creation entry point", () => {
    render(<AuthPage intent="general" returnPath="/d/wallet" />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Sign in or create your account",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Every promise should stay visible after funding.",
      }),
    ).toBeInTheDocument();
  });

  it("states that sign-in is unavailable instead of offering a dead button", () => {
    render(<AuthPage intent="creator" returnPath="/d" />);

    expect(
      screen.getByText(/sign-in isn't set up in this environment/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /continue/i })).toBeNull();
  });
});

describe("RoleOnboardingForm", () => {
  it("treats the choice as a starting preference rather than a fixed role", () => {
    render(<RoleOnboardingForm intent="general" />);

    expect(
      screen.getByText(/You are not locked into a role/i),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);

    fireEvent.click(
      screen.getByRole("radio", { name: /Find ideas worth backing/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(routerPush).toHaveBeenCalledWith("/d");
  });

  it("allows onboarding to be skipped without fixing a permanent role", () => {
    render(<RoleOnboardingForm intent="general" />);

    fireEvent.click(screen.getByRole("button", { name: "Skip for now" }));

    expect(routerPush).toHaveBeenCalledWith("/d");
  });

  it("pre-selects the build door for creator intent without hiding the choice", () => {
    render(<RoleOnboardingForm intent="creator" />);

    expect(
      screen.getByRole("radio", { name: /Test an idea with real people/i }),
    ).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(routerPush).toHaveBeenCalledWith("/d/creator");
  });

  it("keeps a creator in Creator Studio when they skip the question", () => {
    render(<RoleOnboardingForm intent="creator" />);

    fireEvent.click(screen.getByRole("button", { name: "Skip for now" }));

    expect(routerPush).toHaveBeenCalledWith("/d/creator");
  });
});
