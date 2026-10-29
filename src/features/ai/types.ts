export const IDEA_ASSISTANT_ACTIONS = [
  "improve",
  "shorten",
  "expand",
  "critique",
] as const;
export type IdeaAssistantAction = (typeof IDEA_ASSISTANT_ACTIONS)[number];

export const IDEA_ASSISTANT_FIELDS = [
  "title",
  "summary",
  "problem",
  "targetUser",
  "currentAlternative",
  "solution",
  "risks",
] as const;
export type IdeaAssistantField = (typeof IDEA_ASSISTANT_FIELDS)[number];

export type AiRequestStatus =
  "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "NOT_REQUIRED";

/** The API's answer to `GET /ai/access`; every value is server-decided. */
export type AiAccess = {
  feature: string;
  configured: boolean;
  premium: boolean;
  requestStatus: AiRequestStatus;
  canRequest: boolean;
  source: string | null;
  expiresAt: string | null;
  requestsToday: number;
  tokensToday: number;
  requestsPerDay: number;
  tokensPerDay: number;
};

export type AssistantMeta = {
  model: string;
  promptVersion: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
};

/** A proposal, never an applied edit. `baseRevision` is echoed for staleness. */
export type IdeaSuggestion = {
  suggestionId: string;
  action: IdeaAssistantAction;
  target: IdeaAssistantField;
  baseRevision: string;
  proposal: string | null;
  notes: string[];
  assumptions: string[];
  meta: AssistantMeta;
};
