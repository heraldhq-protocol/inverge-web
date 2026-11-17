import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  previewEditorialPreviewResult,
  previewEmailTemplates,
} from "@/features/admin/lib/editorial-email";
import { sendJson } from "@/lib/api/client";
import { EditorialEmailComposer } from "./editorial-email-composer";

vi.mock("@/lib/api/client", () => ({
  sendJson: vi.fn(),
}));

describe("EditorialEmailComposer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders composer with template list and instructions", () => {
    render(<EditorialEmailComposer templates={previewEmailTemplates} />);

    expect(screen.getByText("Compose Editorial Dispatch")).toBeInTheDocument();
    expect(screen.getByText("Template Preview")).toBeInTheDocument();
    expect(
      screen.getByText(/Click "Generate Preview" to inspect/),
    ).toBeInTheDocument();
  });

  it("disables preview and dispatch when no editorial templates are available", () => {
    render(
      <EditorialEmailComposer
        templates={[
          {
            templateId: "KYC_APPROVED",
            category: "transactional",
            name: "KYC approved",
            requiredVariables: ["name"],
            optionalVariables: [],
          },
        ]}
      />,
    );

    expect(
      screen.getByText(
        "No editorial templates are available on the connected service.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate Preview" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Send Editorial Dispatch" }),
    ).toBeDisabled();
  });

  it("renders preview when clicking Generate Preview", async () => {
    vi.mocked(sendJson).mockResolvedValue({
      ok: true,
      data: {
        ok: true,
        preview: previewEditorialPreviewResult,
      },
    });

    render(<EditorialEmailComposer templates={previewEmailTemplates} />);

    const previewButton = screen.getByRole("button", {
      name: "Generate Preview",
    });
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(sendJson).toHaveBeenCalledWith(
        "/api/admin/email/editorial/preview",
        {
          method: "POST",
          body: {
            templateId: "EDIT_INVERGE",
            variables: {},
          },
        },
      );
    });

    expect(
      await screen.findByText(previewEditorialPreviewResult.subject),
    ).toBeInTheDocument();
  });

  it("submits editorial dispatch and renders delivery confirmation", async () => {
    vi.mocked(sendJson).mockResolvedValue({
      ok: true,
      data: {
        ok: true,
        result: {
          issueId: "editorial-issue-42",
          sentCount: 120,
          suppressedCount: 4,
          status: "DELIVERED",
        },
      },
    });

    render(<EditorialEmailComposer templates={previewEmailTemplates} />);

    const issueInput = screen.getByLabelText("Issue ID");
    fireEvent.change(issueInput, { target: { value: "editorial-issue-42" } });

    const usersInput = screen.getByLabelText("Recipient User IDs");
    fireEvent.change(usersInput, { target: { value: "usr_1\nusr_2" } });

    const sendButton = screen.getByRole("button", {
      name: "Send Editorial Dispatch",
    });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(sendJson).toHaveBeenCalledWith("/api/admin/email/editorial/send", {
        method: "POST",
        body: {
          issueId: "editorial-issue-42",
          templateId: "EDIT_INVERGE",
          userIds: ["usr_1", "usr_2"],
          variables: {},
        },
      });
    });

    expect(
      await screen.findByText("Dispatch Confirmation"),
    ).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("validates missing issue ID before sending", async () => {
    render(<EditorialEmailComposer templates={previewEmailTemplates} />);

    const sendButton = screen.getByRole("button", {
      name: "Send Editorial Dispatch",
    });
    fireEvent.click(sendButton);

    expect(
      await screen.findByText("Issue ID is required to dispatch."),
    ).toBeInTheDocument();
    expect(sendJson).not.toHaveBeenCalled();
  });
});
