import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));
vi.mock("@/lib/api/client", () => ({ sendJson: vi.fn() }));
import { sendJson } from "@/lib/api/client";
import { AmlScreening } from "./aml-screening";

const clearResult = {
  datasets: ["sanctions"],
  topRiskScore: null,
  totalHits: 0,
  status: "CLEAR",
};
const flaggedResult = {
  datasets: ["sanctions", "pep"],
  topRiskScore: "0.8",
  totalHits: 2,
  status: "FLAGGED",
};

function fill({
  userId = "user-1",
  fullName = "Test Person",
  kind = "individual",
} = {}) {
  fireEvent.change(screen.getByLabelText("Account id"), {
    target: { value: userId },
  });
  fireEvent.change(screen.getByLabelText("Full name"), {
    target: { value: fullName },
  });
  fireEvent.change(screen.getByLabelText("Subject type"), {
    target: { value: kind },
  });
}
function submit() {
  fireEvent.submit(screen.getByRole("form", { name: "Run AML screening" }));
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(sendJson).mockResolvedValue({
    ok: true,
    data: {
      mode: "live",
      kind: "individual",
      userId: "user-1",
      result: clearResult,
    },
  });
});
afterEach(cleanup);

describe("AML screening controls (FR-103, FR-104, NFR-19)", () => {
  it("starts empty and validates the subject without contacting the service", async () => {
    render(<AmlScreening />);
    expect(
      screen.getByRole("heading", { name: "Ready to screen" }),
    ).toBeInTheDocument();
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter the account to screen.",
    );
    expect(sendJson).not.toHaveBeenCalled();
  });

  it("waits for a confirmed result and suppresses duplicate submissions", async () => {
    const pending =
      Promise.withResolvers<Awaited<ReturnType<typeof sendJson>>>();
    vi.mocked(sendJson).mockReturnValue(pending.promise);
    render(<AmlScreening />);
    fill();
    submit();
    submit();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Screening is in progress",
    );
    expect(
      screen.getByRole("button", { name: "Screening subject..." }),
    ).toBeDisabled();
    expect(screen.getByLabelText("Full name")).toBeDisabled();
    expect(sendJson).toHaveBeenCalledTimes(1);
    expect(vi.mocked(sendJson).mock.calls[0]?.[1].body).toEqual({
      kind: "individual",
      userId: "user-1",
      fullName: "Test Person",
    });
    pending.resolve({
      ok: true,
      data: {
        mode: "live",
        kind: "individual",
        userId: "user-1",
        result: clearResult,
      },
    });
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("No matches found"),
    );
    expect(screen.getByText(/never approves or declines/)).toBeInTheDocument();
    expect(screen.getByText(/Screened just now/)).toBeInTheDocument();
  });

  it("omits empty optional fields and shows flagged findings", async () => {
    vi.mocked(sendJson).mockResolvedValue({
      ok: true,
      data: {
        mode: "live",
        kind: "business",
        userId: "user-2",
        result: flaggedResult,
      },
    });
    render(<AmlScreening />);
    fill({ userId: "user-2", fullName: "Business Ltd", kind: "business" });
    fireEvent.change(screen.getByLabelText("Nationality"), {
      target: { value: "NG" },
    });
    submit();
    await screen.findByRole("status");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Possible match — review required",
    );
    expect(vi.mocked(sendJson).mock.calls[0]?.[1].body).toEqual({
      kind: "business",
      userId: "user-2",
      fullName: "Business Ltd",
      nationality: "NG",
    });
    expect(screen.getByText("0.80")).toBeInTheDocument();
    expect(screen.getByText("sanctions")).toBeInTheDocument();
    expect(screen.getByText("pep")).toBeInTheDocument();
  });

  it("rejects a result that does not match the submitted subject", async () => {
    vi.mocked(sendJson).mockResolvedValue({
      ok: true,
      data: {
        mode: "live",
        kind: "individual",
        userId: "someone-else",
        result: clearResult,
      },
    });
    render(<AmlScreening />);
    fill();
    submit();
    await screen.findByRole("alert");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "did not return a valid confirmation",
    );
    expect(
      screen.getByRole("button", { name: "Run another screening" }),
    ).toBeInTheDocument();
  });

  it("sends optional fields only when filled and requires deliberate re-runs after unconfirmed attempts", async () => {
    vi.mocked(sendJson).mockResolvedValue({
      ok: false,
      status: 0,
      code: "NETWORK_ERROR",
      message: "Connection lost.",
    });
    render(<AmlScreening />);
    fill();
    fireEvent.change(screen.getByLabelText("Date of birth"), {
      target: { value: "1990-01-31" },
    });
    submit();
    await screen.findByRole("alert");
    expect(vi.mocked(sendJson).mock.calls[0]?.[1].body).toEqual({
      kind: "individual",
      userId: "user-1",
      fullName: "Test Person",
      dateOfBirth: "1990-01-31",
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      /may already have been saved/,
    );
    expect(
      screen.getByRole("button", { name: "Run screening" }),
    ).toBeDisabled();
    fireEvent.click(
      screen.getByRole("button", { name: "Run another screening" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Ready to screen" }),
    ).toBeInTheDocument();
  });

  it("sends the optional fields and recovers with a reload after subject errors", async () => {
    vi.mocked(sendJson).mockResolvedValue({
      ok: false,
      status: 404,
      code: "NOT_FOUND",
      message:
        "This account has no registered business to screen. Business screening attaches to the account's business profile.",
    });
    render(<AmlScreening />);
    fill({ userId: "user-3", fullName: "No Business Ltd", kind: "business" });
    submit();
    await screen.findByRole("alert");
    expect(screen.getByRole("alert")).toHaveTextContent(
      /no registered business/,
    );
    const link = screen.getByRole("link", { name: "Reload AML screening" });
    expect(link).toHaveAttribute("href", "/admin/aml");
    expect(sendJson).toHaveBeenCalledTimes(1);
  });
});
