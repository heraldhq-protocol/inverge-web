/**
 * The live category page number from the URL.
 *
 * Invalid, missing, and repeated values fall back to page one rather than
 * throwing. The listing clamps a page past the end, so a stale link still lands
 * on a real page instead of an empty grid.
 */
export function campaignPageFromParam(
  value: string | string[] | undefined,
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
