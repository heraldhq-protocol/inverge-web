/**
 * Text helpers shared by URL building and share-image rendering.
 *
 * Share surfaces receive creator-authored text. Everything that leaves the
 * database for a URL or an image passes through here first, so control
 * characters and runaway lengths cannot reach a cache key or a rendered card.
 */

/** C0/C1 control characters, including the null byte. */
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F-\u009F]/g;

/**
 * Truncates to `maxLength`, reserving one character for the ellipsis so the
 * result never exceeds the budget.
 */
export function truncateText(value: string, maxLength: number): string {
  if (maxLength <= 0) return "";
  if (value.length <= maxLength) return value;

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

/**
 * Strips control characters, collapses whitespace, and truncates.
 *
 * Collapsing to single spaces keeps the value safe for a URL query parameter
 * and for a single line of type in a share image.
 */
export function sanitizeText(value: string, maxLength: number): string {
  const collapsed = value
    .replace(CONTROL_CHARACTERS, " ")
    .replace(/\s+/g, " ")
    .trim();

  return truncateText(collapsed, maxLength);
}
