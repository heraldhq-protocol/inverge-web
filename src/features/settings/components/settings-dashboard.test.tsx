import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const refresh = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

import { SettingsDashboard } from "@/features/settings/components/settings-dashboard";
import { settingsPreviewData } from "@/features/settings/content/preview-data";
import type { SettingsData } from "@/features/settings/types";

const liveData: SettingsData = {
  ...settingsPreviewData,
  source: "api",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

beforeEach(() => {
  refresh.mockClear();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      jsonResponse({
        saved: true,
        feed: {
          region: "global",
          showPromoted: true,
          topics: [],
        },
        notifications: {
          creatorUpdates: true,
          discoveryDigest: true,
          emailUpdates: true,
          milestoneReviews: true,
        },
      }),
    ),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("SettingsDashboard", () => {
  it("organizes account settings into responsive, meaningful sections", () => {
    render(<SettingsDashboard data={settingsPreviewData} />);

    expect(
      screen.getByRole("heading", { name: "Settings", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Amara Okonkwo" }),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: "Profile" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Signing in" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Email" })).toBeVisible();
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

  it("marks a preview session read-only instead of pretending to save", () => {
    render(<SettingsDashboard data={settingsPreviewData} />);

    expect(screen.getByText("Preview session")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save profile" })).toBeDisabled();
    expect(
      screen.getByText(/profile saves need a live account/i),
    ).toBeInTheDocument();
  });

  it("saves profile changes to the API and keeps the server response authoritative", async () => {
    render(<SettingsDashboard data={liveData} />);

    fireEvent.change(screen.getByLabelText("Display name"), {
      target: { value: "Amara O." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    await waitFor(() =>
      expect(screen.getByText("Profile saved")).toBeInTheDocument(),
    );
    expect(refresh).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(
      "/api/settings/profile",
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("updates reusable switches with accessible checked state", () => {
    render(<SettingsDashboard data={liveData} />);

    const digest = screen.getByRole("switch", { name: "Discovery digest" });
    expect(digest).toHaveAttribute("aria-checked", "false");

    fireEvent.click(digest);
    expect(digest).toHaveAttribute("aria-checked", "true");
  });

  it("edits topic preferences without introducing a second selector pattern", () => {
    render(<SettingsDashboard data={liveData} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit interests" }));
    const food = screen.getByRole("button", { name: "Food" });
    expect(food).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(food);
    expect(food).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(food).toBeVisible();
  });

  it("uses the shared custom selector for region preference", () => {
    render(<SettingsDashboard data={liveData} />);

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
      screen.getByText(/connections are managed by the sign-in provider/i),
    ).toBeInTheDocument();
  });

  it("guards account deletion with privacy and immutability context", () => {
    render(<SettingsDashboard data={liveData} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete account" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Request account deletion?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/blockchain records cannot be edited/i),
    ).toBeVisible();
    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("link", { name: "Contact support" }),
    ).toHaveAttribute("href", "/contact");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("exposes every settings section through the in-page navigation", () => {
    render(<SettingsDashboard data={settingsPreviewData} />);

    const navigation = screen.getByRole("navigation", {
      name: "Settings sections",
    });

    for (const label of [
      "Profile",
      "Sign in",
      "Email",
      "Verification",
      "Wallet",
      "Feed",
      "Notifications",
      "Account",
    ]) {
      expect(
        within(navigation).getByRole("link", { name: label }),
      ).toBeInTheDocument();
    }
  });

  it("only enables notification saving after a preference changes", async () => {
    render(<SettingsDashboard data={liveData} />);

    const save = screen.getByRole("button", {
      name: "Save notifications",
    });
    expect(save).toBeDisabled();

    fireEvent.click(screen.getByRole("switch", { name: "Discovery digest" }));
    expect(save).toBeEnabled();
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();

    fireEvent.click(save);
    await waitFor(() =>
      expect(
        screen.getByText("Notification preferences saved"),
      ).toBeInTheDocument(),
    );
  });

  it("opens the email verification flow from the account email", () => {
    const unverified: SettingsData = {
      ...liveData,
      account: { ...liveData.account, emailVerified: false },
      connections: liveData.connections.map((connection) =>
        connection.id === "email"
          ? { ...connection, actionLabel: "Verify", status: "connected" }
          : connection,
      ),
    };
    render(<SettingsDashboard data={unverified} />);

    fireEvent.click(screen.getByRole("button", { name: "Verify email" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toHaveValue(
      "amara@example.com",
    );
  });
});
