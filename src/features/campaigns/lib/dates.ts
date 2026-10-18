/**
 * Date formatting for campaign surfaces.
 *
 * Every formatter pins `timeZone: "UTC"`. A campaign deadline is an instant, not
 * a wall-clock time in the reader's city, and a server-rendered page formatted in
 * the host's local zone would show one date during SSR and another after
 * hydration. `en-GB` gives the day-month-year order the product's copy uses.
 */

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

/** "15 January 2027". */
export function formatLongDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : dateFormatter.format(date);
}

/** "15 Jan 2027". */
export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : dateTimeFormatter.format(date);
}

/** "15 Jan 2027" or an explicit absence, never an empty cell. */
export function formatDateOrNull(iso: string | null): string {
  return iso === null ? "Not dated" : formatShortDate(iso);
}
