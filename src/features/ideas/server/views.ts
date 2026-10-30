import { cache } from "react";

import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { getPreviewIdeaDetail } from "@/features/ideas/content/preview-idea-detail";
import { previewTopics } from "@/features/ideas/content/topics";
import { allPublicIdeas } from "@/features/ideas/lib/catalog";
import type {
  DiscoveryIdea,
  IdeaComment,
  IdeaDetail,
  IdeasDiscoveryData,
  Topic,
} from "@/features/ideas/types";
import type { IdeaCategorySlug } from "@/features/ideas/lib/taxonomy";
import {
  getLiveIdea,
  getLiveIdeaComments,
  getLiveIdeaEngagement,
  getLiveIdeaSurvey,
  getLiveIdeasWindow,
  toDiscoveryIdea,
  toFeedbackForm,
  toIdeaDetail,
} from "@/features/ideas/server/live-ideas";
import { emptySignals, type IdeaSignals } from "@/features/ideas/lib/signals";
import type { IdeaViewer } from "@/features/ideas/components/idea-viewer";
import { readSessionToken } from "@/features/auth/server/session";
import { isApiConfigured } from "@/lib/api/server";

export type IdeasDataSource = "live" | "preview";

export type IdeasDiscoveryView = {
  data: IdeasDiscoveryData;
  dataSource: IdeasDataSource;
  /** True when the newest-N window ended before the API ran out of rows. */
  truncated: boolean;
  topics: readonly Topic[];
};

/**
 * The discovery data a page renders.
 *
 * Fixtures are only returned when the deployment has no API at all. A configured
 * API that fails is surfaced as an error page: silently falling back would make
 * an outage look like a catalogue.
 */
export const getIdeasDiscoveryView = cache(
  async (): Promise<IdeasDiscoveryView> => {
    if (!isApiConfigured()) {
      return {
        data: ideasPreviewData,
        dataSource: "preview",
        topics: previewTopics,
        truncated: false,
      };
    }

    const window = await getLiveIdeasWindow();
    const ideas = window.ideas
      .map(toDiscoveryIdea)
      .filter((idea) => idea.visibility === "public");

    return {
      data: { featured: [], ideas },
      dataSource: "live",
      topics: [],
      truncated: window.truncated,
    };
  },
);

export type IdeaCommentsState = "live" | "preview" | "unavailable";

export type IdeaDetailView = {
  dataSource: IdeasDataSource;
  idea: IdeaDetail;
  /** Candidates the related-ideas row may draw from. */
  ideas: readonly DiscoveryIdea[];
  topics: readonly Topic[];
  comments: readonly IdeaComment[];
  /**
   * `unavailable` means the discussion failed to load while the idea itself is
   * intact. The page keeps rendering and only the thread reports the failure.
   */
  commentsState: IdeaCommentsState;
  /** The viewer's own support/pre-pledge state; empty for a visitor. */
  signals: IdeaSignals;
  viewer: IdeaViewer;
};

export const getIdeaDetailView = cache(
  async (idOrSlug: string): Promise<IdeaDetailView | null> => {
    if (!isApiConfigured()) {
      const idea = getPreviewIdeaDetail(idOrSlug);
      if (!idea) return null;
      return {
        comments: [],
        commentsState: "preview",
        dataSource: "preview",
        idea,
        ideas: allPublicIdeas(ideasPreviewData),
        signals: emptySignals,
        topics: previewTopics,
        viewer: "visitor",
      };
    }

    const token = await readSessionToken();
    const apiIdea = await getLiveIdea(idOrSlug);
    if (!apiIdea) return null;

    // Related ideas come from the same taxonomy parent. When the idea has no
    // assignment, the newest window is the only honest fallback. The thread,
    // form, and viewer signals are independent: any one failing must not take
    // the idea page down.
    const [relatedWindow, thread, survey, signals] = await Promise.all([
      getLiveIdeasWindow({
        max: 100,
        ...(apiIdea.taxonomy?.category
          ? { taxonomyCategory: apiIdea.taxonomy.category as IdeaCategorySlug }
          : {}),
      }),
      getLiveIdeaComments(apiIdea.id).catch(() => null),
      getLiveIdeaSurvey(apiIdea.id).catch(() => null),
      token
        ? getLiveIdeaEngagement(apiIdea.id, token).catch(() => null)
        : Promise.resolve(null),
    ]);
    const idea = toIdeaDetail(apiIdea, toFeedbackForm(survey));
    const ideas = relatedWindow.ideas
      .map(toDiscoveryIdea)
      .filter((candidate) => candidate.visibility === "public");

    return {
      comments: thread?.comments ?? [],
      commentsState: thread ? "live" : "unavailable",
      dataSource: "live",
      idea,
      ideas,
      signals: signals ?? emptySignals,
      topics: [],
      viewer: token ? "signed-in" : "visitor",
    };
  },
);
