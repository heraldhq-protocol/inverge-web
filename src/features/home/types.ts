import type { DiscoveryCategory } from "@/features/home/discovery-categories";
import type { MoneyAmount } from "@/lib/money";

export type IdeaArtworkVariant =
  "campus" | "community" | "creative" | "energy" | "food" | "logistics";

export type IdeaSummary = {
  id: string;
  artwork: IdeaArtworkVariant;
  category: string;
  creator: string;
  creatorInitials: string;
  description: string;
  discoveryCategory: DiscoveryCategory;
  prePledged: MoneyAmount;
  supporters: number;
  title: string;
  validationPercent: number;
};

/**
 * One row in the home dashboard's activity rail.
 *
 * `kind` selects the icon and nothing else: the copy is authored upstream by the
 * notification record, never paraphrased here, so the rail cannot claim an event
 * the notification centre does not hold.
 */
export type ActivityKind =
  "campaign" | "feedback" | "follower" | "milestone" | "refund";

export type ActivityItem = {
  kind: ActivityKind;
  description: string;
  href: string;
  id: string;
  timeLabel: string;
  title: string;
};

/** What the viewer owns, for the creator callout. Counts are never estimates. */
export type CreatorSnapshot = {
  draftCount: number;
  feedbackReceived: number;
  ownedIdeaCount: number;
  publishedCount: number;
};

/** The active programme, reduced to what a card can honestly show. */
export type HomeIdeathon = {
  closesLabel: string | null;
  href: string;
  statusLabel: string;
  theme: string;
  title: string;
};

export type QuickAction = {
  description: string;
  href: string;
  icon: "compass" | "feedback" | "idea" | "trophy";
  label: string;
};
