import "server-only";

import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionToken } from "@/features/auth/server/session";
import { emptyFeedbackForm } from "@/features/feedback/content/preview-feedback";
import type {
  CommunityInvite,
  FeedbackForm,
  FeedbackQuestion,
} from "@/features/feedback/types";
import { getPreviewIdeaDetail } from "@/features/ideas/content/preview-idea-detail";
import {
  getLiveIdea,
  toIdeaDetail,
} from "@/features/ideas/server/live-ideas";
import type { IdeaDetail } from "@/features/ideas/types";
import { ApiRequestError, fetchApiJson, isApiConfigured } from "@/lib/api/server";

export type ApiQuestion = {
  id: string;
  index: number;
  options: string[] | null;
  prompt: string;
  required: boolean;
  type: string;
};

export type FeedbackBuilderView = {
  community: CommunityInvite;
  dataSource: "live" | "preview";
  form: FeedbackForm;
  idea: IdeaDetail;
};

export type FeedbackBuilderResult =
  | { status: "ready"; view: FeedbackBuilderView }
  | { status: "not_found" }
  | { status: "signed_out" }
  | { status: "unavailable"; reason: string };

const emptyCommunity: CommunityInvite = {
  description: "",
  destinations: [],
  enabled: false,
  primaryDestinationId: null,
  showAfterFeedback: true,
  showOnIdeaPage: false,
  title: "Want to stay connected?",
};

const BUILDER_TYPE: Readonly<Record<string, FeedbackQuestion["type"]>> = {
  BOOLEAN: "boolean",
  MULTI_CHOICE: "multi-choice",
  RATING: "rating",
  SINGLE_CHOICE: "single-choice",
  TEXT: "long-text",
};

export function toFeedbackForm(questions: readonly ApiQuestion[]): FeedbackForm {
  const mapped = [...questions]
    .sort((left, right) => left.index - right.index)
    .map((question) => {
      const type = BUILDER_TYPE[question.type] ?? "long-text";
      return {
        id: question.id,
        label: question.prompt,
        required: question.required,
        type,
        ...(question.options && question.options.length > 0
          ? {
              options: question.options.map((label, index) => ({
                id: `${question.id}-${index}`,
                label,
              })),
            }
          : {}),
      } satisfies FeedbackQuestion;
    });

  return {
    ...emptyFeedbackForm(),
    enabled: mapped.length > 0,
    published: mapped.length > 0,
    questions: mapped,
    updatedAt: new Date().toISOString(),
  };
}

function failure(error: unknown): FeedbackBuilderResult {
  const status = error instanceof ApiRequestError ? error.status : null;
  if (status === 401) return { status: "signed_out" };
  if (status === 403 || status === 404) return { status: "not_found" };
  return {
    reason:
      status !== null && status >= 500
        ? "The feedback service is temporarily unavailable. Try again."
        : "We could not load this feedback form. Try again.",
    status: "unavailable",
  };
}

export async function getFeedbackBuilderView(
  ideaId: string,
): Promise<FeedbackBuilderResult> {
  if (isPreviewAuth() || !isApiConfigured()) {
    const idea = getPreviewIdeaDetail(ideaId);
    if (!idea) return { status: "not_found" };
    return {
      status: "ready",
      view: {
        community: idea.community ?? emptyCommunity,
        dataSource: "preview",
        form: idea.feedbackForm ?? emptyFeedbackForm(),
        idea,
      },
    };
  }

  const token = await readSessionToken();
  if (!token) return { status: "signed_out" };

  try {
    const [apiIdea, questions] = await Promise.all([
      getLiveIdea(ideaId, { includeDraft: true, token }),
      fetchApiJson<ApiQuestion[]>(`/ideas/${encodeURIComponent(ideaId)}/survey`),
      fetchApiJson(`/ideas/${encodeURIComponent(ideaId)}/insights`, { token }),
    ]);
    if (!apiIdea) return { status: "not_found" };

    return {
      status: "ready",
      view: {
        community: emptyCommunity,
        dataSource: "live",
        form: toFeedbackForm(Array.isArray(questions) ? questions : []),
        idea: toIdeaDetail(apiIdea),
      },
    };
  } catch (error) {
    return failure(error);
  }
}
