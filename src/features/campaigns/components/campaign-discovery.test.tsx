import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CampaignDiscovery } from "@/features/campaigns/components/campaign-discovery";
import { previewCampaigns } from "@/features/campaigns/content/preview-campaigns";
import {
  campaignCategoryCounts,
  campaignSubcategoryCountsByCategory,
  defaultCampaignFilters,
} from "@/features/campaigns/lib/filters";
import {
  SAVED_CAMPAIGNS_STORAGE_KEY,
  savedCampaignRecord,
  serializeSavedCampaigns,
} from "@/features/campaigns/lib/saved-campaigns";
import { isPublicPhase } from "@/features/campaigns/lib/status";
import type { Campaign, CampaignFilters } from "@/features/campaigns/types";

const NOW = "2026-10-19T00:00:00.000Z";

const { navigation } = vi.hoisted(() => ({
  navigation: {
    pathname: "/campaigns",
    search: "",
    push: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push }),
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

const publicCampaigns = previewCampaigns.filter((campaign) =>
  isPublicPhase(campaign.phase),
);
const featured = publicCampaigns.find((campaign) => campaign.featured) ?? null;
const candidates = publicCampaigns.filter(
  (campaign) => campaign.id !== featured?.id,
);

// The page derives filter counts from the discovery candidates, so a featured
// campaign shown above the grid cannot inflate a category chip.
const categoryCounts = campaignCategoryCounts(candidates);
const subcategoryCounts = campaignSubcategoryCountsByCategory(candidates);

function view(
  filters: CampaignFilters = defaultCampaignFilters,
  {
    list = candidates,
    sponsoredSlot = false,
  }: { list?: readonly Campaign[]; sponsoredSlot?: boolean } = {},
) {
  return (
    <CampaignDiscovery
      candidates={list}
      categoryCounts={categoryCounts}
      featuredCandidates={featured ? [featured] : []}
      subcategoryCounts={subcategoryCounts}
      initialFilters={filters}
      nowIso={NOW}
      {...(sponsoredSlot
        ? { sponsoredSlot: <div data-testid="sponsored-slot">Sponsored</div> }
        : {})}
      totalPublic={list.length}
    />
  );
}

beforeEach(() => {
  navigation.search = "";
  navigation.push.mockReset();
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("CampaignDiscovery", () => {
  it("shows one page, then appends the rest without duplicates", () => {
    render(view());

    expect(screen.getAllByRole("link", { name: /^View / })).toHaveLength(6);
    expect(
      screen.getByText("You’ve viewed 6 of 7 campaigns"),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Load more campaigns" }),
    );

    expect(screen.getAllByRole("link", { name: /^View / })).toHaveLength(7);
    expect(
      screen.getByText("You’ve viewed 7 of 7 campaigns"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Load more campaigns" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("You’ve reached the end of these results."),
    ).toBeInTheDocument();
  });

  it("returns to the first page when the search changes", () => {
    render(view());

    fireEvent.click(
      screen.getByRole("button", { name: "Load more campaigns" }),
    );
    expect(screen.getAllByRole("link", { name: /^View / })).toHaveLength(7);

    fireEvent.change(screen.getByLabelText("Search campaigns"), {
      target: { value: "farmlink" },
    });

    expect(screen.getAllByRole("link", { name: /^View / })).toHaveLength(1);
    expect(
      screen.queryByRole("button", { name: "Load more campaigns" }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search campaigns"), {
      target: { value: "" },
    });

    expect(screen.getAllByRole("link", { name: /^View / })).toHaveLength(6);
    expect(
      screen.getByText("You’ve viewed 6 of 7 campaigns"),
    ).toBeInTheDocument();
  });

  it("restores filters when the URL changes, as on back or forward", () => {
    const { rerender } = render(view());

    expect(screen.getByText("7 campaigns match")).toBeInTheDocument();

    navigation.search = "category=technology&sort=newest";
    rerender(view());

    expect(screen.getByText("3 campaigns match")).toBeInTheDocument();
    const technologyRadios = screen.getAllByRole("radio", {
      name: "Technology 3",
      hidden: true,
    });
    expect(technologyRadios).toHaveLength(2);
    for (const radio of technologyRadios) {
      expect(radio).toBeChecked();
    }

    navigation.search = "";
    rerender(view());

    expect(screen.getByText("7 campaigns match")).toBeInTheDocument();
  });

  it("removes one chip without clearing the rest, then clears all", () => {
    render(
      view({
        ...defaultCampaignFilters,
        category: "technology",
        subcategory: "hardware",
      }),
    );

    expect(screen.getByText("1 campaign matches")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Remove filter Hardware" }),
    );

    expect(screen.getByText("3 campaigns match")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));

    expect(screen.getByText("7 campaigns match")).toBeInTheDocument();
  });

  it("keeps the desktop and mobile filter groups independently labelled", () => {
    render(view());

    const technology = screen.getAllByRole("radio", {
      name: "Technology 3",
      hidden: true,
    });

    expect(technology).toHaveLength(2);
    expect(technology[0]).toHaveAttribute("name", "desktop-category-group");
    expect(technology[1]).toHaveAttribute("name", "mobile-category-group");
  });

  it("filters by country and region instead of a fixed Nigeria list", () => {
    render(
      view({
        ...defaultCampaignFilters,
        country: "NG",
        region: "Lagos State, Nigeria",
      }),
    );

    expect(screen.getByText("2 campaigns match")).toBeInTheDocument();

    const nigeria = screen.getAllByRole("radio", {
      name: "Nigeria 7",
      hidden: true,
    });
    expect(nigeria).toHaveLength(2);
    for (const radio of nigeria) expect(radio).toBeChecked();

    const lagos = screen.getAllByRole("radio", {
      name: "Lagos State 2",
      hidden: true,
    });
    expect(lagos).toHaveLength(2);
    for (const radio of lagos) expect(radio).toBeChecked();
  });

  it("offers Projects We Love only from the featured set", () => {
    render(view());

    const loved = screen.getAllByRole("radio", {
      name: "Projects We Love 1",
      hidden: true,
    });
    expect(loved).toHaveLength(2);

    fireEvent.click(loved[0]!);

    expect(screen.getByText("1 campaign matches")).toBeInTheDocument();
  });

  it("disables Recommended for you instead of faking personalisation", () => {
    render(view());

    const recommended = screen.getAllByRole("radio", {
      name: "Recommended for you",
      hidden: true,
    });
    expect(recommended).toHaveLength(2);
    for (const radio of recommended) expect(radio).toBeDisabled();
  });

  it("shows browser-saved campaigns in the saved view", async () => {
    const first = candidates[0];
    if (!first) throw new Error("Expected a discovery candidate");

    window.localStorage.setItem(
      SAVED_CAMPAIGNS_STORAGE_KEY,
      serializeSavedCampaigns([
        savedCampaignRecord({ campaignId: first.id, slug: first.slug }, NOW),
      ]),
    );

    render(view());

    const saved = await screen.findAllByRole("radio", {
      name: "Saved projects 1",
      hidden: true,
    });
    fireEvent.click(saved[0]!);

    await waitFor(() =>
      expect(screen.getByText("1 campaign matches")).toBeInTheDocument(),
    );
  });

  it("shows the reason a recommended campaign is in the list", () => {
    const first = candidates[0];
    if (!first) throw new Error("Expected a discovery candidate");

    render(
      <CampaignDiscovery
        candidates={candidates}
        categoryCounts={categoryCounts}
        subcategoryCounts={subcategoryCounts}
        initialFilters={defaultCampaignFilters}
        nowIso={NOW}
        recommendationReasons={{ [first.id]: "Same subcategory" }}
        totalPublic={candidates.length}
      />,
    );

    expect(screen.getByText("Same subcategory")).toBeInTheDocument();
  });

  it("places the sponsored slot after the sixth organic result, outside the filters", () => {
    render(view(defaultCampaignFilters, { sponsoredSlot: true }));

    const results = document.getElementById("campaign-results");
    expect(results).not.toBeNull();

    const slot = screen.getByTestId("sponsored-slot");
    const children = Array.from(results!.children);
    expect(children.indexOf(slot.parentElement as Element)).toBe(6);

    const filters = screen.getByRole("complementary", {
      name: "Campaign filters",
    });
    expect(filters).not.toContainElement(slot);
  });

  it("does not render a sponsored slot for fewer than six organic results", () => {
    render(
      view(defaultCampaignFilters, {
        list: candidates.slice(0, 5),
        sponsoredSlot: true,
      }),
    );

    expect(screen.queryByTestId("sponsored-slot")).not.toBeInTheDocument();
  });
});

function _campaignTypeGuard(campaign: Campaign): Campaign {
  return campaign;
}

void _campaignTypeGuard;
