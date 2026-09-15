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
  it("keeps account creation lean and offers provider options", () => {
    render(<AuthForm mode="sign-up" />);

    expect(screen.queryByLabelText("First name")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Last name")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue with Privy" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue with Google" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in",
    );
  });

  it("reports mismatched passwords without submitting credentials", () => {
    render(<AuthForm mode="sign-up" />);

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secure-pass" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "different-pass" },
    });

    const form = screen
      .getByRole("button", { name: "Create account" })
      .closest("form");

    if (!form) {
      throw new Error("Expected the account creation button to be in a form.");
    }

    fireEvent.submit(form);

    expect(routerPush).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        "Your passwords do not match. Please check them and try again.",
      ),
    ).toBeInTheDocument();
  });

  it("uses the reduced field set for sign in", () => {
    render(<AuthForm mode="sign-in" />);

    expect(screen.queryByLabelText("First name")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Confirm password")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    expect(
      screen.getByRole("link", { name: "Create an account" }),
    ).toHaveAttribute("href", "/sign-up");
  });

  it.each(["sign-up", "sign-in"] as const)(
    "routes a valid %s email form to its verification flow",
    (mode) => {
      render(<AuthForm mode={mode} />);

      if (mode === "sign-up") {
        fireEvent.change(screen.getByLabelText("Password"), {
          target: { value: "secure-pass" },
        });
        fireEvent.change(screen.getByLabelText("Confirm password"), {
          target: { value: "secure-pass" },
        });
      }

      const buttonName = mode === "sign-up" ? "Create account" : "Sign in";
      const form = screen
        .getByRole("button", { name: buttonName })
        .closest("form");

      if (!form) {
        throw new Error(`Expected the ${mode} button to be in a form.`);
      }

      fireEvent.submit(form);

      expect(routerPush).toHaveBeenCalledWith(`/verify-email?flow=${mode}`);
    },
  );
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

    expect(
      screen.getByText(
        "Your starting point will be saved when onboarding is connected.",
      ),
    ).toBeInTheDocument();
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
