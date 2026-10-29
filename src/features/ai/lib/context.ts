import type { IdeaDraft } from "@/features/idea-builder/types";

import type { IdeaAssistantField } from "../types";

/**
 * The visible draft context sent with an assistant request. The target field is
 * removed (it travels as `text`) and blanks are dropped so the prompt does not
 * spend its character budget on placeholders.
 */
export function assistantContext(
  draft: IdeaDraft,
  target: IdeaAssistantField,
): Record<string, string> {
  const fields: Record<IdeaAssistantField, string> = {
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
