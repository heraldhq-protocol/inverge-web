export type PublicProfileLink = {
  label: string;
  url: string;
};

export type PublicProfileIdea = {
  href: string;
  id: string;
  publishedAt: string;
  status: string;
  summary: string;
  supporters: number;
  title: string;
};

export type PublicProfileSupportedIdea = PublicProfileIdea & {
  creator: {
    displayName: string | null;
    username: string | null;
  };
};

export type PublicProfile = {
  avatarUrl: string | null;
  bio: string | null;
  completedCampaigns: number;
  displayName: string | null;
  id: string;
  ideas: PublicProfileIdea[];
  ideasPublished: number;
  identityVerified: boolean;
  links: PublicProfileLink[];
  memberSince: string | null;
  supportedIdeas: PublicProfileSupportedIdea[];
  tier: "STARTER" | "TRUSTED" | "ESTABLISHED";
  username: string;
};

export type PublicProfileResult =
  | { profile: PublicProfile; status: "found" }
  | { status: "not_found" }
  | { status: "unavailable" };
