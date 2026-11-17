import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  previewParamAuditEntries,
  previewPlatformParams,
} from "@/features/admin/lib/params";
import { sendJson } from "@/lib/api/client";
import { PlatformParamsEditor } from "./platform-params-editor";

vi.mock("@/lib/api/client", () => ({
  sendJson: vi.fn(),
}));
const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

describe("PlatformParamsEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders active parameters and audit log entries", () => {
    render(
      <PlatformParamsEditor
        initialParams={previewPlatformParams}
        initialAudit={previewParamAuditEntries}
      />,
    );

    expect(screen.getByText("Active Parameters")).toBeInTheDocument();
    expect(
      screen.getAllByText("boost.featured.priceUSD").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Change Audit History")).toBeInTheDocument();
    expect(screen.getAllByText("usr_admin_1").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("System")).not.toBeInTheDocument();
  });

  it("reports an unavailable audit read instead of claiming there are no records", () => {
    render(
      <PlatformParamsEditor
        initialParams={previewPlatformParams}
        initialAudit={[]}
        auditMessage="The audit trail could not be loaded."
      />,
    );

    expect(
      screen.getByText("The audit trail could not be loaded."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("No audit records available."),
    ).not.toBeInTheDocument();
  });

  it("filters parameters based on search query", () => {
    render(
      <PlatformParamsEditor
        initialParams={previewPlatformParams}
        initialAudit={previewParamAuditEntries}
      />,
    );

    const searchInput = screen.getByLabelText("Filter parameter keys");
    fireEvent.change(searchInput, { target: { value: "editorial" } });

    const table = screen.getByRole("table", {
      name: "Active runtime parameters",
    });
    expect(
      within(table).getByText("editorial.emails.enabled"),
    ).toBeInTheDocument();
    expect(
      within(table).queryByText("boost.featured.priceUSD"),
    ).not.toBeInTheDocument();
  });

  it("submits parameter update and reflects changes upon confirmation", async () => {
    vi.mocked(sendJson).mockResolvedValue({
      ok: true,
      data: {
        ok: true,
        params: {
          ...previewPlatformParams,
          "platform.successFeeBps": 600,
        },
      },
    });

    render(
      <PlatformParamsEditor
        initialParams={previewPlatformParams}
        initialAudit={previewParamAuditEntries}
      />,
    );

    // Find the row for platform.successFeeBps and click edit
    const table = screen.getByRole("table", {
      name: "Active runtime parameters",
    });
    const row = within(table)
      .getByText("platform.successFeeBps")
      .closest("tr")!;
    const editButton = within(row).getByRole("button", { name: "Edit" });
    fireEvent.click(editButton);

    const valueInput = screen.getByLabelText("Value");
    fireEvent.change(valueInput, { target: { value: "600" } });

    const saveButton = screen.getByRole("button", { name: "Save Parameter" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(sendJson).toHaveBeenCalledWith("/api/admin/params", {
        method: "PATCH",
        body: {
          params: {
            "platform.successFeeBps": 600,
          },
        },
      });
    });

    expect(await screen.findByText(/successfully updated/)).toBeInTheDocument();
  });

  it("displays error message if update fails", async () => {
    vi.mocked(sendJson).mockResolvedValue({
      ok: false,
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Database update failed",
    });

    render(
      <PlatformParamsEditor
        initialParams={previewPlatformParams}
        initialAudit={previewParamAuditEntries}
      />,
    );

    const keyInput = screen.getByLabelText("Parameter Key");
    fireEvent.change(keyInput, { target: { value: "new.param" } });

    const valueInput = screen.getByLabelText("Value");
    fireEvent.change(valueInput, { target: { value: "test-value" } });

    const saveButton = screen.getByRole("button", { name: "Save Parameter" });
    fireEvent.click(saveButton);

    expect(
      await screen.findByText("Database update failed"),
    ).toBeInTheDocument();
  });
});
