import type { DiscoveryCategory } from "@/features/home/discovery-categories";

import type { IdeaDraft } from "@/features/idea-builder/types";

/**
 * The legacy builder category is a presentation bucket, not the discovery
 * taxonomy. The API keeps its own enum; this is the only place the two vocabularies
 * meet, so a copy change cannot silently send an unsupported value.
 */
const CATEGORY_MAP: Record<DiscoveryCategory, string> = {
  technology: "technology",
  agriculture: "agritech",
  "clean-energy": "cleantech",
  creative: "art",
  community: "community",
  "food-retail": "food",
};

export type IdeaApiPayload = {
  title: string;
  problem: string;
  solution: string;
  targetUser: string;
  currentAlternative: string;
  category?: string;
  region: string | null;
  coverImageUrl: string | null;
  demoUrl: string | null;
  risks: string | null;
  askAmount: number;
  askBreakdown: Record<string, number>;
  roadmapSteps: Array<{ date: string; description: string }>;
};

const REQUIRED_FIELDS = [
  "title",
  "problem",
  "solution",
  "targetUser",
  "currentAlternative",
  "category",
] as const;

function clean(value: string): string {
  return value.trim();
}

/** Indicative USD only: no ledger arithmetic happens on this value. */
function amount(value: string): number {
  const parsed = Number.parseFloat(value.replace(/,/g, "").trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

/**
 * Maps the local builder document to the API's create/update shape.
 *
 * `summary` has no API column, so it deliberately stays in the browser. Empty
 * optional strings become `null` so clearing a field in the builder also clears
 * it on an update instead of leaving the previous value behind.
 */
export function toIdeaApiPayload(draft: IdeaDraft): IdeaApiPayload {
  const askAmount = amount(draft.funding.askAmount);
  const askBreakdown: Record<string, number> = {};

  for (const entry of draft.funding.useOfFunds) {
    const label = clean(entry.label);
    const value = amount(entry.amount);
    if (!label || value <= 0) continue;
    askBreakdown[label] = (askBreakdown[label] ?? 0) + value;
  }

  const roadmapSteps = draft.roadmapSteps
    .map((step) => ({
      date: clean(step.date),
      description: clean(step.description),
    }))
    .filter((step) => step.date && step.description);

  return {
    title: clean(draft.title),
    problem: clean(draft.problem),
    solution: clean(draft.solution),
    targetUser: clean(draft.targetUser),
    currentAlternative: clean(draft.currentAlternative),
    ...(draft.category ? { category: CATEGORY_MAP[draft.category] } : {}),
    region: clean(draft.region) || null,
    coverImageUrl: clean(draft.coverUrl) || null,
    demoUrl: clean(draft.demoUrl) || null,
    risks: clean(draft.risks) || null,
    askAmount,
    askBreakdown,
    roadmapSteps,
  };
}

/**
 * Fields the API cannot accept yet. The builder may be half-filled; saving the
 * local draft is fine, but creating the server record needs these values. The
 * message names the step rather than the field so the creator can act on it.
 */
export function missingIdeaApiFields(payload: IdeaApiPayload): string[] {
  const missing: Array<(typeof REQUIRED_FIELDS)[number]> = [];

  for (const field of REQUIRED_FIELDS) {
    const value = payload[field];
    if (typeof value !== "string" || value.length === 0) {
      missing.push(field);
    }
  }

  if (missing.length === 0) return [];

  const labels: Record<(typeof REQUIRED_FIELDS)[number], string> = {
    title: "a title",
    problem: "the problem",
    solution: "the solution",
    targetUser: "who the problem affects",
    currentAlternative: "what happens today",
    category: "a category",
  };

  return missing.map((field) => labels[field]);
}

/** The assistant's visible context, with the target field removed and blanks dropped. */
export function assistantContext(
  draft: IdeaDraft,
  target: string,
): Record<string, string> {
  const fields: Record<string, string> = {
    title: draft.title,
    summary: draft.summary,
    problem: draft.problem,
    targetUser: draft.targetUser,
    currentAlternative: draft.currentAlternative,
    solution: draft.solution,
    risks: draft.risks,
  };

  return Object.fromEntries(
    Object.entries(fields)
      .filter(([field, value]) => field !== target && value.trim().length > 0)
      .map(([field, value]) => [field, value.trim()]),
  );
}
