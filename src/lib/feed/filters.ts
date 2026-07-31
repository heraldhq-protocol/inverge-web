import { buildGateProgress } from '@/lib/ideas/gate';
import { parseDecimal } from '@/lib/format';
import type { FeedItem } from './types';

/**
 * Filtering for the topic pages, as pure functions over a page of feed items.
 *
 * **Which of the reference's filters survive the translation, and which cannot.** The reference filters
 * on money that has moved; at the validation stage none has, so three of its controls would be lies
 * here and are deliberately absent:
 *
 * - *Amount raised* → there is no raised amount. The nearest honest thing is **estimated interest**,
 *   which is what supporters said they would put in, weighted by how verified they are, and it is
 *   labelled that way everywhere it appears.
 * - *Saved projects* → there is no bookmark, by design. Support is already the low-cost signal, and a
 *   second weak signal would only dilute it (teardown §3).
 * - *Projects We Love* → our nearest equivalent is the **Featured** discoverability tier, which is a
 *   quality floor rather than an editorial endorsement, so it is worded as such (FR-272).
 *
 * What does translate cleanly: stage, region, ask size, and progress toward the threshold. The last one
 * is the most useful filter on the page and has no reference equivalent worth copying — "nearly there"
 * is a real reason to look at an idea now rather than later.
 */

export type StageFilter = 'validating' | 'threshold-met';

export type ProgressBand = 'under-25' | '25-50' | '50-75' | '75-100';

export type SortKey = 'recommended' | 'newest' | 'closing' | 'supporters' | 'interest';

export type FeedFilters = {
  stages: StageFilter[];
  regions: string[];
  /** Ask size in USD. Either end may be omitted. */
  askMin?: number;
  askMax?: number;
  progress: ProgressBand[];
  featuredOnly: boolean;
  verifiedOnly: boolean;
  sort: SortKey;
};

export const EMPTY_FILTERS: FeedFilters = {
  stages: [],
  regions: [],
  progress: [],
  featuredOnly: false,
  verifiedOnly: false,
  sort: 'recommended',
};

export const PROGRESS_BANDS: { value: ProgressBand; label: string; min: number; max: number }[] = [
  { value: 'under-25', label: 'Just started', min: 0, max: 0.25 },
  { value: '25-50', label: 'Getting going', min: 0.25, max: 0.5 },
  { value: '50-75', label: 'Halfway', min: 0.5, max: 0.75 },
  { value: '75-100', label: 'Nearly there', min: 0.75, max: 1.01 },
];

export const ASK_BANDS: { label: string; min?: number; max?: number }[] = [
  { label: 'Under $10,000', max: 10_000 },
  { label: '$10,000 to $30,000', min: 10_000, max: 30_000 },
  { label: 'Over $30,000', min: 30_000 },
];

export const SORTS: { value: SortKey; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'closing', label: 'Closing soonest' },
  { value: 'newest', label: 'Newest' },
  { value: 'supporters', label: 'Most supporters' },
  { value: 'interest', label: 'Most estimated interest' },
];

function progressOf(item: FeedItem): number {
  return item.status === 'THRESHOLD_MET' ? 1 : buildGateProgress(item).overallPct;
}

export function matches(item: FeedItem, filters: FeedFilters): boolean {
  if (filters.stages.length) {
    const stage: StageFilter = item.status === 'THRESHOLD_MET' ? 'threshold-met' : 'validating';
    if (!filters.stages.includes(stage)) return false;
  }

  if (filters.regions.length && !(item.region && filters.regions.includes(item.region))) return false;

  const ask = parseDecimal(item.askAmount);
  if (filters.askMin !== undefined && ask < filters.askMin) return false;
  if (filters.askMax !== undefined && ask >= filters.askMax) return false;

  if (filters.progress.length) {
    const pct = progressOf(item);
    const inBand = filters.progress.some((band) => {
      const def = PROGRESS_BANDS.find((b) => b.value === band);
      return def ? pct >= def.min && pct < def.max : false;
    });
    if (!inBand) return false;
  }

  if (filters.featuredOnly && item.discoverabilityTier !== 'FEATURED') return false;
  if (filters.verifiedOnly && !item.creator?.identityVerified) return false;

  return true;
}

/**
 * `recommended` deliberately does nothing: the ranked order is what the server sent, and re-sorting it
 * client-side would throw away the ranking (feed-api.md). Every other option is an explicit request from
 * the reader, which is a different thing from silently reordering their feed.
 *
 * When the API grows a `sort` param these move server-side; the labels do not change.
 */
