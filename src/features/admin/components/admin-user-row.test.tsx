import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendJsonMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  sendJson: (...args: unknown[]) => sendJsonMock(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

import { AdminUserRow } from "@/features/admin/components/admin-user-row";
import type { AdminUser } from "@/features/admin/lib/users";

const member: AdminUser = {
  id: "usr_2",
  email: "zainab.bello@example.com",
  providerUserId: "did:privy:zainab",
  role: "USER",
  kycStatus: "PENDING",
  bannedAt: null,
  createdAt: "2025-07-21T11:05:00.000Z",
};

function renderRow(
  user: AdminUser = member,
  options: { canManage?: boolean; isSelf?: boolean; preview?: boolean } = {},
) {
  return render(
    <ul>
      <AdminUserRow
        user={user}
        canManage={options.canManage ?? true}
        isSelf={options.isSelf ?? false}
        preview={options.preview ?? false}
      />
    </ul>,
  );
}

function chooseAdministrator() {
  fireEvent.click(screen.getByRole("button", { name: "Change role" }));
  fireEvent.click(screen.getByRole("radio", { name: /Administrator/ }));
  fireEvent.click(screen.getByRole("button", { name: "Save role" }));
}

beforeEach(() => {
  sendJsonMock.mockReset();
  refreshMock.mockReset();
});

afterEach(cleanup);

describe("AdminUserRow", () => {
  it("hides the control from an actor without users:manage", () => {
    renderRow(member, { canManage: false });

    expect(screen.getByText("Member")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Change role" })).toBeNull();
  });

  it("reads KYC as quiet metadata instead of another pill", () => {
    renderRow(member);

    expect(screen.getByText(/KYC pending/)).toBeDefined();
    // The opaque provider id is noise on a row that already has an address.
    expect(screen.queryByText("did:privy:zainab")).toBeNull();
  });

  it("shows the provider id when the account has no email", () => {
    renderRow({ ...member, email: null });

    expect(screen.getByText("No email on file")).toBeDefined();
    expect(screen.getByText("did:privy:zainab")).toBeDefined();
  });

  it("shows a preview change without calling the API", async () => {
    renderRow(member, { preview: true });

    chooseAdministrator();

    const notice = await screen.findByRole("status");
    expect(notice.textContent).toMatch(/Preview only/);
    expect(screen.getByText("Administrator")).toBeDefined();
    expect(sendJsonMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("records a live change and refreshes the directory", async () => {
    sendJsonMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: { ...member, role: "ADMIN" },
    });

    renderRow(member);

    chooseAdministrator();

    const notice = await screen.findByRole("status");
    expect(notice.textContent).toBe("Zainab Bello is now administrator.");
    expect(screen.getByText("Administrator")).toBeDefined();
    expect(sendJsonMock).toHaveBeenCalledWith("/api/admin/users/usr_2/role", {
      method: "PATCH",
      body: { role: "ADMIN" },
    });
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("surfaces the API message and keeps the old role", async () => {
    sendJsonMock.mockResolvedValue({
      ok: false,
      status: 403,
      code: "FORBIDDEN",
      message: "Only administrators can change roles.",
    });

    renderRow(member);

    chooseAdministrator();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("Only administrators can change roles.");
    // The badge still reads Member and the editor stays open for a retry, so
    // "Member" appears twice: once as the stored role, once as an option.
    expect(screen.getAllByText("Member")).toHaveLength(2);
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("prevents an administrator from demoting themselves", () => {
    renderRow({ ...member, role: "ADMIN" }, { isSelf: true });

    fireEvent.click(screen.getByRole("button", { name: "Change role" }));

    expect(screen.getByRole("radio", { name: /Member/ })).toBeDisabled();
    expect(
      screen.getByText(/You cannot remove your own admin access/),
    ).toBeDefined();
  });

  it("keeps the save button disabled until the role changes", () => {
    renderRow(member);

    fireEvent.click(screen.getByRole("button", { name: "Change role" }));

    expect(screen.getByRole("button", { name: "Save role" })).toBeDisabled();

    fireEvent.click(screen.getByRole("radio", { name: /Administrator/ }));

    expect(screen.getByRole("button", { name: "Save role" })).toBeEnabled();
  });
});
