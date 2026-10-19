import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CampaignTabs,
  type CampaignTabPanel,
} from "@/features/campaigns/components/campaign-tabs";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const panels: readonly CampaignTabPanel[] = [
  { content: <p>Story body</p>, tab: { id: "story", label: "Story" } },
  {
    content: <p>Milestones body</p>,
    tab: { id: "milestones", label: "Milestones" },
  },
  { content: <p>Rewards body</p>, tab: { id: "rewards", label: "Rewards" } },
];

function renderTabs(activeTab: "story" | "milestones" | "rewards" = "story") {
  return render(
    <CampaignTabs activeTab={activeTab} panels={panels} slug="sungrid" />,
  );
}

describe("CampaignTabs", () => {
  it("renders only the selected panel, so no other panel is in the page at all", () => {
    renderTabs();

    expect(screen.getByText("Story body")).toBeInTheDocument();
    expect(screen.queryByText("Milestones body")).toBeNull();
    expect(screen.queryByText("Rewards body")).toBeNull();
  });

  it("opens the requested panel, so a shared link lands where it says", () => {
    renderTabs("rewards");

    expect(screen.getByText("Rewards body")).toBeInTheDocument();
    expect(screen.queryByText("Story body")).toBeNull();
  });

  it("links every tab to its own ?tab= URL for a new tab or a reader without JavaScript", () => {
    renderTabs();

    expect(screen.getByRole("tab", { name: "Milestones" })).toHaveAttribute(
      "href",
      "/campaigns/sungrid?tab=milestones",
    );
  });

  it("marks exactly one tab selected", () => {
    renderTabs("milestones");

    expect(screen.getByRole("tab", { name: "Milestones" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Story" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("swaps the panel and writes the tab into the URL without pushing a history entry", () => {
    const replaceState = vi.spyOn(window.history, "replaceState");
    renderTabs();

    fireEvent.click(screen.getByRole("tab", { name: "Rewards" }));

    expect(screen.getByText("Rewards body")).toBeInTheDocument();
    expect(screen.queryByText("Story body")).toBeNull();
    expect(replaceState).toHaveBeenCalled();
    expect(String(replaceState.mock.calls[0]?.[2])).toContain("tab=rewards");
  });

  it("reaches the next tab with the arrow keys and keeps focus on it", () => {
    vi.spyOn(window.history, "replaceState");
    renderTabs();

    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });

    expect(screen.getByText("Milestones body")).toBeInTheDocument();
    expect(document.activeElement).toBe(
      screen.getByRole("tab", { name: "Milestones" }),
    );
  });

  it("wraps from the last tab to the first with the arrow keys", () => {
    vi.spyOn(window.history, "replaceState");
    renderTabs("rewards");

    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });

    expect(screen.getByText("Story body")).toBeInTheDocument();
  });

  it("points the panel at the tab that labels it", () => {
    renderTabs("rewards");

    expect(screen.getByRole("tabpanel")).toHaveAttribute(
      "aria-labelledby",
      "tab-rewards",
    );
  });
});
