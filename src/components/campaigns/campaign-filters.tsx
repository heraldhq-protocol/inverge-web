import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CATEGORIES, type IdeaCategory } from '@/lib/feed/types';
import { SEGMENT_LABEL, SORT_LABEL } from '@/lib/campaigns/campaign-stats';
import type { CampaignSegment, CampaignSort } from '@/lib/campaigns/types';

const SEGMENTS: CampaignSegment[] = ['all', 'raising', 'delivering', 'delivered', 'not-delivered'];
const SORTS: CampaignSort[] = ['closing-soon', 'newest', 'most-backed', 'most-delivered'];

export type CampaignFilterState = {
  segment: CampaignSegment;
  category: IdeaCategory | null;
  region: string | null;
  sort: CampaignSort;
};

/**
 * Catalogue filters. Links that write search params, never client state, so a filtered view is
 * shareable, server-rendered and works with JavaScript off — the same idiom as the feed's
 * `CategoryFilter`, because two discovery surfaces that filter differently read as two products.
 *
 * The segment row leads because lifecycle is the question this catalogue exists to answer: a reader
 * here is checking whether staged release actually works, not shopping. Category and region are
 * secondary and sized that way.
 *
 * `Not delivered` is a filter, never a hidden default. Failed campaigns appear in every unfiltered
 * view (campaign-brief.md §9 rule 1).
 */
export function CampaignFilters({
  state,
  regions,
  resultCount,
}: {
  state: CampaignFilterState;
  regions: string[];
  resultCount: number;
}) {
  const href = (patch: Partial<CampaignFilterState>) => {
    const next = { ...state, ...patch };
    const params = new URLSearchParams();
    if (next.segment !== 'all') params.set('segment', next.segment);
    if (next.category) params.set('category', next.category);
    if (next.region) params.set('region', next.region);
    if (next.sort !== 'closing-soon') params.set('sort', next.sort);
    const query = params.toString();
    return query ? `/campaigns?${query}` : '/campaigns';
  };

  const isFiltered = state.segment !== 'all' || state.category !== null || state.region !== null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {SEGMENTS.map((segment) => (
          <Link
            key={segment}
            href={href({ segment })}
            aria-current={state.segment === segment ? 'true' : undefined}
            className={cn(
              'inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2',
              state.segment === segment
                ? 'border-accent-500 bg-accent-100 font-semibold text-accent-900'
                : 'border-border bg-surface font-medium text-ink-muted hover:border-accent-500/40 hover:text-ink'
            )}
          >
            {state.segment === segment && (
              <span aria-hidden="true" className="mr-1.5">
                ✓
              </span>
            )}
            {SEGMENT_LABEL[segment]}
          </Link>
        ))}

        <p className="ml-auto text-sm text-ink-muted tabular-nums" aria-live="polite">
          {resultCount} {resultCount === 1 ? 'campaign' : 'campaigns'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3">
        <FilterGroup label="Category">
          <SmallChip href={href({ category: null })} active={state.category === null}>
            Any
          </SmallChip>
          {CATEGORIES.map((c) => (
            <SmallChip
              key={c.value}
              href={href({ category: c.value })}
              active={state.category === c.value}
            >
              {c.label}
            </SmallChip>
          ))}
        </FilterGroup>

        {regions.length > 1 && (
          <FilterGroup label="Where">
            <SmallChip href={href({ region: null })} active={state.region === null}>
              Anywhere
            </SmallChip>
            {regions.map((region) => (
              <SmallChip key={region} href={href({ region })} active={state.region === region}>
                {region}
              </SmallChip>
            ))}
          </FilterGroup>
        )}

        <FilterGroup label="Sort" className="sm:ml-auto">
          {SORTS.map((sort) => (
            <SmallChip key={sort} href={href({ sort })} active={state.sort === sort}>
              {SORT_LABEL[sort]}
            </SmallChip>
          ))}
        </FilterGroup>

        {isFiltered && (
          <Link
            href="/campaigns"
            className="rounded text-[13px] font-medium text-accent-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            Clear filters
          </Link>
        )}
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex min-w-0 flex-wrap items-center gap-1.5', className)}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </span>
      {children}
    </div>
  );
}

function SmallChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={cn(
        // 24px is the WCAG 2.2 minimum target (SC 2.5.8); the padding carries it past that at this
        // type size without turning a secondary control into a button row.
        'inline-flex min-h-6 items-center rounded-full px-2.5 py-1 text-[13px] transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2',
        active
          ? 'bg-ink font-semibold text-paper'
          : 'font-medium text-ink-muted hover:bg-ink/6 hover:text-ink'
      )}
    >
      {children}
    </Link>
  );
}
