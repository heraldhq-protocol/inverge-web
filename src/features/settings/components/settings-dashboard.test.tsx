import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SettingsDashboard } from "@/features/settings/components/settings-dashboard";
import { settingsPreviewData } from "@/features/settings/content/preview-data";

afterEach(cleanup);

describe("SettingsDashboard", () => {
  it("organizes account settings into responsive, meaningful sections", () => {
    render(<SettingsDashboard data={settingsPreviewData} />);

    expect(
      screen.getByRole("heading", { name: "Settings", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Amara Okonkwo" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Profile" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Signing in" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Verification" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Your feed" })).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Notifications" }),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: "Account" })).toBeVisible();
    expect(screen.getByText(/not raw identity documents/i)).toBeInTheDocument();
    expect(
      screen.getByText(/never changes an idea's validation score/i),
    ).toBeInTheDocument();
  });

  it("provides honest preview feedback when saving profile changes", () => {
    render(<SettingsDashboard data={settingsPreviewData} />);

    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    expect(
      screen.getByText("Saved for this preview session"),
    ).toBeInTheDocument();
  });

  it("updates reusable switches with accessible checked state", () => {
    render(<SettingsDashboard data={settingsPreviewData} />);

    const digest = screen.getByRole("switch", { name: "Discovery digest" });
    expect(digest).toHaveAttribute("aria-checked", "false");

    fireEvent.click(digest);
    expect(digest).toHaveAttribute("aria-checked", "true");
  });

  it("edits topic preferences without introducing a second selector pattern", () => {
    render(<SettingsDashboard data={settingsPreviewData} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit interests" }));
    const foodAndRetail = screen.getByRole("button", { name: "Food & retail" });
    expect(foodAndRetail).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(foodAndRetail);
    expect(foodAndRetail).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(foodAndRetail).toBeVisible();
  });

  it("uses the shared custom selector for region preference", () => {
    render(<SettingsDashboard data={settingsPreviewData} />);

    const region = screen.getByRole("combobox", {
      name: "Region preference",
    });
    fireEvent.click(region);
    fireEvent.click(screen.getByRole("option", { name: "Global" }));

    expect(region).toHaveTextContent("Global");
  });

  it("explains unavailable sign-in management instead of faking a change", () => {
    render(<SettingsDashboard data={settingsPreviewData} />);

    fireEvent.click(screen.getByRole("button", { name: "Manage" }));

    expect(
      screen.getByText(
        "Google account management will be available when authentication is connected.",
      ),
    ).toBeInTheDocument();
  });

  it("guards account deletion with privacy and immutability context", () => {
    render(<SettingsDashboard data={settingsPreviewData} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete account" }));

    expect(
      screen.getByRole("heading", { name: "Request account deletion?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/blockchain records cannot be edited/i),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Contact support" }),
    ).toHaveAttribute("href", "/contact");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.queryByRole("heading", { name: "Request account deletion?" }),
    ).not.toBeInTheDocument();
  });
});
