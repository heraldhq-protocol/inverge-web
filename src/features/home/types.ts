import type { DiscoveryCategory } from "@/features/home/discovery-categories";

export type NairaAmount = {
  atomic: string;
  currency: "NGN";
  decimals: 2;
};

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
  prePledged: NairaAmount;
  supporters: number;
  title: string;
  validationPercent: number;
};

export type PrePledgeSummary = {
  idea: IdeaSummary;
  intent: NairaAmount;
  status: "gathering" | "waiting";
};

export type HomeDashboardData = {
  discoverIdeas: IdeaSummary[];
  featuredIdeas: IdeaSummary[];
  prePledges: PrePledgeSummary[];
  stats: {
    activePrePledges: number;
    feedbackResponses: number;
    ideasSupported: number;
  };
  user: {
    firstName: string;
  };
};
