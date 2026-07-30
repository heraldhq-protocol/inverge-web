import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { IdeaCategory } from '@/lib/feed/types';

/**
 * Cover art for an idea.
 *
 * There is no image field on an idea (API gap backlog item 3), so the default is a **deterministic
 * typographic cover**: the title set large over a category tint, derived from the id so it is stable
 * across renders and between the card and the detail page. The mockup kit licenses "a plain
 * typographic cover" explicitly, and a stable one reads as deliberate rather than missing.
 *
 * `src` is honoured the moment the field exists. Nothing else changes.
 */

const CATEGORY_LABEL: Record<IdeaCategory, string> = {
  software: 'Software',
  agriculture: 'Agriculture',
  film: 'Film',
  arts: 'Arts',
  other: 'Other',
};

// Four tints of the one accent hue plus the forest ground: hierarchy from a single hue, never a
// second colour to signal a second thing (conventions §5.2).
const SURFACES = [
  'bg-forest text-white',
  'bg-accent-900 text-white',
  'bg-accent-100 text-accent-900',
  'bg-accent-500 text-white',
  'bg-accent-50 text-accent-900',
] as const;

function surfaceFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 9973;
  return SURFACES[hash % SURFACES.length];
}

export function IdeaCover({
  id,
  title,
  category,
  src,
  size = 'grid',
  className,
}: {
  id: string;
  title: string;
  category: IdeaCategory;
  src?: string | null;
  size?: 'grid' | 'featured' | 'lane';
  className?: string;
}) {
  const shared = cn('relative w-full overflow-hidden bg-ink/5', className);

  if (src) {
    return (
      <div className={cn(shared, 'aspect-[3/2]')}>
        <Image
          src={src}
          alt={`${title} cover`}
          fill
          sizes={size === 'featured' ? '(min-width: 1024px) 640px, 100vw' : '(min-width: 1024px) 320px, 100vw'}
          className="object-cover"
        />
      </div>
    );
  }

  const textSize =
    size === 'featured'
      ? 'text-3xl sm:text-4xl'
      : size === 'lane'
        ? 'text-lg'
        : 'text-xl sm:text-2xl';

  return (
    <div
      className={cn(shared, 'aspect-[3/2]', surfaceFor(id))}
      // Decorative: the title is the next thing in the DOM, so announcing it twice is noise.
      aria-hidden="true"
    >
      <div className="flex h-full flex-col justify-between p-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] opacity-70">
          {CATEGORY_LABEL[category]}
        </span>
        <span className={cn('font-display font-bold leading-[1.1] tracking-tight', textSize)}>
          {title}
        </span>
      </div>
    </div>
  );
}
