import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AdminActor } from "@/features/admin/permissions";
import { findPreviewCampaignById } from "@/features/campaigns/content/preview-campaigns";
import { CAMPAIGN_REVIEW_MIN_REASON } from "@/features/campaigns/lib/admin-review";
import { getCampaignReviewStoreKey } from "@/features/campaigns/lib/admin-review-store";
import type { Campaign } from "@/features/campaigns/types";

const REVIEWER: AdminActor = {
  id: "admin-ada",
  name: "Ada Reviewer",
  role: "platform_admin",
};

const ORGANISER: AdminActor = {
  id: "org-tunde",
  name: "Tunde Organiser",
  role: "organiser",
};

function fixture(id: string): Campaign {
  const campaign = findPreviewCampaignById(id);
  if (!campaign) throw new Error(`Expected the ${id} fixture`);
  return campaign;
}

/**
 * The review store keeps a module-level snapshot, so each test imports the
 * component into a fresh module registry rather than inheriting the last test's
 * decisions. That keeps the assertions order-independent.
 */
async function renderDetail(actor: AdminActor, campaign: Campaign) {
  const { AdminCampaignReviewDetail } =
    await import("@/features/campaigns/components/admin-campaign-review-detail");
  return render(
    <AdminCampaignReviewDetail actor={actor} initialCampaign={campaign} />,
  );
}

beforeEach(() => {
  vi.resetModules();
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("AdminCampaignReviewDetail", () => {
  it("shows the plan and the escrow rules the decision rests on", async () => {
    await renderDetail(REVIEWER, fixture("campaign-naija-craft"));

    expect(screen.getByRole("heading", { name: "The pitch" })).toBeDefined();
    expect(screen.getByText("All-or-Nothing")).toBeDefined();
    expect(screen.getAllByText("Evidence required")).toHaveLength(4);
    expect(
      screen.getByText(
        /Funds already released under a milestone are not clawed back/,
      ),
    ).toBeDefined();
  });

  it("names the preconditions it has not verified", async () => {
    await renderDetail(REVIEWER, fixture("campaign-naija-craft"));

    expect(screen.getByText("Identity verification (FR-103)")).toBeDefined();
    expect(
      screen.getByText("Application fee confirmed (FR-311)"),
    ).toBeDefined();
    expect(screen.getAllByText("Missing")).toHaveLength(4);
  });

  it("refuses the decision to a role without campaign:review", async () => {
    await renderDetail(ORGANISER, fixture("campaign-naija-craft"));

    expect(screen.getByText("campaign:review")).toBeDefined();
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("does not offer a second decision for a campaign that is not in review", async () => {
    await renderDetail(REVIEWER, fixture("campaign-green-miles"));

    expect(
      screen.getByText(/no further decision can be recorded/),
    ).toBeDefined();
    expect(screen.queryByRole("radio")).toBeNull();
  });

  it("requires a reason before a change request is recorded", async () => {
    await renderDetail(REVIEWER, fixture("campaign-naija-craft"));

    fireEvent.click(screen.getByRole("radio", { name: /Request changes/ }));
    fireEvent.click(screen.getByRole("button", { name: "Request changes" }));

    expect(
      screen.getByText(
        `Give the creator a reason of at least ${CAMPAIGN_REVIEW_MIN_REASON} characters.`,
      ),
    ).toBeDefined();
    expect(
      screen.getByText(
        "No decision has been recorded in this browser for this campaign.",
      ),
    ).toBeDefined();
    expect(window.localStorage.getItem(getCampaignReviewStoreKey())).toBeNull();
  });

  it("records an approval locally and says it was not sent to the API", async () => {
    await renderDetail(REVIEWER, fixture("campaign-naija-craft"));

    fireEvent.click(screen.getByRole("radio", { name: /Approve for funding/ }));
    fireEvent.click(
      screen.getByRole("button", { name: "Approve for funding" }),
    );

    expect(screen.getByRole("status").textContent).toContain(
      "recorded in this browser. It has not been sent to the API.",
    );
    expect(screen.getByText("Approved for funding")).toBeDefined();
    expect(screen.getByText(/Awaiting review/)).toBeDefined();
    expect(
      window.localStorage.getItem(getCampaignReviewStoreKey()),
    ).not.toBeNull();
    expect(
      screen.queryByRole("button", { name: "Approve for funding" }),
    ).toBeNull();
  });
});
