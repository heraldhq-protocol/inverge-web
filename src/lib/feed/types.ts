// Shapes mirror docs/feed-api.md exactly, including the string-serialised Decimals, so the swap
// from fixtures to the live `GET /feed` is a change in feed-api.ts and nothing else.

export type FeedObjectType = 'idea' | 'campaign';

export type IdeaCategory = 'software' | 'agriculture' | 'film' | 'arts' | 'other';

export const CATEGORIES: { value: IdeaCategory; label: string }[] = [
  { value: 'software', label: 'Software' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'film', label: 'Film' },
  { value: 'arts', label: 'Arts' },
  { value: 'other', label: 'Other' },
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
  displayName: string;
  avatarUrl?: string | null;
  identityVerified: boolean;
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
};

export type FeedQuery = {
  type?: 'ideas' | 'campaigns' | 'all';
  take?: number;
  /** Stateless pagination: accumulate what you have shown. There is no offset — scores shift. */
  excludeIds?: string[];
  category?: IdeaCategory;
};

export type FeedResponse = {
  anonymous: boolean;
  items: FeedItem[];
};
