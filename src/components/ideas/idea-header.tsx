import { Avatar } from '@/components/ui/avatar';
import { Pill } from '@/components/ui/pill';
import { formatDate } from '@/lib/format';
import type { IdeaDetail } from '@/lib/ideas/types';
import { Cover } from '@/components/ui/cover';

/**
 * Idea detail header.
 *
 * Deliberately **left-aligned**, unlike the reference, which centres its project title. Centring works
 * there because the body below is roughly symmetrical; ours is a two-column read with a sticky rail, and
 * a centred title over an asymmetric body reads as a marketing page (teardown §4, band 1).
 *
 * The attribute row is the reference's band 3: category, region, tier. Text pills only — no verified
 * rosette, no shield (app-mockup-kit §4).
 */
export function IdeaHeader({ idea }: { idea: IdeaDetail }) {
  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Pill>{categoryLabel(idea.category)}</Pill>
        {idea.region && <Pill>{idea.region}</Pill>}
        {idea.discoverabilityTier === 'FEATURED' && <Pill tone="accent">Featured</Pill>}
        {idea.status === 'THRESHOLD_MET' && (
          <Pill tone="accent" marker={<span aria-hidden="true">✓</span>}>
            Threshold met
          </Pill>
        )}
      </div>

      <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
        {idea.title}
      </h1>

      <p className="max-w-[68ch] text-base leading-relaxed text-ink-muted">{idea.problem}</p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Avatar name={idea.creator.displayName} src={idea.creator.avatarUrl} size={40} />
        <div>
          <p className="text-sm font-semibold text-ink">
            {idea.creator.displayName}
            {idea.creator.identityVerified && (
              <span className="ml-2 text-xs font-semibold text-accent-700">Verified creator</span>
            )}
          </p>
          {idea.publishedAt && (
            <p className="text-xs text-ink-muted">Published {formatDate(idea.publishedAt)}</p>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl">
        <Cover
          id={idea.id}
          title={idea.title}
          category={idea.category}
          topics={idea.topics}
          src={null}
          size="featured"
        />
      </div>
    </header>
  );
}

import { CATEGORY_LABEL } from '@/lib/feed/categories';

function categoryLabel(category: IdeaDetail['category']): string {
  return CATEGORY_LABEL[category] ?? category;
}
