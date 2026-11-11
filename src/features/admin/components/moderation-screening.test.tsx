import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/client", () => ({ sendJson: vi.fn() }));
import { sendJson } from "@/lib/api/client";
import { ModerationScreening } from "./moderation-screening";

const record = {
  id: "case-1",
  kind: "idea",
  ideaId: null,
  campaignId: null,
  submittedById: "admin-1",
  decision: "HELD_FOR_REVIEW",
  maxRisk: "0.8000",
  categories: [
    {
      code: "POL-AML",
      riskScore: 0.8,
      excerpt: "Example flagged copy",
      draftReason: "Internal category explanation.",
    },
  ],
  reasonCodes: ["POL-AML"],
  internalReason: "Internal financial-crime rationale.",
  externalReason:
    "Your submission is under additional review. We will follow up if anything further is needed.",
  brief: "An internal review brief.",
  provider: "stub",
  policyVersion: "2026-07-25",
  createdAt: "2026-11-05T12:00:00Z",
};
function fill() {
  fireEvent.change(screen.getByLabelText("Text to screen"), {
    target: { value: "Example flagged copy" },
  });
}
function submit() {
  fireEvent.submit(screen.getByRole("form", { name: "Screen content" }));
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(sendJson).mockResolvedValue({
    ok: true,
    data: { mode: "live", screening: record },
  });
});
afterEach(cleanup);

describe("moderation screening controls (FR-901, NFR-14)", () => {
  it("starts empty and validates text without contacting the service", async () => {
    render(<ModerationScreening actorId="admin-1" />);
    expect(
      screen.getByRole("heading", { name: "Ready to screen" }),
    ).toBeInTheDocument();
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter the text to screen.",
    );
    expect(sendJson).not.toHaveBeenCalled();
  });
  it("waits for a case before showing a result and suppresses duplicate submissions", async () => {
    const pending =
      Promise.withResolvers<Awaited<ReturnType<typeof sendJson>>>();
    vi.mocked(sendJson).mockReturnValue(pending.promise);
    render(<ModerationScreening actorId="admin-1" />);
    fill();
    submit();
    submit();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Screening is in progress",
    );
    expect(
      screen.getByRole("button", { name: "Screening content..." }),
    ).toBeDisabled();
    expect(screen.getByLabelText("Text to screen")).toBeDisabled();
    expect(sendJson).toHaveBeenCalledTimes(1);
    pending.resolve({ ok: true, data: { mode: "live", screening: record } });
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Held for review"),
    );
    expect(screen.getByText(/test classifier/)).toBeInTheDocument();
    const explanation = screen.getByRole("heading", {
      name: "Creator-facing explanation",
    }).parentElement;
    expect(explanation).toHaveTextContent(record.externalReason);
    expect(explanation).not.toHaveTextContent(record.internalReason);
    expect(explanation).not.toHaveTextContent("Internal category explanation");
  });
  it("marks results as out of date when the submitted content is edited", async () => {
    render(<ModerationScreening actorId="admin-1" />);
    fill();
    submit();
    await screen.findByRole("heading", { name: "Screening result" });
    fireEvent.change(screen.getByLabelText("Text to screen"), {
      target: { value: "A revised draft" },
    });
    expect(
      screen.getByText(/content has changed since this screening/),
    ).toBeInTheDocument();
    expect(sendJson).toHaveBeenCalledTimes(1);
  });
  it.each(["timeout", "invalid receipt"])(
    "requires a deliberate new screening after an %s",
    async (failure) => {
      vi.mocked(sendJson).mockResolvedValue(
        failure === "timeout"
          ? {
              ok: false,
              status: 0,
              code: "NETWORK_ERROR",
              message: "Connection lost.",
            }
          : {
              ok: true,
              data: {
                mode: "live",
                screening: { ...record, submittedById: "someone-else" },
              },
            },
      );
      render(<ModerationScreening actorId="admin-1" />);
      fill();
      submit();
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "A case may already exist",
      );
      expect(
        screen.getByRole("button", { name: "Run screening" }),
      ).toBeDisabled();
      submit();
      expect(sendJson).toHaveBeenCalledTimes(1);
      fireEvent.click(
        screen.getByRole("button", { name: "Start another screening" }),
      );
      expect(
        screen.getByRole("button", { name: "Run screening" }),
      ).toBeEnabled();
      expect(screen.getByLabelText("Text to screen")).toHaveValue(
        "Example flagged copy",
      );
      expect(sendJson).toHaveBeenCalledTimes(1);
    },
  );
  it("requires reloading after an expired session", async () => {
    vi.mocked(sendJson).mockResolvedValue({
      ok: false,
      status: 401,
      code: "NOT_SIGNED_IN",
      message: "Sign in again.",
    });
    render(<ModerationScreening actorId="admin-1" />);
    fill();
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Sign in again.",
    );
    expect(
      screen.getByRole("link", { name: "Reload moderation" }),
    ).toHaveAttribute("href", "/admin/moderation");
    expect(
      screen.getByRole("button", { name: "Run screening" }),
    ).toBeDisabled();
    expect(screen.queryByRole("status")).toBeNull();
  });
});
