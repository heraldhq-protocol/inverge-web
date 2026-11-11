import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  AdminUsersDirectory,
  AdminUsersUnavailable,
} from "@/features/admin/components/admin-users-directory";

afterEach(cleanup);

describe("admin directory recovery", () => {
  it("keeps the search and role when returning from an empty later page", () => {
    render(
      <AdminUsersDirectory
        users={[]}
        actorId="usr_admin"
        canManage
        preview={false}
        query="amara"
        role="ADMIN"
        offset={25}
        hasMore={false}
      />,
    );

    expect(screen.getByText("No accounts on this page")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to first page" }),
    ).toHaveAttribute("href", "/admin/users?q=amara&role=ADMIN");
    expect(screen.queryByRole("link", { name: "Clear filters" })).toBeNull();
  });

  it("offers to clear an unmatched first-page search", () => {
    render(
      <AdminUsersDirectory
        users={[]}
        actorId="usr_admin"
        canManage
        preview={false}
        query="no-match"
        offset={0}
        hasMore={false}
      />,
    );

    expect(screen.getByText("No matching accounts")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clear filters" })).toHaveAttribute(
      "href",
      "/admin/users",
    );
    expect(
      screen.queryByRole("link", { name: "Back to first page" }),
    ).toBeNull();
  });

  it("retries the same directory page after a service failure", () => {
    render(
      <AdminUsersUnavailable
        reason="The account service could not be reached."
        query="amara"
        role="ADMIN"
        offset={25}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "The account service could not be reached.",
    );
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute(
      "href",
      "/admin/users?q=amara&role=ADMIN&offset=25",
    );
  });
});
