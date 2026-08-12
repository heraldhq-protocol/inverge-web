// Shapes mirror docs/feed-api.md exactly, including the string-serialised Decimals, so the swap
// from fixtures to the live `GET /feed` is a change in feed-api.ts and nothing else.

export type FeedObjectType = 'idea' | 'campaign';

export type IdeaCategory =
  | 'technology'
  | 'software'
  | 'fintech'
  | 'agritech'
  | 'agriculture'
  | 'healthtech'
  | 'cleantech'
  | 'edtech'
  | 'logistics'
  | 'e-commerce'
  | 'web3'
  | 'art'
  | 'arts'
  | 'comics'
  | 'crafts'
  | 'dance'
  | 'design'
  | 'fashion'
  | 'film'
  | 'food'
  | 'games'
  | 'journalism'
  | 'music'
  | 'photography'
  | 'publishing'
  | 'theater'
  | 'community'
  | 'other';

export const CATEGORIES: { value: IdeaCategory; label: string }[] = [
  { value: 'technology', label: 'Technology' },
  { value: 'fintech', label: 'Fintech & Payments' },
  { value: 'software', label: 'Software & B2B SaaS' },
  { value: 'agritech', label: 'AgriTech & Farming' },
  { value: 'healthtech', label: 'Health & MedTech' },
  { value: 'cleantech', label: 'Clean Energy & Solar' },
  { value: 'edtech', label: 'EdTech & Learning' },
  { value: 'logistics', label: 'Logistics & Mobility' },
  { value: 'e-commerce', label: 'E-Commerce & Retail' },
  { value: 'web3', label: 'Web3 & Crypto' },
  { value: 'art', label: 'Art' },
  { value: 'comics', label: 'Comics' },
  { value: 'crafts', label: 'Crafts' },
  { value: 'dance', label: 'Dance' },
  { value: 'design', label: 'Design' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'film', label: 'Film' },
  { value: 'food', label: 'Food' },
  { value: 'games', label: 'Games' },
  { value: 'journalism', label: 'Journalism' },
  { value: 'music', label: 'Music' },
  { value: 'photography', label: 'Photography' },
  { value: 'publishing', label: 'Publishing' },
  { value: 'theater', label: 'Theater' },
  { value: 'community', label: 'Community' },
  { value: 'other', label: 'Other Innovations' },
];

/**
 * The explainability chip. Exactly one per card, always rendered: a ranking that cannot explain
 * itself is not shippable (feed-design.md §8).
 */
export type ReasonCode =
  | 'EXPLORE'
  | 'REGION'
  | 'CATEGORY'
  | 'INTENT'
  | 'VELOCITY'
  | 'FEEDBACK'
  | 'QUALITY'
  | 'TRUST'
  | 'PROMOTED';

export type Reason = { code: ReasonCode; label: string };

export type IdeaStatus = 'VALIDATING' | 'THRESHOLD_MET';

export type DiscoverabilityTier = 'DISCOVERABLE' | 'FEATURED';

/**
 * A creator as a public projection. Not in the API yet (gap #1 in the backlog) — the fixtures fill
 * it, and every component treats it as optional so the live swap cannot break the card.
 */
export type PublicCreator = {
  id: string;
  username?: string;
  displayName: string;
  avatarUrl?: string | null;
  identityVerified: boolean;
  verificationTier?: 'TIER_1_ID' | 'TIER_2_CAC' | 'TIER_3_TRACK_RECORD';
};

export type FeedItem = {
  objectType: FeedObjectType;
  id: string;
  slug: string;
  title: string;
  problem: string;
  solution: string;
  category: IdeaCategory;
  region: string | null;
  /** Decimal → string. USD. Parse before arithmetic. */
  askAmount: string;
  status: IdeaStatus;
  discoverabilityTier: DiscoverabilityTier;
  supporterCount: number;
  /** PUBLIC "Estimated interest". USD. Never labelled "raised" or "pledged". */
  weightedPrePledgeTotal: string;
  feedbackScore: string;
  feedbackCount: number;
  commentCount: number;
  qualityScore: string | null;
  creatorId: string;
  creator?: PublicCreator;
  /** true = paid placement slot. Rendered distinctly, never merged with organic (FR-206a). */
  promoted: boolean;
  boostTier: 'BASIC' | 'FEATURED' | null;
  exploration: boolean;
  reason: Reason;
  /** Creator's declared pre-pledge minimum, and when validation opened. Drive the meter + window. */
  creatorPrePledgeTarget?: string | null;
  validatingSince?: string | null;
  /** Display topics (categories.ts). Web-side taxonomy until the API's category enum widens. */
  topics?: string[];
  /**
   * Cover image. No such field exists on an idea yet (API gap backlog item 3) — cards fall back to the
   * deterministic colour band. Accepted here from day one so the swap is a data change, not a UI change.
   */
  coverImageUrl?: string | null;
};

export type FeedQuery = {
  type?: 'ideas' | 'campaigns' | 'all';
  take?: number;
  /** Stateless pagination: accumulate what you have shown. There is no offset — scores shift. */
  excludeIds?: string[];
  category?: IdeaCategory;
  /** Free text. No upstream search endpoint exists; applied on top of the ranked pool. */
  q?: string;
  /** Display topic slug (categories.ts). Narrows within its API category. */
  topic?: string;
  /** Named lane slug (categories.ts). A filter with a headline, never a paid re-sort. */
  collection?: string;
};

export type FeedResponse = {
  anonymous: boolean;
  items: FeedItem[];
  /** Whether another page exists for the same query. Drives "Show me more". */
  hasMore?: boolean;
  /** Matches for the current query, before paging. Powers the result count. */
  total?: number;
};
