import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SavedCampaignsDashboard } from "@/features/campaigns/components/saved-campaigns-dashboard";
import { findPreviewCampaignById } from "@/features/campaigns/content/preview-campaigns";
import {
  SAVED_CAMPAIGNS_STORAGE_KEY,
  parseSavedCampaigns,
  serializeSavedCampaigns,
  type SavedCampaignRecord,
} from "@/features/campaigns/lib/saved-campaigns";
import type { Campaign } from "@/features/campaigns/types";

const NOW = "2026-10-19T00:00:00.000Z";

function sungrid(): Campaign {
  const campaign = findPreviewCampaignById("campaign-sungrid");
  if (!campaign) throw new Error("Expected the sungrid fixture");
  return campaign;
}

function seed(records: readonly SavedCampaignRecord[]) {
  window.localStorage.setItem(
    SAVED_CAMPAIGNS_STORAGE_KEY,
    serializeSavedCampaigns(records),
  );
}

function record(
  campaignId: string,
  slug: string,
  savedAt = "2026-01-01T00:00:00.000Z",
): SavedCampaignRecord {
  return { campaignId, savedAt, slug };
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

function renderDashboard(candidates: readonly Campaign[]) {
  return render(
    <SavedCampaignsDashboard candidates={candidates} nowIso={NOW} />,
  );
}

describe("SavedCampaignsDashboard", () => {
  it("says the list is browser-local before anything else", () => {
    renderDashboard([sungrid()]);

    expect(
      screen.getByText(/Saved campaigns are kept in this browser only/),
    ).toBeInTheDocument();
  });

  it("keeps empty apart from still-reading", async () => {
    renderDashboard([sungrid()]);

    expect(
      await screen.findByText("Save a campaign to come back to it"),
    ).toBeInTheDocument();
    expect(screen.getByText(/nothing is charged/)).toBeInTheDocument();
  });

  it("lists a saved campaign that is still public", async () => {
    const campaign = sungrid();
    seed([record(campaign.id, campaign.slug)]);
    renderDashboard([campaign]);

    expect(await screen.findByText("1 saved campaign")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: campaign.title })).toHaveAttribute(
      "href",
      `/campaigns/${campaign.slug}`,
    );
  });

  it("shows a saved id that no longer resolves as unavailable rather than dropping it", async () => {
    seed([record("campaign-withdrawn", "withdrawn")]);
    renderDashboard([sungrid()]);

    expect(await screen.findByText("1 saved campaign")).toBeInTheDocument();
    expect(
      screen.getByText("This campaign is no longer public"),
    ).toBeInTheDocument();
  });

  it("removes a campaign only after the write lands", async () => {
    const campaign = sungrid();
    seed([record(campaign.id, campaign.slug)]);
    renderDashboard([campaign]);

    fireEvent.click(
      await screen.findByRole("button", {
        name: new RegExp(`Remove\\s+${campaign.title} from saved campaigns`),
      }),
    );

    await waitFor(() =>
      expect(
        parseSavedCampaigns(
          window.localStorage.getItem(SAVED_CAMPAIGNS_STORAGE_KEY),
        ),
      ).toEqual([]),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Removed from your saved campaigns.",
    );
    expect(
      await screen.findByText("Save a campaign to come back to it"),
    ).toBeInTheDocument();
  });

  it("reports a refused removal instead of pretending it worked", async () => {
    const campaign = sungrid();
    seed([record(campaign.id, campaign.slug)]);
    renderDashboard([campaign]);

    const button = await screen.findByRole("button", {
      name: new RegExp(`Remove\\s+${campaign.title} from saved campaigns`),
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    fireEvent.click(button);

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "nothing was removed",
      ),
    );
    expect(screen.getByText("1 saved campaign")).toBeInTheDocument();
  });

  it("explains an unreadable store rather than showing an empty list", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Blocked");
    });

    renderDashboard([sungrid()]);

    expect(
      await screen.findByText("Your saved list could not be read"),
    ).toBeInTheDocument();
  });
});
