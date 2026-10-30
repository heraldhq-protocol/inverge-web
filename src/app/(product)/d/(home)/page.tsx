import type { Metadata } from "next";

import { recordPageView } from "@/features/analytics/server/ingest";
import { getDashboardViewer } from "@/features/app-shell/server/viewer";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
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
import { HomeDashboard } from "@/features/home/components/home-dashboard";
import { ideaViewHref } from "@/features/ideas/lib/idea-link";
import { allPublicIdeas } from "@/features/ideas/lib/catalog";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { previewTopics } from "@/features/ideas/content/topics";
import { getCreatorView } from "@/features/ideas/server/creator-view";
import { getIdeasDiscoveryView } from "@/features/ideas/server/views";
import { getNotificationsView } from "@/features/notifications/server/notifications";
import { prePledgesPreviewData } from "@/features/pre-pledges/content/preview-data";
import { getPrePledgesView } from "@/features/pre-pledges/server/pre-pledges";
import { getPreviewActiveIdeathon } from "@/features/programmes/content/preview-programmes";
import { isApiConfigured } from "@/lib/api/server";

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
 * Dashboard home.
 *
 * Live sessions read the public catalogue, the viewer's own ideas, and the
 * notification inbox from the API. Preview auth keeps the fixture catalogue and
 * activity. Ideathons and pre-pledges have no read API yet, so a live home omits
 * the ideathon card and does not use preview pre-pledge counts.
 */
export default async function HomePage() {
  recordPageView("creator-dashboard");
  const preview = isPreviewAuth() || !isApiConfigured();

  const [viewer, publicView, creatorResult, notificationsResult, prePledgeResult] =
    await Promise.all([
      getDashboardViewer(),
      preview
        ? Promise.resolve({
            data: ideasPreviewData,
            dataSource: "preview" as const,
            topics: previewTopics,
            truncated: false,
          })
        : getIdeasDiscoveryView(),
      getCreatorView(),
      getNotificationsView(),
      getPrePledgesView(),
    ]);

  const publicIdeas = allPublicIdeas(publicView.data);
  const featured = publicView.data.featured.at(0) ?? publicIdeas.at(0);
  const featuredId = featured ? [featured.id] : [];

  const trending = rankIdeasForFeed(publicIdeas, {
    excludeIds: featuredId,
    limit: 4,
  });
  const recommended = rankIdeasForFeed(publicIdeas, {
    excludeIds: [...featuredId, ...trending.map((idea) => idea.id)],
    limit: 3,
  });

  const activity = toActivityItems(
    notificationsResult.status === "ready"
      ? notificationsResult.view.items
      : [],
    4,
  );

  const feedbackIdea = preview
    ? bestFeedbackOpportunity(publicIdeas, getPreviewFeedbackForm)
    : null;

  const actions: QuickAction[] = [
    {
      description: "Find ideas worth backing",
      href: "/d/discover",
      icon: "compass",
      label: "Support an idea",
    },
    {
      description: "Help creators improve",
      href: feedbackIdea
        ? ideaViewHref(feedbackIdea.id, "internal")
        : "/d/discover",
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

  const rows = creatorResult.status === "ready" ? creatorResult.view.rows : [];
  const creatorSnapshot = {
    draftCount: rows.filter((idea) => idea.status === "draft").length,
    feedbackReceived: rows.reduce(
      (total, idea) => total + idea.feedbackResponses,
      0,
    ),
    ownedIdeaCount: rows.length,
    publishedCount: rows.filter((idea) => idea.visibility === "public").length,
  };

  const modules = deriveDashboardModules(viewer, {
    ownedIdeaCount: creatorSnapshot.ownedIdeaCount,
    previewEligible: true,
  });

  const livePrePledgeCount =
    prePledgeResult.status === "ready"
      ? prePledgeResult.data.active.length + prePledgeResult.data.past.length
      : 0;

  const newViewer = isNewViewer({
    feedbackGiven: 0,
    ownedIdeas: creatorSnapshot.ownedIdeaCount,
    prePledges: preview
      ? prePledgesPreviewData.active.length + prePledgesPreviewData.past.length
      : livePrePledgeCount,
    supportedIdeas: 0,
  });

  return (
    <HomeDashboard
      actions={actions}
      activity={activity}
      creatorSnapshot={creatorSnapshot}
      featured={featured}
      greeting={greetingFor(new Date())}
      ideathon={
        preview ? toHomeIdeathon(getPreviewActiveIdeathon()) : null
      }
      isNewViewer={newViewer}
      modules={modules}
      recommended={recommended}
      trending={trending}
      viewerName={viewer.displayName}
    />
  );
}
