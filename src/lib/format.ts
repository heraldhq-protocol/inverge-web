// Formatting helpers shared by the app screens. Money is NOT formatted here — every amount goes
// through <Amount> / <Count> (conventions §1.2) so tabular figures are never bypassed.

/**
 * API Decimal fields arrive as strings ("1830.50"). Parse before doing arithmetic or
 * comparisons; `Number('')` is 0 and `Number(null)` is 0, so guard explicitly.
 */
export function parseDecimal(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** 0.68 → "68%". Rounds to whole percent; the meter never shows decimals. */
export function formatPercent(ratio: number): string {
  return `${Math.round(clamp01(ratio) * 100)}%`;
}

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

const DAY_MS = 86_400_000;

/**
 * Whole days from now until `date`, floored at 0. Computed on the server at render time and
 * rendered as a number of days: a ticking clock would be motion in the viewport at rest
 * (conventions §9.4) and reads as pressure on screens whose job is calm.
 */
export function daysUntil(date: string | Date | null | undefined, now: Date = new Date()): number {
  if (!date) return 0;
  const then = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(then.getTime())) return 0;
  return Math.max(0, Math.ceil((then.getTime() - now.getTime()) / DAY_MS));
}

/** Whole days elapsed since `date`, floored at 0. */
export function daysSince(date: string | Date | null | undefined, now: Date = new Date()): number {
  if (!date) return 0;
  const then = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(then.getTime())) return 0;
  return Math.max(0, Math.floor((now.getTime() - then.getTime()) / DAY_MS));
}

/** "12 March 2026" — UK order, spelled month, no ordinal suffix. */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** "12 Mar 2026" — for dense rows and table cells. */
export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}

/** "AO" from "Amara Okonkwo"; falls back to a single letter, never to an empty box. */
export function initials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** Sentence-cases an API enum for display: "THRESHOLD_MET" → "Threshold met". */
export function humaniseEnum(value: string): string {
  const lower = value.toLowerCase().replace(/_/g, ' ');
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
