import type { IdeaCategory } from './types';

/**
 * The browsing taxonomy.
 *
 * The API's category enum has exactly five values, and `GET /feed?category=` validates against them
 * (400 on anything else). Five is too coarse to browse — the reference runs fifteen — so this adds a
 * display layer of **topics**, each of which maps onto one API category.
 *
 * That keeps both halves honest: a topic filter is a real, shareable filter, and the request that
 * eventually goes to the live API is still one of the five values it accepts. Widening the enum itself
 * is an API ask; until then a topic narrows client-side within its category.
 *
 * Order matters — this is the order they render in the topic bar.
 */
export type Topic = {
  slug: string;
  label: string;
  /** The API category this topic lives inside. */
  category: IdeaCategory;
  /** Matched against an idea's own `topics` in fixtures; ignored once the API owns topics. */
  keywords: string[];
};

export const TOPICS: Topic[] = [
  { slug: 'apps', label: 'Apps & Software', category: 'software', keywords: ['app', 'software', 'platform'] },
  { slug: 'fintech', label: 'Fintech', category: 'software', keywords: ['fintech', 'payments', 'lending'] },
  { slug: 'health', label: 'Health', category: 'other', keywords: ['health', 'clinic', 'care'] },
  { slug: 'education', label: 'Education', category: 'software', keywords: ['education', 'school', 'campus'] },
  { slug: 'agriculture', label: 'Agriculture', category: 'agriculture', keywords: ['farm', 'harvest', 'agriculture'] },
  { slug: 'food', label: 'Food & Drink', category: 'agriculture', keywords: ['food', 'kitchen', 'drink'] },
  { slug: 'energy', label: 'Energy', category: 'other', keywords: ['solar', 'power', 'energy'] },
  { slug: 'transport', label: 'Transport', category: 'other', keywords: ['transport', 'delivery', 'logistics'] },
  { slug: 'commerce', label: 'Commerce & Trade', category: 'other', keywords: ['market', 'trade', 'retail'] },
  { slug: 'film', label: 'Film & Video', category: 'film', keywords: ['film', 'video', 'documentary'] },
  { slug: 'music', label: 'Music & Audio', category: 'arts', keywords: ['music', 'audio', 'radio'] },
  { slug: 'publishing', label: 'Publishing', category: 'arts', keywords: ['book', 'publishing', 'writing'] },
  { slug: 'design', label: 'Art & Design', category: 'arts', keywords: ['art', 'design', 'craft'] },
  { slug: 'fashion', label: 'Fashion', category: 'arts', keywords: ['fashion', 'textile', 'tailor'] },
  { slug: 'community', label: 'Community', category: 'other', keywords: ['community', 'co-op', 'neighbourhood'] },
];

export const TOPIC_BY_SLUG = new Map(TOPICS.map((t) => [t.slug, t]));

export function topicFor(slug: string | undefined): Topic | undefined {
  return slug ? TOPIC_BY_SLUG.get(slug) : undefined;
}

/**
 * Named collections, the reference's row modules in our terms. Each is a query the feed already
 * supports, not a new concept: a lane is a filter with a headline, and the headline is the reason a
 * reader would want that filter.
 */
export type Collection = {
  slug: string;
  title: string;
  blurb: string;
  /** How the lane picks from the ranked pool. Never a re-sort by a paid signal. */
  kind: 'closing-soon' | 'new' | 'threshold-met' | 'near-you' | 'well-supported';
};

export const COLLECTIONS: Collection[] = [
  {
    slug: 'closing-soon',
    title: 'Closing soon',
    blurb: 'Validation windows ending in the next fortnight.',
    kind: 'closing-soon',
  },
  {
    slug: 'new',
    title: 'Just published',
    blurb: 'Ideas in their first two weeks, before the numbers mean much.',
    kind: 'new',
  },
  {
    slug: 'ready-to-raise',
    title: 'Ready to raise',
    blurb: 'Cleared every validation threshold and heading for a campaign.',
    kind: 'threshold-met',
  },
  {
    slug: 'near-you',
    title: 'Near you',
    blurb: 'Building in Lagos, Ibadan, Accra and everywhere between.',
    kind: 'near-you',
  },
  {
    slug: 'well-supported',
    title: 'Most supported',
    blurb: 'The ideas the most people have put their name to.',
    kind: 'well-supported',
  },
];
