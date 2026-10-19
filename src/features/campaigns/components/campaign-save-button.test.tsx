import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CampaignSaveButton } from "@/features/campaigns/components/campaign-save-button";
import {
  SAVED_CAMPAIGNS_STORAGE_KEY,
  parseSavedCampaigns,
  serializeSavedCampaigns,
} from "@/features/campaigns/lib/saved-campaigns";

const campaign = { id: "campaign-sungrid", slug: "sungrid-community-power" };

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

function stored() {
  return parseSavedCampaigns(
    window.localStorage.getItem(SAVED_CAMPAIGNS_STORAGE_KEY),
  );
}

function savedButton() {
  return screen.findByRole("button", { name: "Saved" });
}

function saveButton() {
  return screen.findByRole("button", { name: "Save for later" });
}

describe("CampaignSaveButton", () => {
  it("starts unsaved when this browser holds nothing for the campaign", async () => {
    render(<CampaignSaveButton campaign={campaign} />);

    expect(await saveButton()).toBeInTheDocument();
  });

  it("shows a saved campaign as saved on load", async () => {
    window.localStorage.setItem(
      SAVED_CAMPAIGNS_STORAGE_KEY,
      serializeSavedCampaigns([
        {
          campaignId: campaign.id,
          savedAt: "2026-01-01T00:00:00.000Z",
          slug: campaign.slug,
        },
      ]),
    );

    render(<CampaignSaveButton campaign={campaign} />);

    expect(await savedButton()).toHaveAttribute("aria-pressed", "true");
  });

  it("only shows the saved state after the write lands, and says where it was saved", async () => {
    render(<CampaignSaveButton campaign={campaign} />);

    fireEvent.click(await saveButton());

    expect(await savedButton()).toBeInTheDocument();
    expect(stored().map((record) => record.campaignId)).toEqual([campaign.id]);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Saved in this browser.",
    );
  });

  it("removes the campaign again on a second press", async () => {
    render(<CampaignSaveButton campaign={campaign} />);
    fireEvent.click(await saveButton());
    fireEvent.click(await savedButton());

    await waitFor(() => expect(stored()).toEqual([]));
    expect(await saveButton()).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Removed from your saved campaigns.",
    );
  });

  it("reports that nothing was saved when the browser refuses the write", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    render(<CampaignSaveButton campaign={campaign} />);

    fireEvent.click(await saveButton());

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("nothing was saved"),
    );
    expect(
      screen.getByRole("button", { name: "Save for later" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("never claims account synchronisation", async () => {
    render(<CampaignSaveButton campaign={campaign} />);

    expect((await saveButton()).getAttribute("title")).toContain(
      "this browser only",
    );
  });
});
