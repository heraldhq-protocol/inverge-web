import type { IdeaArtworkVariant } from "@/features/home/types";
import type { MoneyAmount } from "@/lib/money";

/**
 * The homepage's editorial idea card.
 *
 * One shape for both sources: `href` is the live idea page (or `null` for a
 * fixture with no API record), and `promoted` is the API's paid-placement flag.
 * Validation figures stay out of this type on purpose — the card never claims a
 * score it cannot read.
 */
export type HomeIdeaCard = {
  id: string;
  title: string;
  category: string;
  pitch: string;
  cover: string | null;
  artwork: IdeaArtworkVariant;
  supporters: number;
  estimatedInterest: MoneyAmount;
  promoted: boolean;
  href: string | null;
};

/** Public counters, identical in meaning to `GET /api/v1/platform/summary`. */
export type HomeStats = {
  publishedIdeas: number;
  activeCampaigns: number;
  completedCampaigns: number;
};

/**
 * A section-level result.
 *
 * `preview` only ever comes from a deployment with no API configured. An API
 * that is configured but unreachable is `unavailable`, never `preview`: an outage
 * must not be dressed up as sample data, and a failed optional section must not
 * take the rest of the page with it.
 */
export type HomeStatsSection =
  | { state: "live"; stats: HomeStats; asOf: string }
  | { state: "preview" }
  | { state: "unavailable" };

export type HomeIdeasSection =
  | { state: "live"; ideas: readonly HomeIdeaCard[] }
  | { state: "preview"; ideas: readonly HomeIdeaCard[] }
  | { state: "unavailable" };

export type HomeView = {
  stats: HomeStatsSection;
  ideas: HomeIdeasSection;
};
