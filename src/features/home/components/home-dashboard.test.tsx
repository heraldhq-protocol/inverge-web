import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { HomeDashboard } from "@/features/home/components/home-dashboard";
import { toActivityItems } from "@/features/home/lib/activity";
import { deriveDashboardModules } from "@/features/home/lib/dashboard-modules";
import { rankIdeasForFeed } from "@/features/home/lib/feed";
import type { QuickAction } from "@/features/home/types";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { allPublicIdeas } from "@/features/ideas/lib/catalog";
import { notificationsPreviewData } from "@/features/notifications/content/preview-data";

const actions: QuickAction[] = [
  {
    description: "Find ideas worth backing",
    href: "/d/discover",
    icon: "compass",
    label: "Support an idea",
  },
  {
    description: "Help creators improve",
    href: "/ideas/campus-konekt",
    icon: "feedback",
    label: "Share feedback",
  },
  {
    description: "Compete and win",
    href: "/d/ideathons",
    icon: "trophy",
    label: "Join an ideathon",
  },
  {
    description: "Publish and validate",
    href: "/d/ideas/new",
    icon: "idea",
    label: "Start an idea",
  },
];

const allIdeas = allPublicIdeas(ideasPreviewData);
const featured = ideasPreviewData.featured[0];
const trending = rankIdeasForFeed(allIdeas, {
  excludeIds: featured ? [featured.id] : [],
  limit: 4,
});

function renderDashboard(overrides: { isNewViewer?: boolean } = {}) {
  return render(
    <HomeDashboard
      actions={actions}
      activity={toActivityItems(notificationsPreviewData, 4)}
      creatorSnapshot={{
        draftCount: 1,
        feedbackReceived: 3,
        ownedIdeaCount: 4,
        publishedCount: 1,
      }}
      featured={featured}
      greeting="Good morning"
      ideathon={{
        closesLabel: "Submissions close 24 Oct 2026",
        href: "/d/ideathons",
        statusLabel: "Submissions open",
        theme: "Big ideas. Real impact.",
        title: "Sustainable Solutions",
      }}
      isNewViewer={overrides.isNewViewer ?? false}
      modules={deriveDashboardModules(
        {
          capabilities: {
            creator: true,
            ideathonParticipant: false,
            programmeOrganizer: false,
          },
        },
        { ownedIdeaCount: 4, previewEligible: true },
      )}
      recommended={[]}
      trending={trending}
      viewerName="Amara Okonkwo"
    />,
  );
}

afterEach(cleanup);

describe("HomeDashboard", () => {
  it("greets the signed-in viewer with their display name", () => {
    renderDashboard();

    expect(
      screen.getByRole("heading", { name: "Good morning, Amara." }),
    ).toBeInTheDocument();
  });

  it("labels a paid featured placement as promoted", () => {
    renderDashboard();

    expect(
      screen.getByRole("heading", { name: "Real ideas. Local impact." }),
    ).toBeInTheDocument();
    expect(screen.getByText("Promoted idea")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Explore this idea/ }),
    ).toHaveAttribute("href", "/ideas/campus-konekt");
  });

  it("quick actions point at destinations that exist", () => {
    renderDashboard();

    expect(
      screen.getByRole("link", { name: /Support an idea/ }),
    ).toHaveAttribute("href", "/d/discover");
    expect(
      screen.getByRole("link", { name: /Join an ideathon/ }),
    ).toHaveAttribute("href", "/d/ideathons");
  });

  it("does not repeat the featured idea in the momentum grid", () => {
    renderDashboard();

    const heading = screen.getByRole("heading", {
      name: "Ideas gaining momentum",
    });
    const section = heading.closest("section");
    expect(section).not.toBeNull();

    const grid = within(section as HTMLElement);
    expect(grid.queryByText("CampusKonekt")).not.toBeInTheDocument();
    expect(
      grid.getByRole("link", { name: /SunGrid Community Power/ }),
    ).toHaveAttribute("href", "/ideas/sungrid-community-power");
  });

  it("renders activity from the notification projection", () => {
    renderDashboard();

    expect(screen.getByText("Your activity")).toBeInTheDocument();
    expect(
      screen.getByText("A milestone is ready for review"),
    ).toBeInTheDocument();
  });

  it("sends a creator back to Creator Studio rather than onboarding", () => {
    renderDashboard();

    expect(
      screen.getByRole("link", { name: /Open Creator Studio/ }),
    ).toHaveAttribute("href", "/d/creator");
    expect(screen.queryByText(/New here\?/)).not.toBeInTheDocument();
  });

  it("explains the product instead of showing empty metrics for a new viewer", () => {
    renderDashboard({ isNewViewer: true });

    expect(
      screen.getByRole("heading", {
        name: "New here? Start with one of these",
      }),
    ).toBeInTheDocument();
  });
});
