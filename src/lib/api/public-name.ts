/**
 * Public identity rules shared by every API projection.
 *
 * The API falls back to the user id when no handle exists. An internal id is not
 * a public name, so it is replaced with a neutral label instead of being shown.
 */

export type ApiPublicCreator = {
  id: string;
  username: string;
  displayName: string | null;
  /** Optional so older projections keep working; detail reads use them. */
  avatarUrl?: string | null;
  bio?: string | null;
};

export function creatorNameFor(creator: ApiPublicCreator | null): string {
  if (!creator) return "Inverge creator";

  const displayName = creator.displayName?.trim();
  if (displayName) return displayName;

  const username = creator.username?.trim();
  if (
    username &&
    username !== creator.id &&
    !/^c[a-z0-9]{20,}$/i.test(username)
  ) {
    return username;
  }

  return "Inverge creator";
}

/**
 * The stored, routable handle for a creator, or `null`.
 *
 * The API's projection may fall back to a display-name slug or the user id.
 * Neither is a username the profile router serves, so only a value that looks
 * like a handle and differs from the internal id is returned.
 */
export function publicHandleFor(
  creator: ApiPublicCreator | null,
): string | null {
  const username = creator?.username?.trim().toLowerCase();
  if (!username) return null;
  if (username === creator?.id.toLowerCase()) return null;
  if (/^c[a-z0-9]{20,}$/i.test(username)) return null;
  return /^[a-z0-9_-]{3,30}$/.test(username) ? username : null;
}

export function initialsFor(name: string): string {
  const parts = name
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);

  if (parts.length === 0) return "IV";

  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toLocaleUpperCase())
    .join("");
}
