import type { PaletteCommand } from "@/features/command-palette/types";

/**
 * Local, deterministic matching for navigation commands.
 *
 * The matcher is intentionally small: whole-label and alias prefixes rank above
 * token prefixes, token substrings sit below those, and a character
 * subsequence is the last resort. Content search is the API's job; this only
 * decides which commands are worth showing before a request is made.
 */

const MARKS = /[\u0300-\u036f]/g;
const NON_ALPHANUMERIC = /[^a-z0-9]+/g;

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(MARKS, "")
    .toLowerCase()
    .replace(NON_ALPHANUMERIC, " ")
    .trim();
}

function tokens(value: string): string[] {
  const normalized = normalizeSearchText(value);
  return normalized ? normalized.split(" ") : [];
}

function isSubsequence(needle: string, haystack: string): boolean {
  let index = 0;
  for (const character of haystack) {
    if (character === needle[index]) index += 1;
    if (index === needle.length) return true;
  }
  return needle.length === 0;
}

export function scoreCommand(
  query: string,
  command: Pick<PaletteCommand, "description" | "keywords" | "label">,
): number | null {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return 0;

  const label = normalizeSearchText(command.label);
  const aliases = command.keywords.map(normalizeSearchText);
  const description = normalizeSearchText(command.description ?? "");

  if (label === normalizedQuery) return 1_000;
  if (label.startsWith(normalizedQuery)) {
    return 900 - Math.min(50, label.length - normalizedQuery.length);
  }

  const exactAlias = aliases.findIndex((alias) => alias === normalizedQuery);
  if (exactAlias >= 0) return 850 - exactAlias;

  const prefixAlias = aliases.findIndex((alias) =>
    alias.startsWith(normalizedQuery),
  );
  if (prefixAlias >= 0) return 800 - prefixAlias;

  const queryTokens = tokens(normalizedQuery);
  const haystackTokens = [label, ...aliases, description].flatMap(tokens);

  if (
    queryTokens.every((queryToken) =>
      haystackTokens.some((token) => token.startsWith(queryToken)),
    )
  ) {
    return 650;
  }

  if (
    queryTokens.every((queryToken) =>
      haystackTokens.some((token) => token.includes(queryToken)),
    )
  ) {
    return 500;
  }

  if (queryTokens.length === 1 && isSubsequence(normalizedQuery, label)) {
    return 250;
  }

  return null;
}

export function filterCommands(
  commands: readonly PaletteCommand[],
  query: string,
): PaletteCommand[] {
  const trimmed = query.trim();
  if (!trimmed) return [...commands];

  return commands
    .map((command, index) => ({
      command,
      index,
      score: scoreCommand(trimmed, command),
    }))
    .filter(
      (
        entry,
      ): entry is { command: PaletteCommand; index: number; score: number } =>
        entry.score !== null,
    )
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((entry) => entry.command);
}
