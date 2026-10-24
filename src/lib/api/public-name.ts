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
