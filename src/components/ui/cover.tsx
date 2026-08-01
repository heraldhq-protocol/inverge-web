import Image from 'next/image';
import { cn } from '@/lib/utils';
import { TOPIC_BY_SLUG } from '@/lib/feed/categories';
import type { IdeaCategory } from '@/lib/feed/types';

/**
 * Cover art for an idea.
 *
 * There is no image field on an idea (API gap backlog item 3), so the default is a **deterministic
 * colour band**: a tint derived from the id, so an idea keeps the same colour between the card and the
 * detail page, plus the topic it belongs to.
 *
 * Two things it deliberately does not do:
 * - **No title.** The card prints the title immediately below, and setting it twice at two sizes was the
 *   loudest thing on a page of nine cards.
 * - **No tall block.** A placeholder has nothing to look at, so height is dead space: an empty 3:2 cover
 *   at four-up pushed every number down the card. It is a band, not a photo well. When real covers land,
 *   `src` restores the full aspect ratio.
 *
 * The label prefers the idea's **topic** ("Fintech", "Food & Drink") over its API category, because the
 * category enum has only five values and "Other" tells a reader nothing (categories.ts).
 */

/**
 * Cover labels, widest to narrowest.
 *
 * The five API categories are here so nothing ever renders unlabelled, but they are the fallback rather
 * than the goal: "Other" describes a third of the feed and tells a reader nothing. Every topic slug and
 * the aliases an idea might carry resolve to something specific, so a cover can say "Fintech" or
 * "Clean energy" instead.
 *
 * Adding a label is safe: unknown values fall through to a humanised version of whatever came in, so
 * this never has to be exhaustive to be correct.
 */
const COVER_LABELS: Record<string, string> = {
  // API categories (FeedItem.category) — the floor.
  software: 'Software',
  agriculture: 'Agriculture',
  film: 'Film',
  arts: 'Arts',
  other: 'Other',

  // Topic slugs (categories.ts) — what a cover should show whenever one is set.
  apps: 'Apps & Software',
  fintech: 'Fintech',
  health: 'Health',
  education: 'Education',
  food: 'Food & Drink',
  energy: 'Clean energy',
  transport: 'Transport',
  commerce: 'Commerce & Trade',
  music: 'Music & Audio',
  publishing: 'Publishing',
  design: 'Art & Design',
  fashion: 'Fashion',
  community: 'Community',

  // Aliases and near-misses, so a slug that drifts still lands on a real label.
  tech: 'Technology',
  technology: 'Technology',
  agritech: 'Agritech',
  farming: 'Farming',
  logistics: 'Logistics',
  delivery: 'Delivery',
  mobility: 'Mobility',
  housing: 'Housing',
  water: 'Water & Sanitation',
  climate: 'Climate',
  environment: 'Environment',
  waste: 'Waste & Recycling',
  crafts: 'Crafts',
  photography: 'Photography',
  games: 'Games',
  sport: 'Sport',
  media: 'Media',
  journalism: 'Journalism',
  science: 'Science',
  research: 'Research',
  manufacturing: 'Manufacturing',
  textiles: 'Textiles',
  beauty: 'Beauty',
  hospitality: 'Hospitality',
  tourism: 'Tourism',
  legal: 'Legal',
  insurance: 'Insurance',
  savings: 'Savings & Credit',
  payments: 'Payments',
  jobs: 'Jobs & Skills',
  childcare: 'Childcare',
  eldercare: 'Eldercare',
  accessibility: 'Accessibility',
  security: 'Safety',
};

/** "clean_energy" → "Clean energy". Last resort, so an unmapped slug still reads as a label. */
function humaniseSlug(value: string): string {
  const words = value.replace(/[-_]+/g, ' ').trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : 'Idea';
}

// Four tints of the one accent hue plus the forest ground: hierarchy from a single hue, never a second
// colour to signal a second thing (conventions §5.2). Weighted toward the pale end, because a grid of
// mostly-dark bands reads as stripes.
const SURFACES = [
  'bg-accent-50 text-accent-900',
  'bg-accent-100 text-accent-900',
  'bg-forest text-white',
  'bg-accent-50 text-accent-900',
  'bg-accent-100 text-accent-900',
  'bg-accent-500 text-white',
] as const;

function surfaceFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 9973;
  return SURFACES[hash % SURFACES.length];
}

/**
 * The most specific label we can honestly show: a known topic, then this table, then a humanised
 * version of whatever came in. Never undefined — an unlabelled cover looks like a bug.
 */
function coverLabel(category: IdeaCategory, topics?: string[]): string {
  for (const slug of topics ?? []) {
    const topic = TOPIC_BY_SLUG.get(slug);
    if (topic) return topic.label;
    if (COVER_LABELS[slug]) return COVER_LABELS[slug];
  }
  return COVER_LABELS[category] ?? humaniseSlug(category);
}

export function IdeaCover({
  id,
  title,
  category,
  topics,
  src,
  size = 'grid',
  className,
}: {
  id: string;
  title: string;
  category: IdeaCategory;
  topics?: string[];
  src?: string | null;
  size?: 'grid' | 'featured' | 'lane';
  className?: string;
}) {
  const label = coverLabel(category, topics);

  if (src) {
    return (
      <div className={cn('relative w-full overflow-hidden bg-ink/5', className, 'aspect-[3/2]')}>
        <Image
          src={src}
          alt={`${title} cover`}
          fill
          sizes={size === 'featured' ? '(min-width: 1024px) 640px, 100vw' : '(min-width: 640px) 320px, 100vw'}
          className="object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-ink/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-white">
          {label}
        </span>
      </div>
    );
  }

  const height = size === 'featured' ? 'h-28 sm:h-32' : size === 'lane' ? 'h-16' : 'h-20';

  return (
    <div
      className={cn('relative w-full overflow-hidden', height, surfaceFor(id), className)}
      aria-hidden="true"
    >
      {/* A quiet mark so an image-less cover reads as deliberate rather than as a failed load. */}
      <svg
        className="absolute -right-4 -top-10 h-[220%] w-auto opacity-[0.09]"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="50" cy="50" r="46" />
        <circle cx="50" cy="50" r="30" />
      </svg>

      <div className="relative flex h-full items-center px-3.5">
        <span className="text-[9px] font-semibold uppercase tracking-[0.15em] opacity-75">{label}</span>
      </div>
    </div>
  );
}
