import "server-only";

import { fetchApiJson, sendApiJson } from "@/lib/api/server";
import {
  toDiscussionComment,
  toDiscussionPage,
  type ApiDiscussionComment,
  type ApiDiscussionPage,
} from "@/features/discussions/lib/comment-mapper";
import type {
  DiscussionComment,
  DiscussionPage,
} from "@/features/discussions/types";

export const DISCUSSION_PAGE_SIZE = 20;

function withQuery(
  path: string,
  options: { cursor?: string | null; limit?: number },
): string {
  const params = new URLSearchParams({
    limit: String(options.limit ?? DISCUSSION_PAGE_SIZE),
  });
  if (options.cursor) params.set("cursor", options.cursor);
  return `${path}?${params.toString()}`;
}

/**
 * One page of a public thread. The API is the access boundary: an unavailable
 * campaign or an unpublished idea answers 404 and this throws.
 */
export async function fetchDiscussionPage(
  path: string,
  options: { cursor?: string | null; limit?: number; token?: string | null } = {},
): Promise<DiscussionPage> {
  const page = await fetchApiJson<ApiDiscussionPage>(
    withQuery(path, options),
    options.token ? { token: options.token } : {},
  );

  return toDiscussionPage(page);
}

export type DiscussionWriteFailure = {
  ok: false;
  status: number;
  code: string;
  message: string;
  details?: unknown;
};

export type DiscussionWriteResult =
  | { ok: true; comment: DiscussionComment }
  | DiscussionWriteFailure;

/** Creates a comment as the authenticated session user. */
export async function createDiscussionComment(
  path: string,
  token: string,
  body: string,
): Promise<DiscussionWriteResult> {
  const result = await sendApiJson(path, { body: { body }, method: "POST", token });
  if (!result.ok) return result;
  return { comment: toDiscussionComment(result.data as ApiDiscussionComment), ok: true };
}

export type DiscussionDeleteResult = { ok: true } | DiscussionWriteFailure;

/** Deletes one comment. Ownership is re-checked by the API, not here. */
export async function deleteDiscussionComment(
  path: string,
  token: string,
  commentId: string,
): Promise<DiscussionDeleteResult> {
  const result = await sendApiJson(
    `${path}/${encodeURIComponent(commentId)}`,
    { method: "DELETE", token },
  );
  if (!result.ok) return result;
  return { ok: true };
}
