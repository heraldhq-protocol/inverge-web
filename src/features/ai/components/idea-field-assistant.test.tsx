import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { IdeaFieldAssistant } from "@/features/ai/components/idea-field-assistant";
import type { AiAccess, IdeaSuggestion } from "@/features/ai/types";

const { sendJson } = vi.hoisted(() => ({ sendJson: vi.fn() }));

vi.mock("@/lib/api/client", () => ({ sendJson }));

const access: AiAccess = {
  feature: "ai.assistant",
  configured: true,
  premium: true,
  requestStatus: "APPROVED",
  canRequest: false,
  source: "ADMIN",
  expiresAt: null,
  requestsToday: 1,
  tokensToday: 100,
  requestsPerDay: 30,
  tokensPerDay: 60_000,
};

const suggestion: IdeaSuggestion = {
  suggestionId: "7f3c4f5e-8a1b-4c2d-9e0f-1a2b3c4d5e6f",
  action: "improve",
  target: "problem",
  baseRevision: "rev-1",
  proposal: "A clearer statement of the problem.",
  notes: ["Names the affected group."],
  assumptions: ["The current alternative is still accurate."],
  meta: {
    model: "deepseek-flash",
    promptVersion: "idea-assistant.v1",
    inputTokens: 120,
    outputTokens: 40,
    latencyMs: 1_200,
  },
};

function renderAssistant(
  overrides: Partial<Parameters<typeof IdeaFieldAssistant>[0]> = {},
) {
  const props = {
    field: "problem" as const,
    value: "The original problem text.",
    context: { title: "Solar kiosks" },
    baseRevision: "rev-1",
    ideaId: "idea-1",
    access,
    accessLoading: false,
    requestingAccess: false,
    onRefreshAccess: vi.fn(),
    onRequestAccess: vi.fn(),
    onSaveFirst: vi.fn().mockResolvedValue("idea-1"),
    onApply: vi.fn(),
    ...overrides,
  };

  return { props, ...render(<IdeaFieldAssistant {...props} />) };
}

beforeEach(() => {
  sendJson.mockReset();
  vi.stubGlobal("crypto", {
    randomUUID: () => "3d0f2e7a-6b1c-4a8d-9f2e-5c7b9a1d3e4f",
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("IdeaFieldAssistant", () => {
  it("shows a proposal only after an explicit request", async () => {
    // #given a premium creator with a saved draft
    sendJson.mockResolvedValue({ ok: true, data: suggestion });
    const { props } = renderAssistant();

    // #when they open the assistant and ask for an improvement
    fireEvent.click(screen.getByRole("button", { name: /AI assist/i }));
    fireEvent.click(screen.getByRole("button", { name: "Improve" }));

    // #then the text appears as a proposal, not an edit
    expect(
      await screen.findByText("A clearer statement of the problem."),
    ).toBeTruthy();
    expect(props.onApply).not.toHaveBeenCalled();
    expect(sendJson).toHaveBeenCalledWith(
      "/api/ideas/idea-1/assistant",
      expect.objectContaining({
        method: "POST",
        body: expect.objectContaining({
          action: "improve",
          target: "problem",
          text: "The original problem text.",
          baseRevision: "rev-1",
        }),
      }),
    );
  });

  it("applies only on request and restores the original text", async () => {
    // #given a proposal
    sendJson.mockResolvedValue({ ok: true, data: suggestion });
    const onApply = vi.fn();
    const { props, rerender } = renderAssistant({ onApply });

    fireEvent.click(screen.getByRole("button", { name: /AI assist/i }));
    fireEvent.click(screen.getByRole("button", { name: "Improve" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Use this text" }),
    );

    // #then the parent receives the proposal
    expect(onApply).toHaveBeenCalledWith("A clearer statement of the problem.");

    // #when the parent reflects the applied text
    rerender(
      <IdeaFieldAssistant {...props} value={suggestion.proposal as string} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Restore original" }));

    // #then the exact original is restored
    expect(onApply).toHaveBeenLastCalledWith("The original problem text.");
  });

  it("discards a proposal that arrives after the field changed", async () => {
    // #given a provider call that has not answered yet
    let resolve!: (value: unknown) => void;
    sendJson.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const onApply = vi.fn();
    const { props, rerender } = renderAssistant({ onApply });

    fireEvent.click(screen.getByRole("button", { name: /AI assist/i }));
    fireEvent.click(screen.getByRole("button", { name: "Improve" }));

    // #when the creator keeps typing before it arrives
    rerender(<IdeaFieldAssistant {...props} value="A newer problem text." />);
    resolve({ ok: true, data: suggestion });

    // #then the stale proposal is discarded with an explanation
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(
      /changed while the assistant was working/i,
    );
    expect(onApply).not.toHaveBeenCalled();
    expect(screen.queryByText(suggestion.proposal as string)).toBeNull();
  });

  it("keeps the locked state visible and offers a request", () => {
    // #given a free creator who has not requested access
    const onRequestAccess = vi.fn();
    renderAssistant({
      access: {
        ...access,
        premium: false,
        requestStatus: "NONE",
        canRequest: true,
      },
      onRequestAccess,
    });

    // #when they open the assistant
    fireEvent.click(screen.getByRole("button", { name: /AI assist/i }));
    fireEvent.click(screen.getByRole("button", { name: "Request AI access" }));

    // #then the control is present but gated, and the request is explicit
    expect(onRequestAccess).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Improve" })).toBeNull();
  });

  it("does not call the provider for an empty field", async () => {
    // #given a premium creator and an empty field
    renderAssistant({ value: "   " });

    fireEvent.click(screen.getByRole("button", { name: /AI assist/i }));
    fireEvent.click(screen.getByRole("button", { name: "Improve" }));

    // #then they are asked to write something first
    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toMatch(
        /write your problem first/i,
      );
    });
    expect(sendJson).not.toHaveBeenCalled();
  });
});
