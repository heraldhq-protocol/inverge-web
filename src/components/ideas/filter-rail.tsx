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
      // `scroll: false` keeps the reader where they were: a filter change is a refinement of the list
      // in front of them, not a new page.
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
      {/* Native disclosure below `lg`, always-open panel above it. `open` is not toggled by JS, so the
          desktop rail cannot get stuck closed. */}
      <details open className="group [&>summary]:lg:hidden" name="filters">
        <summary className="mb-3 flex min-h-11 cursor-pointer list-none items-center justify-between rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-ink marker:content-none lg:mb-0 [&::-webkit-details-marker]:hidden">
          <span>
            Filters
            {anyFilter && <span className="ml-2 font-normal text-ink-muted">on</span>}
          </span>
          <span aria-hidden="true" className="text-ink-muted transition-transform group-open:rotate-180">
            ⌄
          </span>
        </summary>

        <div className="space-y-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">Filter by</h2>
            {anyFilter && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded text-xs font-medium text-accent-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                Clear all
              </button>
            )}
          </div>

          <Group label="Stage">
            <CheckRow
              label="Being validated"
              count={counts.stage.validating}
              checked={filters.stages.includes('validating')}
              onChange={() => toggleInList('stage', 'validating')}
            />
            <CheckRow
              label="Threshold met"
              count={counts.stage['threshold-met']}
              checked={filters.stages.includes('threshold-met')}
              onChange={() => toggleInList('stage', 'threshold-met')}
            />
          </Group>

          <Group label="How far along">
            {PROGRESS_BANDS.map((band) => (
              <CheckRow
                key={band.value}
                label={band.label}
                count={counts.progress[band.value]}
                checked={filters.progress.includes(band.value)}
                onChange={() => toggleInList('progress', band.value)}
              />
            ))}
          </Group>

          {regions.length > 0 && (
            <Group label="Where the creator is">
              {regions.map((region) => (
                <CheckRow
                  key={region}
                  label={region}
                  count={counts.region[region] ?? 0}
                  checked={filters.regions.includes(region)}
                  onChange={() => toggleInList('region', region)}
                />
              ))}
            </Group>
          )}

          <Group
            label="What they are asking for"
            note="What the idea would raise as a campaign. Nothing has been charged."
          >
            <RadioRow
              label="Any amount"
              checked={filters.askMin === undefined && filters.askMax === undefined}
              onChange={() => setAsk()}
            />
            {ASK_BANDS.map((band) => (
              <RadioRow
                key={band.label}
                label={band.label}
                checked={askActive(band.min, band.max)}
                onChange={() => setAsk(band.min, band.max)}
              />
            ))}
          </Group>

          <Group label="Show only">
            <CheckRow
              label="Featured"
              hint="Cleared the quality bar for wider discovery. Not an endorsement."
              count={counts.featured}
              checked={filters.featuredOnly}
              onChange={() => toggleFlag('featured', !filters.featuredOnly)}
            />
            <CheckRow
              label="Verified creator"
              hint="Identity confirmed. Required before anyone can receive money."
              count={counts.verified}
              checked={filters.verifiedOnly}
              onChange={() => toggleFlag('verified', !filters.verifiedOnly)}
            />
          </Group>

          {anyFilter && (
            <p className="text-xs leading-relaxed text-ink-muted">
              {total} {total === 1 ? 'idea matches' : 'ideas match'} these filters.
            </p>
          )}
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

function Group({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border-t border-border pt-4 first:border-t-0 first:pt-0">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </legend>
      {note && <p className="mb-2 text-[11px] leading-relaxed text-ink-muted">{note}</p>}
      <div className="space-y-1">{children}</div>
    </fieldset>
  );
}

function CheckRow({
  label,
  hint,
  count,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  // An option that would return nothing is disabled rather than removed: a rail that reshuffles as you
  // use it is far more disorienting than one with a greyed row in it.
  const empty = count === 0 && !checked;

  return (
    <label
      className={cn(
        'flex min-h-9 cursor-pointer items-start gap-2.5 rounded px-1 py-1 text-sm transition-colors',
        empty ? 'cursor-not-allowed opacity-45' : 'hover:bg-accent-50'
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={empty}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 shrink-0 accent-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-ink">{label}</span>
          <span className="shrink-0 text-xs text-ink-muted tabular-nums">{count}</span>
        </span>
        {hint && <span className="mt-0.5 block text-[11px] leading-snug text-ink-muted">{hint}</span>}
      </span>
    </label>
  );
}

function RadioRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded px-1 py-1 text-sm transition-colors hover:bg-accent-50">
      <input
        type="radio"
        name="ask"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 accent-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      />
      <span className="text-ink">{label}</span>
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
