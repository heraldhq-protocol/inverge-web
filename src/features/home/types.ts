import type { DiscoveryCategory } from "@/features/home/discovery-categories";

export type MoneyAmount = {
  atomic: string;
  currency: "USD";
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
  prePledged: MoneyAmount;
  supporters: number;
  title: string;
  validationPercent: number;
};

export type PrePledgeSummary = {
  idea: IdeaSummary;
  intent: MoneyAmount;
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
