import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProfileOnboardingForm } from "@/features/auth/components/profile-onboarding-form";

const routerReplace = vi.hoisted(() => vi.fn());
const routerRefresh = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: routerRefresh,
    replace: routerReplace,
  }),
}));

const fetchMock = vi.fn();

function jsonResponse(body: unknown, status = 200) {
  return {
    json: async () => body,
    ok: status >= 200 && status < 300,
    status,
  };
}

function renderForm() {
  return render(
    <ProfileOnboardingForm
      initialDisplayName="Amara Okonkwo"
      initialUsername="amara"
    />,
  );
}

function renderPreviewForm(
  props: Partial<Parameters<typeof ProfileOnboardingForm>[0]> = {},
) {
  return render(
    <ProfileOnboardingForm
      initialAccountType={null}
      initialContactName=""
      initialDisplayName=""
      initialUsername=""
      preview
      {...props}
    />,
  );
}

beforeEach(() => {
  fetchMock.mockReset();
  routerReplace.mockReset();
  routerRefresh.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ProfileOnboardingForm", () => {
  it("saves the profile through the BFF and follows its destination", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ nextPath: "/d/creator" }));

    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(routerReplace).toHaveBeenCalledWith("/d/creator");
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/profile", {
      body: JSON.stringify({
        displayName: "Amara Okonkwo",
        username: "amara",
      }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    expect(routerRefresh).toHaveBeenCalledTimes(1);
  });

  it("keeps the typed values and explains a rejected username", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "username_taken" }, 409));

    renderForm();
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "taken-name" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      await screen.findByText(/That username is already taken/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toHaveValue("taken-name");
    expect(routerReplace).not.toHaveBeenCalled();
  });

  it("refuses to send an invalid username", () => {
    renderForm();
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "ab" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      /at least 3 characters/i,
    );
  });

  it("checks availability on blur without blocking the form", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ available: false }));

    renderForm();
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "taken-name" },
    });
    fireEvent.blur(screen.getByLabelText("Username"));

    expect(
      await screen.findByText(/That username is already taken/i),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/username-available?username=taken-name",
      { cache: "no-store" },
    );
  });

  it("offers a sign-in link when the session has expired", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: "session_expired" }, 401),
    );

    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /session has expired/i,
    );
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/auth?next=%2Fonboarding%2Fprofile",
    );
  });

  it("says saving is unavailable instead of pretending it succeeded", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: "api_not_configured" }, 503),
    );

    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /not connected to the Inverge service/i,
    );
    expect(routerReplace).not.toHaveBeenCalled();
  });

  it("asks who the account is for before showing name fields in preview", () => {
    renderPreviewForm();

    expect(screen.getByRole("radio", { name: /Just me/i })).not.toBeChecked();
    expect(
      screen.queryByLabelText(/^(Your name|Business name)$/),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      /Choose whether this account is for you or a business/i,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("saves a business account with its trading name and contact", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ nextPath: "/onboarding/role?intent=creator" }),
    );

    renderPreviewForm();
    fireEvent.click(screen.getByRole("radio", { name: /A business/i }));
    fireEvent.change(screen.getByLabelText("Business name"), {
      target: { value: "  Amara Studio " },
    });
    fireEvent.change(screen.getByLabelText("Your name"), {
      target: { value: " Amara Okonkwo " },
    });
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "Amara-Studio" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(routerReplace).toHaveBeenCalledWith(
        "/onboarding/role?intent=creator",
      );
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/profile", {
      body: JSON.stringify({
        accountType: "business",
        contactName: "Amara Okonkwo",
        displayName: "Amara Studio",
        username: "amara-studio",
      }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
  });

  it("saves an individual account without a business contact", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ nextPath: "/onboarding/role" }));

    renderPreviewForm({
      initialAccountType: "individual",
      initialDisplayName: "Amara Okonkwo",
      initialUsername: "amara",
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(routerReplace).toHaveBeenCalledWith("/onboarding/role");
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/profile", {
      body: JSON.stringify({
        accountType: "individual",
        displayName: "Amara Okonkwo",
        username: "amara",
      }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
  });
});
