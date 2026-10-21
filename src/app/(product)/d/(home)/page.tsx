import type { Metadata } from "next";

import { getDashboardViewer } from "@/features/app-shell/server/viewer";
import { getPreviewFeedbackForm } from "@/features/feedback/content/preview-feedback";
import { toActivityItems } from "@/features/home/lib/activity";
import {
  deriveDashboardModules,
  isNewViewer,
} from "@/features/home/lib/dashboard-modules";
import {
  bestFeedbackOpportunity,
  rankIdeasForFeed,
} from "@/features/home/lib/feed";
import { greetingFor } from "@/features/home/lib/greeting";
import { toHomeIdeathon } from "@/features/home/lib/ideathon";
import type { QuickAction } from "@/features/home/types";
import { allPublicIdeas } from "@/features/ideas/lib/catalog";
import { HomeDashboard } from "@/features/home/components/home-dashboard";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { previewMyIdeas } from "@/features/ideas/content/preview-my-ideas";
import { previewFeedbackSubmissions } from "@/features/feedback/content/preview-feedback";
import { notificationsPreviewData } from "@/features/notifications/content/preview-data";
import { prePledgesPreviewData } from "@/features/pre-pledges/content/preview-data";
import { getPreviewActiveIdeathon } from "@/features/programmes/content/preview-programmes";

export const metadata: Metadata = {
  title: "Home",
  description: "Discover ideas and continue your activity on Inverge.",
};

/**
 * The dashboard greeting depends on the server clock, so this route renders per
 * request rather than freezing one greeting into the build output.
 */
export const dynamic = "force-dynamic";

/**
 * Route composition only: every value below is read from an existing fixture
 * through a pure helper. The viewer is the one server lookup, and it is the
 * shell's session seam rather than page data.
 */
export default async function HomePage() {
  const viewer = await getDashboardViewer();
  const publicIdeas = allPublicIdeas(ideasPreviewData);

  const featured = ideasPreviewData.featured.at(0) ?? publicIdeas.at(0);
  const featuredId = featured ? [featured.id] : [];

  const trending = rankIdeasForFeed(publicIdeas, {
    excludeIds: featuredId,
    limit: 4,
  });
  const recommended = rankIdeasForFeed(publicIdeas, {
    excludeIds: [...featuredId, ...trending.map((idea) => idea.id)],
    limit: 3,
  });

  const activity = toActivityItems(notificationsPreviewData, 4);

  const feedbackIdea = bestFeedbackOpportunity(
    publicIdeas,
    getPreviewFeedbackForm,
  );

  const actions: QuickAction[] = [
    {
      description: "Find ideas worth backing",
      href: "/d/discover",
      icon: "compass",
      label: "Support an idea",
    },
    {
      description: "Help creators improve",
      href: feedbackIdea ? `/ideas/${feedbackIdea.id}` : "/d/discover",
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
      href: "/d/creator/ideas/new",
      icon: "idea",
      label: "Start an idea",
    },
  ];

  const creatorSnapshot = {
    draftCount: previewMyIdeas.filter((idea) => idea.status === "draft").length,
    feedbackReceived: previewMyIdeas.reduce(
      (total, idea) =>
        total + (previewFeedbackSubmissions[idea.id]?.length ?? 0),
      0,
    ),
    ownedIdeaCount: previewMyIdeas.length,
    publishedCount: previewMyIdeas.filter(
      (idea) => idea.visibility === "public",
    ).length,
  };

  const modules = deriveDashboardModules(viewer, {
    ownedIdeaCount: creatorSnapshot.ownedIdeaCount,
    previewEligible: true,
  });

  const newViewer = isNewViewer({
    feedbackGiven: 0,
    ownedIdeas: creatorSnapshot.ownedIdeaCount,
    prePledges:
      prePledgesPreviewData.active.length + prePledgesPreviewData.past.length,
    supportedIdeas: 0,
  });

  return (
    <HomeDashboard
      actions={actions}
      activity={activity}
      creatorSnapshot={creatorSnapshot}
      featured={featured}
      greeting={greetingFor(new Date())}
      ideathon={toHomeIdeathon(getPreviewActiveIdeathon())}
      isNewViewer={newViewer}
      modules={modules}
      recommended={recommended}
      trending={trending}
      viewerName={viewer.displayName}
    />
  );
}
