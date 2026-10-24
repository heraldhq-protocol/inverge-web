import { cache } from "react";

import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { getPreviewIdeaDetail } from "@/features/ideas/content/preview-idea-detail";
import { previewTopics } from "@/features/ideas/content/topics";
import { allPublicIdeas } from "@/features/ideas/lib/catalog";
import type {
  DiscoveryIdea,
  IdeaDetail,
  IdeasDiscoveryData,
  Topic,
} from "@/features/ideas/types";
import {
  getLiveIdea,
  getLiveIdeasWindow,
  toDiscoveryIdea,
  toIdeaDetail,
} from "@/features/ideas/server/live-ideas";
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

export type IdeaDetailView = {
  dataSource: IdeasDataSource;
  idea: IdeaDetail;
  /** Candidates the related-ideas row may draw from. */
  ideas: readonly DiscoveryIdea[];
  topics: readonly Topic[];
};

export const getIdeaDetailView = cache(
  async (idOrSlug: string): Promise<IdeaDetailView | null> => {
    if (!isApiConfigured()) {
      const idea = getPreviewIdeaDetail(idOrSlug);
      if (!idea) return null;
      return {
        dataSource: "preview",
        idea,
        ideas: allPublicIdeas(ideasPreviewData),
        topics: previewTopics,
      };
    }

    const apiIdea = await getLiveIdea(idOrSlug);
    if (!apiIdea) return null;

    const idea = toIdeaDetail(apiIdea);
    // Related ideas come from the same taxonomy parent. When the idea has no
    // assignment, the newest window is the only honest fallback.
    const relatedWindow = await getLiveIdeasWindow({
      max: 100,
      ...(idea.taxonomyCategory
        ? { taxonomyCategory: idea.taxonomyCategory }
        : {}),
    });
    const ideas = relatedWindow.ideas
      .map(toDiscoveryIdea)
      .filter((candidate) => candidate.visibility === "public");

    return {
      dataSource: "live",
      idea,
      ideas,
      topics: [],
    };
  },
);
