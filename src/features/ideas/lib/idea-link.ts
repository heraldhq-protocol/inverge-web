/**
 * Build an idea URL with the server-observed acquisition source.
 *
 * The source is a closed enum, not a referrer or UTM value. The idea page reads
 * it server-side and sends it with `idea_viewed`; it never stores the URL.
 */
export type IdeaLinkSource = "feed" | "search" | "internal";

export function ideaViewHref(ideaId: string, source?: IdeaLinkSource): string {
  const href = `/ideas/${encodeURIComponent(ideaId)}`;
  return source ? `${href}?source=${source}` : href;
}
