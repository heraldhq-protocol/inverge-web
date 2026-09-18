import type { IdeaSummary } from "@/features/home/types";

export type IdeaRegion = "ghana" | "nigeria" | "senegal";

export type DiscoveryIdea = IdeaSummary & {
  location: string;
  promoted?: boolean;
  publishedOrder: number;
  region: IdeaRegion;
};

export type IdeaValidationStage = "early" | "growing" | "near";

export type IdeaSort = "most-supported" | "most-validated" | "newest";

export type IdeasDiscoveryData = {
  featured: DiscoveryIdea[];
  ideas: DiscoveryIdea[];
};
