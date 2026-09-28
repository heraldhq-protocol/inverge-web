import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { NotificationsDashboard } from "@/features/notifications/components/notifications-dashboard";
import { notificationsPreviewData } from "@/features/notifications/content/preview-data";

afterEach(cleanup);

describe("NotificationsDashboard", () => {
  it("renders grouped notification activity with clear unread state", () => {
    render(<NotificationsDashboard items={notificationsPreviewData} />);

    expect(
      screen.getByRole("heading", { name: "Notifications", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "Search notifications" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Earlier this week" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Older" })).toBeInTheDocument();
    expect(screen.getAllByLabelText("Unread")).toHaveLength(3);
    expect(
      screen.getByText("Showing all 7 matching notifications"),
    ).toBeInTheDocument();
  });

  it("filters lifecycle updates through shareable tab state", () => {
    render(
      <NotificationsDashboard
        items={notificationsPreviewData}
        selectedFilter="milestones"
      />,
    );

    expect(screen.getByRole("link", { name: "Milestones" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("heading", { name: "A milestone is ready for review" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Campaign funded successfully" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Showing all 3 matching notifications"),
    ).toBeInTheDocument();
  });

  it("marks every notification as read without navigating", () => {
    render(<NotificationsDashboard items={notificationsPreviewData} />);

    fireEvent.click(screen.getByRole("button", { name: "Mark all as read" }));

    expect(screen.queryAllByLabelText("Unread")).toHaveLength(0);
    expect(screen.getByRole("button", { name: "All read" })).toBeDisabled();
  });

  it("shows the caught-up state after clearing the unread queue", () => {
    render(
      <NotificationsDashboard
        items={notificationsPreviewData}
        selectedFilter="unread"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Mark all as read" }));

    expect(
      screen.getByRole("heading", {
        name: "You have no unread notifications",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Show all notifications" }),
    ).toHaveAttribute("href", "/notifications");
  });

  it("provides a recovery path when notification search has no matches", () => {
    render(
      <NotificationsDashboard
        items={notificationsPreviewData}
        query="not-a-real-notification"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "No notifications found" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No matches")).toBeInTheDocument();
  });
});
