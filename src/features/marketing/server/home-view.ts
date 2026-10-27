import { cache } from "react";

import {
  getLiveIdeasWindow,
  toDiscoveryIdea,
} from "@/features/ideas/server/live-ideas";
import type { DiscoveryIdea } from "@/features/ideas/types";
import { previewIdeas } from "@/features/marketing/content/preview-ideas";
import type {
  HomeIdeaCard,
  HomeIdeasSection,
  HomeStats,
  HomeStatsSection,
  HomeView,
} from "@/features/marketing/types";
import { fetchApiJson, isApiConfigured } from "@/lib/api/server";

/**
 * The public homepage's data.
 *
 * Two independent reads, resolved independently: a failing statistics endpoint
 * must not blank the idea cards, and a failing idea list must not blank the
 * counters. A deployment with no API shows labelled fixtures; a deployment whose
 * API fails shows an explicit unavailable state in the affected section only.
 */

/**
 * How many editorial cards the homepage shows, and how many rows it reads.
 *
 * The window is one API page (the discovery helper never asks for less than the
 * page limit), so a promoted record a few rows down is still eligible for the
 * lead slot. It is one request, not a crawl of the catalogue.
 */
const HOME_IDEA_COUNT = 3;
const HOME_IDEA_WINDOW = 50;

type ApiPlatformSummary = {
  asOf?: unknown;
  publishedIdeas?: unknown;
  activeCampaigns?: unknown;
  completedCampaigns?: unknown;
};

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

/**
 * Validate the counter payload before it becomes a large number on the page.
 *
 * A missing or malformed field makes the whole section unavailable rather than
 * rendering `NaN` or a zero the API never reported. The endpoint returns counts
 * only, so there is nothing here to coerce into money.
 */
export function toHomeStats(
  value: ApiPlatformSummary,
): { stats: HomeStats; asOf: string } | null {
  if (
    !isCount(value.publishedIdeas) ||
    !isCount(value.activeCampaigns) ||
    !isCount(value.completedCampaigns)
  ) {
    return null;
  }

  const asOf =
    typeof value.asOf === "string" && Number.isFinite(Date.parse(value.asOf))
      ? value.asOf
      : new Date().toISOString();

  return {
    asOf,
    stats: {
      activeCampaigns: value.activeCampaigns,
      completedCampaigns: value.completedCampaigns,
      publishedIdeas: value.publishedIdeas,
    },
  };
}

export function toHomeIdeaCard(idea: DiscoveryIdea): HomeIdeaCard {
  return {
    artwork: idea.artwork,
    category: idea.category,
    cover: idea.cover ?? null,
    estimatedInterest: idea.prePledged,
    href: `/ideas/${encodeURIComponent(idea.id)}`,
    id: idea.id,
    pitch: idea.description,
    promoted: idea.promoted === true,
    supporters: idea.supporters,
    title: idea.title,
  };
}

/**
 * Pick the editorial lead.
 *
 * `promoted` is paid placement and affects visibility only. Ordering by it is
 * honest because it is the API's own flag; ordering by a validation score would
 * not be, and the card does not have one. The sort is stable, so within each
 * group the API's order (newest first) is preserved.
 */
export function rankHomeIdeas(
  ideas: readonly HomeIdeaCard[],
  limit = HOME_IDEA_COUNT,
): HomeIdeaCard[] {
  return [...ideas]
    .sort((left, right) => Number(right.promoted) - Number(left.promoted))
    .slice(0, limit);
}

export async function loadHomeStats(): Promise<HomeStatsSection> {
  try {
    const payload = await fetchApiJson<ApiPlatformSummary>("/platform/summary");
    const summary = toHomeStats(payload);
    return summary
      ? { asOf: summary.asOf, stats: summary.stats, state: "live" }
      : { state: "unavailable" };
  } catch {
    return { state: "unavailable" };
  }
}

export async function loadHomeIdeas(): Promise<HomeIdeasSection> {
  try {
    const window = await getLiveIdeasWindow({ max: HOME_IDEA_WINDOW });
    const cards = window.ideas
      .map(toDiscoveryIdea)
      .filter((idea) => idea.visibility === "public")
      .map(toHomeIdeaCard);

    return { ideas: rankHomeIdeas(cards), state: "live" };
  } catch {
    return { state: "unavailable" };
  }
}

export const getHomeView = cache(async (): Promise<HomeView> => {
  if (!isApiConfigured()) {
    return {
      ideas: { ideas: previewIdeas, state: "preview" },
      stats: { state: "preview" },
    };
  }

  const [stats, ideas] = await Promise.all([loadHomeStats(), loadHomeIdeas()]);
  return { ideas, stats };
});

export { HOME_IDEA_COUNT, HOME_IDEA_WINDOW };
