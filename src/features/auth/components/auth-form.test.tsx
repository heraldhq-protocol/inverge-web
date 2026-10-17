import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthPage } from "@/features/auth/components/auth-page";
import { EmailVerificationForm } from "@/features/auth/components/email-verification-form";
import { EmailVerificationPage } from "@/features/auth/components/email-verification-page";
import { ProfileOnboardingForm } from "@/features/auth/components/profile-onboarding-form";
import { RoleOnboardingForm } from "@/features/auth/components/role-onboarding-form";

const routerPush = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));

afterEach(() => {
  cleanup();
  routerPush.mockReset();
});

describe("AuthForm", () => {
  it("offers provider options while email sign-in waits on the Privy integration", () => {
    render(<AuthForm mode="sign-up" />);

    expect(
      screen.getByRole("button", { name: "Continue with Privy" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue with Google" }),
    ).toBeInTheDocument();

    // The email form stays out of the DOM until Privy is wired up, so no
    // credential fields can be mistaken for a working sign-up path.
    expect(screen.queryByLabelText("Email address")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Create account" }),
    ).not.toBeInTheDocument();
  });

  it("explains that a provider is not yet connected instead of failing silently", () => {
    render(<AuthForm mode="sign-up" />);

    fireEvent.click(screen.getByRole("button", { name: "Continue with Privy" }));

    expect(routerPush).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        "Privy authentication will be connected in the integration step.",
      ),
    ).toBeInTheDocument();
  });
});

describe("EmailVerificationForm", () => {
  it("accepts a pasted six-digit code and exposes the correct return path", () => {
    render(<EmailVerificationForm mode="sign-up" />);

    fireEvent.paste(screen.getByLabelText("Digit 1 of 6"), {
      clipboardData: { getData: () => "12 34-56" },
    });

    for (const [index, digit] of ["1", "2", "3", "4", "5", "6"].entries()) {
      expect(screen.getByLabelText(`Digit ${index + 1} of 6`)).toHaveValue(
        digit,
      );
    }
    expect(
      screen.getByRole("link", { name: "Use a different email" }),
    ).toHaveAttribute("href", "/sign-up");
  });

  it("announces an incomplete verification code", () => {
    render(<EmailVerificationForm mode="sign-in" />);

    fireEvent.click(screen.getByRole("button", { name: "Verify email" }));

    expect(
      screen.getByText("Enter all six digits from your verification email."),
    ).toBeInTheDocument();
  });

  it("continues a completed verification to profile onboarding", () => {
    render(<EmailVerificationForm mode="sign-up" />);

    fireEvent.paste(screen.getByLabelText("Digit 1 of 6"), {
      clipboardData: { getData: () => "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify email" }));

    expect(routerPush).toHaveBeenCalledWith("/onboarding/profile");
  });
});

describe("EmailVerificationPage", () => {
  it("does not offer a marketing escape link during verification", () => {
    render(<EmailVerificationPage mode="sign-in" />);

    expect(
      screen.queryByRole("link", { name: "How Inverge works" }),
    ).not.toBeInTheDocument();
  });
});

describe("ProfileOnboardingForm", () => {
  it("collects public profile details and continues to the starting choice", () => {
    render(<ProfileOnboardingForm />);

    expect(screen.getByLabelText("Display name")).toBeRequired();
    expect(screen.getByLabelText("Username")).toHaveAttribute(
      "pattern",
      "[a-z0-9-]+",
    );
    expect(screen.getByLabelText(/Where are you based/)).not.toBeRequired();

    const form = screen
      .getByRole("button", { name: "Continue" })
      .closest("form");

    if (!form) {
      throw new Error("Expected the profile continue button to be in a form.");
    }

    fireEvent.submit(form);

    expect(routerPush).toHaveBeenCalledWith("/onboarding/role");
  });
});

describe("RoleOnboardingForm", () => {
  it("treats the choice as a starting preference rather than a fixed role", () => {
    render(<RoleOnboardingForm />);

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
    render(<RoleOnboardingForm />);

    fireEvent.click(screen.getByRole("button", { name: "Skip for now" }));

    expect(routerPush).toHaveBeenCalledWith("/d");
  });
});

describe("AuthPage", () => {
  it("composes sign-in content with the reusable accountability panel", () => {
    render(<AuthPage mode="sign-in" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Sign in to Inverge" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("complementary")).toHaveClass("hidden", "lg:flex");
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Every promise should stay visible after funding.",
      }),
    ).toBeInTheDocument();
  });
});