export function sortItems(items: FeedItem[], sort: SortKey): FeedItem[] {
  if (sort === 'recommended') return items;
  const out = [...items];

  switch (sort) {
    case 'supporters':
      return out.sort((a, b) => b.supporterCount - a.supporterCount);
    case 'interest':
      return out.sort(
        (a, b) => parseDecimal(b.weightedPrePledgeTotal) - parseDecimal(a.weightedPrePledgeTotal)
      );
    case 'newest':
      return out.sort(
        (a, b) => new Date(b.validatingSince ?? 0).getTime() - new Date(a.validatingSince ?? 0).getTime()
      );
    case 'closing':
      // Oldest validation window first — those are the ones closest to closing.
      return out.sort(
        (a, b) => new Date(a.validatingSince ?? 0).getTime() - new Date(b.validatingSince ?? 0).getTime()
      );
    default:
      return out;
  }
}

export function applyFilters(items: FeedItem[], filters: FeedFilters): FeedItem[] {
  return sortItems(
    items.filter((item) => matches(item, filters)),
    filters.sort
  );
}

/**
 * How many items each option would leave, computed with that option's own group ignored.
 *
 * The reference shows a count beside every filter, and it is the detail that makes a rail usable: it
 * tells you which choices are worth making before you make them, and which would empty the page.
 * Counting with the group's own selections removed is what stops a chosen option showing "0".
 */
export function facetCounts(items: FeedItem[], filters: FeedFilters) {
  const without = <K extends keyof FeedFilters>(key: K, value: FeedFilters[K]): FeedFilters => ({
    ...filters,
    [key]: value,
  });

  const count = (f: FeedFilters) => items.filter((item) => matches(item, f)).length;

  return {
    stage: {
      validating: count({ ...without('stages', [] as StageFilter[]), stages: ['validating'] }),
      'threshold-met': count({ ...without('stages', [] as StageFilter[]), stages: ['threshold-met'] }),
    } as Record<StageFilter, number>,
    region: Object.fromEntries(
      regionsOf(items).map((region) => [
        region,
        count({ ...without('regions', [] as string[]), regions: [region] }),
      ])
    ) as Record<string, number>,
    progress: Object.fromEntries(
      PROGRESS_BANDS.map((band) => [
        band.value,
        count({ ...without('progress', [] as ProgressBand[]), progress: [band.value] }),
      ])
    ) as Record<ProgressBand, number>,
    featured: count({ ...filters, featuredOnly: true }),
    verified: count({ ...filters, verifiedOnly: true }),
  };
}

export function regionsOf(items: FeedItem[]): string[] {
  return [...new Set(items.map((i) => i.region).filter((r): r is string => Boolean(r)))].sort();
}

/** Reads the filter state out of the URL, so a filtered view is shareable and server-rendered. */
export function filtersFromParams(params: Record<string, string | string[] | undefined>): FeedFilters {
  const list = (key: string): string[] => {
    const value = params[key];
    if (!value) return [];
    return (Array.isArray(value) ? value : value.split(',')).filter(Boolean);
  };
  const num = (key: string): number | undefined => {
    const value = params[key];
    const first = Array.isArray(value) ? value[0] : value;
    const n = Number(first);
    return first && Number.isFinite(n) ? n : undefined;
  };
  const flag = (key: string) => params[key] === '1' || params[key] === 'true';
  const sortRaw = Array.isArray(params.sort) ? params.sort[0] : params.sort;

  return {
    stages: list('stage').filter((s): s is StageFilter => s === 'validating' || s === 'threshold-met'),
    regions: list('region'),
    askMin: num('askMin'),
    askMax: num('askMax'),
    progress: list('progress').filter((p): p is ProgressBand =>
      PROGRESS_BANDS.some((b) => b.value === p)
    ),
    featuredOnly: flag('featured'),
    verifiedOnly: flag('verified'),
    sort: SORTS.some((s) => s.value === sortRaw) ? (sortRaw as SortKey) : 'recommended',
  };
}

export function hasAnyFilter(filters: FeedFilters): boolean {
  return (
    filters.stages.length > 0 ||
    filters.regions.length > 0 ||
    filters.progress.length > 0 ||
    filters.featuredOnly ||
    filters.verifiedOnly ||
    filters.askMin !== undefined ||
    filters.askMax !== undefined
  );
}
