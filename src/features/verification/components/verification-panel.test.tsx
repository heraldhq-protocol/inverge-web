import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const refresh = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

import { VerificationPanel } from "@/features/verification/components/verification-panel";
import type {
  VerificationCaseView,
  VerificationState,
} from "@/features/verification/types";

const decidedAt = "2026-10-30T12:00:00.000Z";

function caseView(
  overrides: Partial<VerificationCaseView> = {},
): VerificationCaseView {
  return {
    attempt: 1,
    createdAt: "2026-10-29T12:00:00.000Z",
    decidedAt: null,
    id: "case-1",
    lastErrorCode: null,
    lastProviderSyncAt: null,
    nextReconcileAt: null,
    providerStatus: null,
    requiresHumanReview: false,
    risk: "NOT_ASSESSED",
    status: "NOT_STARTED",
    statusLabel: "Not started",
    submittedAt: null,
    type: "INDIVIDUAL",
    ...overrides,
  };
}

function verificationState(
  overrides: Partial<VerificationState> = {},
): VerificationState {
  return {
    accountType: "INDIVIDUAL",
    blockers: [],
    business: null,
    businessRegistered: false,
    canStartSession: true,
    complianceHold: false,
    fundsCleared: false,
    identityVerified: false,
    individual: null,
    lastErrorCode: null,
    nextAction: "start",
    nextSubject: "INDIVIDUAL",
    overall: "NOT_STARTED",
    overallLabel: "Not started",
    policyVersion: "test",
    requirements: [
      {
        detail: "Identity verification has not been completed.",
        key: "INDIVIDUAL_IDENTITY",
        label: "Identity document, selfie and liveness",
        satisfied: false,
      },
      {
        detail: "Screening has not completed.",
        key: "INDIVIDUAL_AML",
        label: "Sanctions, PEP and adverse-media screening",
        satisfied: false,
      },
    ],
    ...overrides,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

describe("VerificationPanel", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    refresh.mockClear();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    window.history.replaceState({}, "", "/d/settings/verification");
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("starts a new verification from the not-started state", () => {
    render(<VerificationPanel initial={verificationState()} mode="live" />);

    expect(
      screen.getByRole("heading", { name: "Identity verification" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Start verification" }),
    ).toBeEnabled();
    expect(screen.getByText(/documents stay with the provider/i)).toBeVisible();
  });

  it("continues an existing resubmitted session instead of starting over", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        caseId: "case-1",
        providerRef: "sess-1",
        resumed: true,
        verificationUrl: "",
      }),
    );

    render(
      <VerificationPanel
        initial={verificationState({
          individual: caseView({
            status: "ACTION_REQUIRED",
            statusLabel: "Additional information required",
          }),
          nextAction: "resume",
          overall: "ACTION_REQUIRED",
          overallLabel: "Additional information required",
        })}
        mode="live"
      />,
    );

    const button = screen.getByRole("button", {
      name: "Continue verification",
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/verification/session",
        expect.objectContaining({
          body: JSON.stringify({ subject: "INDIVIDUAL" }),
          method: "POST",
        }),
      );
    });
    await screen.findByText(/did not return a secure verification link/i);
  });

  it("does not offer a new session while a review is open", () => {
    render(
      <VerificationPanel
        initial={verificationState({
          individual: caseView({
            status: "IN_REVIEW",
            statusLabel: "Under review",
          }),
          nextAction: "resolve_review",
          overall: "IN_REVIEW",
          overallLabel: "Under review",
        })}
        mode="live"
      />,
    );

    expect(screen.getByText("With our review team")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Start verification" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check status" })).toBeEnabled();
  });

  it("shows the completed date without asking for another session", () => {
    render(
      <VerificationPanel
        initial={verificationState({
          identityVerified: true,
          individual: caseView({
            decidedAt,
            status: "APPROVED",
            statusLabel: "Approved",
          }),
          nextAction: "none",
          overall: "APPROVED",
          overallLabel: "Approved",
          requirements: [
            {
              detail: "Your identity checks are approved.",
              key: "INDIVIDUAL_IDENTITY",
              label: "Identity document, selfie and liveness",
              satisfied: true,
            },
          ],
        })}
        mode="live"
      />,
    );

    expect(screen.getByText("Identity verified")).toBeVisible();
    expect(screen.getByText("Completed 30 Oct 2026")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Start verification" }),
    ).not.toBeInTheDocument();
  });

  it("shows an actionable error when the session request is unavailable", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));

    render(<VerificationPanel initial={verificationState()} mode="live" />);
    fireEvent.click(screen.getByRole("button", { name: "Start verification" }));

    await screen.findByRole("alert");
    expect(screen.getByRole("alert")).toHaveTextContent(
      /could not reach the verification service/i,
    );
  });

  it("keeps the business form hidden once a business case is open", () => {
    render(
      <VerificationPanel
        initial={verificationState({
          accountType: "BUSINESS",
          business: caseView({
            status: "AWAITING_USER",
            statusLabel: "Verification in progress",
            type: "BUSINESS",
          }),
          businessRegistered: true,
          nextAction: "resume",
          nextSubject: "BUSINESS",
          overall: "AWAITING_USER",
          overallLabel: "Verification in progress",
        })}
        mode="live"
      />,
    );

    expect(
      screen.queryByRole("heading", { name: "Business details" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue verification" }),
    ).toBeEnabled();
  });

  it("shows the business-details form when the profile is missing", () => {
    render(
      <VerificationPanel
        initial={verificationState({
          accountType: "BUSINESS",
          businessRegistered: false,
          nextAction: "complete_business_profile",
          nextSubject: "BUSINESS",
        })}
        mode="live"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Business details" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Add business details" }),
    ).toBeVisible();
  });
});
