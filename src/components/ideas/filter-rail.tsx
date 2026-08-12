'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Amount } from '@/components/ui/amount';
import { cn } from '@/lib/utils';
import {
  ASK_BANDS,
  PROGRESS_BANDS,
  SORTS,
  type FeedFilters,
  type ProgressBand,
  type StageFilter,
} from '@/lib/feed/filters';

type Counts = {
  stage: Record<StageFilter, number>;
  region: Record<string, number>;
  progress: Record<ProgressBand, number>;
  featured: number;
  verified: number;
};

/**
 * The topic page's filter rail.
 *
 * **Every control writes to the URL**, never to component state. A filtered view is then shareable,
 * survives a refresh and a back button, and is rendered on the server — which is the whole reason a
 * topic page exists as a route rather than as a dropdown on the feed.
 *
 * Counts sit beside each option, as they do in the reference. They are the detail that makes a rail
 * usable rather than decorative: they say which choice is worth making before you make it, and which
 * would empty the page. An option that would return nothing is disabled rather than hidden, so the rail
 * does not reshuffle under the pointer.
 *
 * On a phone it becomes a disclosure above the results rather than a drawer: a full-screen filter
 * overlay hides the thing being filtered, and this audience is mostly on small screens.
 */
export function FilterRail({
  filters,
  counts,
  regions,
  total,
}: {
  filters: FeedFilters;
  counts: Counts;
  regions: string[];
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const commit = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      const query = next.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router]
  );

  const toggleInList = (key: string, value: string) =>
    commit((next) => {
      const current = (next.get(key)?.split(',') ?? []).filter(Boolean);
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (updated.length) next.set(key, updated.join(','));
      else next.delete(key);
    });

  const toggleFlag = (key: string, on: boolean) =>
    commit((next) => {
      if (on) next.set(key, '1');
      else next.delete(key);
    });

  const setAsk = (min?: number, max?: number) =>
    commit((next) => {
      next.delete('askMin');
      next.delete('askMax');
      if (min !== undefined) next.set('askMin', String(min));
      if (max !== undefined) next.set('askMax', String(max));
    });

  const clearAll = () => commit((next) => [...next.keys()].forEach((k) => next.delete(k)));

  const askActive = (min?: number, max?: number) =>
    filters.askMin === min && filters.askMax === max;

  const anyFilter =
    filters.stages.length > 0 ||
    filters.regions.length > 0 ||
    filters.progress.length > 0 ||
    filters.featuredOnly ||
    filters.verifiedOnly ||
    filters.askMin !== undefined ||
    filters.askMax !== undefined;

  return (
    <aside aria-label="Filter ideas" className="lg:sticky lg:top-24">
      <details open className="group [&>summary]:lg:hidden" name="filters">
        <summary className="mb-3 flex min-h-11 cursor-pointer list-none items-center justify-between rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink marker:content-none lg:mb-0 [&::-webkit-details-marker]:hidden">
          <span>
            Filters
            {anyFilter && (
              <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 text-xs font-semibold text-ink">
                Active
              </span>
            )}
          </span>
          <span aria-hidden="true" className="text-ink-muted transition-transform group-open:rotate-180">
            ⌄
          </span>
        </summary>

        {/* Modern Dribbble/Linear Reference Filter Card */}
        <div className="rounded-2xl border border-border/70 bg-surface p-4 space-y-5 shadow-xs">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <h2 className="font-display text-sm font-bold text-ink">Filters</h2>
            {anyFilter && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-full border border-border/80 bg-paper px-3 py-1 text-xs font-medium text-ink-muted transition-colors hover:border-ink/30 hover:text-ink"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Validation Stage Segmented Bar */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Validation Stage
            </label>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-paper p-1 border border-border/50">
              <button
                type="button"
                onClick={() => commit((next) => next.delete('stage'))}
                className={cn(
                  'rounded-lg py-1.5 text-xs font-medium transition-all text-center',
                  filters.stages.length === 0
                    ? 'bg-surface text-ink font-semibold shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => toggleInList('stage', 'validating')}
                className={cn(
                  'rounded-lg py-1.5 text-xs font-medium transition-all text-center',
                  filters.stages.includes('validating')
                    ? 'bg-surface text-ink font-semibold shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                )}
              >
                Validating
              </button>
              <button
                type="button"
                onClick={() => toggleInList('stage', 'threshold-met')}
                className={cn(
                  'rounded-lg py-1.5 text-xs font-medium transition-all text-center',
                  filters.stages.includes('threshold-met')
                    ? 'bg-surface text-ink font-semibold shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                )}
              >
                Passed
              </button>
            </div>
          </div>

          {/* Progression Segmented Chips */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              How Far Along
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => commit((next) => next.delete('progress'))}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-all border',
                  filters.progress.length === 0
                    ? 'border-ink bg-ink text-surface font-semibold shadow-2xs'
                    : 'border-border/60 bg-paper text-ink-muted hover:border-ink/30 hover:text-ink'
                )}
              >
                Any
              </button>
              {PROGRESS_BANDS.map((band) => (
                <button
                  key={band.value}
                  type="button"
                  onClick={() => toggleInList('progress', band.value)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-all border',
                    filters.progress.includes(band.value)
                      ? 'border-ink bg-ink text-surface font-semibold shadow-2xs'
                      : 'border-border/60 bg-paper text-ink-muted hover:border-ink/30 hover:text-ink'
                  )}
                >
                  {band.label}
                </button>
              ))}
            </div>
          </div>

          {/* Funding Target Range Pills */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Funding Target Range
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setAsk()}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-all border',
                  filters.askMin === undefined && filters.askMax === undefined
                    ? 'border-ink bg-ink text-surface font-semibold shadow-2xs'
                    : 'border-border/60 bg-paper text-ink-muted hover:border-ink/30 hover:text-ink'
                )}
              >
                Any amount
              </button>
              {ASK_BANDS.map((band) => (
                <button
                  key={band.label}
                  type="button"
                  onClick={() => setAsk(band.min, band.max)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-all border',
                    askActive(band.min, band.max)
                      ? 'border-ink bg-ink text-surface font-semibold shadow-2xs'
                      : 'border-border/60 bg-paper text-ink-muted hover:border-ink/30 hover:text-ink'
                  )}
                >
                  {band.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location / Region Pills */}
          {regions.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                Creator Region
              </label>
              <div className="flex flex-wrap gap-1.5">
                {regions.map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => toggleInList('region', region)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium transition-all border',
                      filters.regions.includes(region)
                        ? 'border-ink bg-ink text-surface font-semibold shadow-2xs'
                        : 'border-border/60 bg-paper text-ink-muted hover:border-ink/30 hover:text-ink'
                    )}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toggle Switches */}
          <div className="space-y-3 pt-2 border-t border-border/50">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-medium text-ink">Featured ideas only</span>
              <button
                type="button"
                role="switch"
                aria-checked={filters.featuredOnly}
                onClick={() => toggleFlag('featured', !filters.featuredOnly)}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                  filters.featuredOnly ? 'bg-ink' : 'bg-ink/15'
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out',
                    filters.featuredOnly ? 'translate-x-4' : 'translate-x-0'
                  )}
                />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-medium text-ink">Verified creators only</span>
              <button
                type="button"
                role="switch"
                aria-checked={filters.verifiedOnly}
                onClick={() => toggleFlag('verified', !filters.verifiedOnly)}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                  filters.verifiedOnly ? 'bg-ink' : 'bg-ink/15'
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out',
                    filters.verifiedOnly ? 'translate-x-4' : 'translate-x-0'
                  )}
                />
              </button>
            </label>
          </div>

          {/* Results Summary Button */}
          <div className="pt-2">
            <div className="w-full rounded-xl bg-ink py-2 px-3 text-center text-xs font-semibold text-surface shadow-2xs">
              Show {total} {total === 1 ? 'result' : 'results'}
            </div>
          </div>
        </div>
      </details>
    </aside>
  );
}

/** The sort control. Lives beside the results heading, as it does in the reference. */
export function SortSelect({ value }: { value: FeedFilters['sort'] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <label className="flex shrink-0 items-center gap-2 text-sm text-ink-muted">
      <span>Sort by</span>
      <select
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          if (e.target.value === 'recommended') next.delete('sort');
          else next.set('sort', e.target.value);
          const query = next.toString();
          router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
        }}
        className="min-h-11 rounded-lg border border-border bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        {SORTS.map((sort) => (
          <option key={sort.value} value={sort.value}>
            {sort.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Kept for the ask-band labels so currency formatting stays in one place. */
export function AskBandLabel({ min, max }: { min?: number; max?: number }) {
  if (min === undefined) return <>Under <Amount value={max ?? 0} currency="USD" /></>;
  if (max === undefined) return <>Over <Amount value={min} currency="USD" /></>;
  return (
    <>
      <Amount value={min} currency="USD" /> to <Amount value={max} currency="USD" />
    </>
  );
}
