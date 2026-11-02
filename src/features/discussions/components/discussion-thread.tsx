"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  MessageMultiple01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { authHref } from "@/features/auth/lib/auth-routes";
import {
  toDiscussionComment,
  toDiscussionPage,
  type ApiDiscussionComment,
  type ApiDiscussionPage,
} from "@/features/discussions/lib/comment-mapper";
import {
  hasComposeIntent,
  withComposeIntent,
} from "@/features/discussions/lib/return-path";
import type {
  DiscussionComment,
  DiscussionViewer,
} from "@/features/discussions/types";

const TIMESTAMP = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return Number.isFinite(date.getTime()) ? TIMESTAMP.format(date) : "";
}

function authorName(
  author: DiscussionComment["author"],
  creatorLabel: string,
): string {
  const display = author.displayName?.trim();
  if (display) return display;
  return author.isCreator ? creatorLabel : "Community member";
}

type Phase = "idle" | "posting" | "loadingMore" | "refreshing";

type DiscussionThreadProps = {
  comments: readonly DiscussionComment[];
  initialHasMore?: boolean;
  initialNextCursor?: string | null;
  mode: "live" | "preview";
  unavailable?: boolean;
  viewer: DiscussionViewer;
  /** BFF path, for example `/api/ideas/<id>/comments`. */
  listEndpoint: string;
  /** The page to return to after sign-in, including tab and filters. */
  returnPath: string;
  headingId: string;
  heading?: string;
  creatorLabel?: string;
  emptyMessage: string;
  prompt: string;
  /** A closed idea keeps its history but accepts no new comments. */
  canPost?: boolean;
  closedMessage?: string;
};

/**
 * The one discussion renderer used by ideas and campaigns.
 *
 * Persistence is the API's: a live thread reads the page it was given, posts
 * through the BFF, and re-reads the first page after a successful post so the
 * row, its position and its author projection match a reload exactly. Preview
 * mode is explicitly local and says so; it never presents a fixture as live.
 *
 * A visitor who is not signed in is not shown a form that would discard their
 * text. The prompt links to `/auth` with the current page as `next` and a
 * `compose=1` hint, so authentication returns them to this thread with the
 * composer focused and nothing already published.
 */
export function DiscussionThread({
  canPost = true,
  closedMessage = "This thread is closed to new comments.",
  comments: initialComments,
  creatorLabel = "Creator",
  emptyMessage,
  heading = "Discussion",
  headingId,
  initialHasMore = false,
  initialNextCursor = null,
  listEndpoint,
  mode,
  prompt,
  returnPath,
  unavailable = false,
  viewer,
}: DiscussionThreadProps) {
  const [comments, setComments] = useState<DiscussionComment[]>([
    ...initialComments,
  ]);
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [status, setStatus] = useState("");
  const [authRequired, setAuthRequired] = useState(false);
  const [verifyRequired, setVerifyRequired] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const busy = phase !== "idle";

  useEffect(() => {
    if (mode !== "live" || !viewer.signedIn) return;
    if (!hasComposeIntent(window.location.search)) return;

    const node = textareaRef.current;
    if (node) {
      node.focus();
      node.scrollIntoView({ block: "center" });
    }

    // The hint has done its job. Leaving it in the URL would re-focus the
    // composer on every refresh and make the back button misleading.
    const url = new URL(window.location.href);
    url.searchParams.delete("compose");
    window.history.replaceState(window.history.state, "", url);
  }, [mode, viewer.signedIn]);

  async function requestPage(
    cursor: string | null,
  ): Promise<{ comments: DiscussionComment[]; hasMore: boolean; nextCursor: string | null }> {
    const query = cursor
      ? `?cursor=${encodeURIComponent(cursor)}`
      : "?limit=20";
    const response = await fetch(`${listEndpoint}${query}`, {
      cache: "no-store",
    });

    if (!response.ok) throw new Error("thread_unavailable");

    const body = (await response.json()) as ApiDiscussionPage;
    return toDiscussionPage(body);
  }

  async function refreshFirstPage(): Promise<boolean> {
    try {
      const page = await requestPage(null);
      setComments(page.comments);
      setHasMore(page.hasMore);
      setNextCursor(page.nextCursor);
      setLoadError("");
      return true;
    } catch {
      return false;
    }
  }

  async function handleRetry() {
    setPhase("refreshing");
    setLoadError("");
    const ok = await refreshFirstPage();
    if (!ok) {
      setLoadError(
        "The thread could not be loaded right now. The page above is unaffected.",
      );
    }
    setPhase("idle");
  }

  async function handleLoadMore() {
    if (!nextCursor || phase !== "idle") return;
    setPhase("loadingMore");
    setLoadError("");

    try {
      const page = await requestPage(nextCursor);
      setComments((current) => {
        const seen = new Set(current.map((comment) => comment.id));
        return [
          ...current,
          ...page.comments.filter((comment) => !seen.has(comment.id)),
        ];
      });
      setHasMore(page.hasMore);
      setNextCursor(page.nextCursor);
    } catch {
      setLoadError("More comments could not be loaded. Try again.");
    } finally {
      setPhase("idle");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canPost || busy) return;

    const body = draft.trim();
    if (!body) return;

    if (!viewer.signedIn) {
      window.location.assign(authHref(withComposeIntent(returnPath)));
      return;
    }

    setSubmitError("");
    setVerifyRequired(false);

    if (mode === "preview") {
      setComments((current) => [
        {
          author: {
            avatarUrl: viewer.avatarUrl,
            displayName: viewer.displayName ?? "You",
            id: viewer.id ?? "preview-viewer",
            isCreator: false,
          },
          body,
          createdAt: new Date().toISOString(),
          id: `preview-${Date.now()}`,
        },
        ...current,
      ]);
      setDraft("");
      setStatus("Preview comment added. Nothing was saved.");
      return;
    }

    setPhase("posting");
    setStatus("");

    try {
      const response = await fetch(listEndpoint, {
        body: JSON.stringify({ body }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as
        | ApiDiscussionComment
        | { error?: { code?: unknown; message?: unknown } }
        | null;

      if (response.status === 401) {
        setAuthRequired(true);
        setSubmitError("Your session has ended. Sign in again to comment.");
        return;
      }

      if (!response.ok) {
        const error =
          payload && typeof payload === "object" && "error" in payload
            ? payload.error
            : null;
        const code =
          error && typeof error.code === "string" ? error.code : "";
        if (code === "EMAIL_VERIFICATION_REQUIRED") {
          setVerifyRequired(true);
          return;
        }
        const message =
          error && typeof error.message === "string" && error.message.trim()
            ? error.message
            : "Your comment could not be posted. Try again.";
        setSubmitError(message);
        return;
      }

      setDraft("");
      setStatus("Your comment is posted.");

      const refreshed = await refreshFirstPage();
      if (!refreshed && payload && "author" in payload) {
        // The post succeeded but the immediate re-read did not. Keeping the
        // returned row is honest; the next reload will read the API again.
        const created = toDiscussionComment(payload);
        setComments((current) => [
          created,
          ...current.filter((comment) => comment.id !== created.id),
        ]);
        setLoadError("The comment posted, but the thread could not refresh.");
      }
    } catch {
      setSubmitError(
        "Inverge could not be reached. Your comment was not posted.",
      );
    } finally {
      setPhase("idle");
    }
  }

  async function handleDelete(comment: DiscussionComment) {
    setSubmitError("");
    setStatus("");

    if (mode === "preview") {
      setComments((current) =>
        current.filter((candidate) => candidate.id !== comment.id),
      );
      setConfirmingDelete(null);
      setStatus("Preview comment removed.");
      return;
    }

    try {
      const response = await fetch(
        `${listEndpoint}/${encodeURIComponent(comment.id)}`,
        { method: "DELETE" },
      );

      if (response.status === 401) {
        setAuthRequired(true);
        return;
      }
      if (!response.ok) {
        setSubmitError("That comment could not be deleted.");
        return;
      }

      setComments((current) =>
        current.filter((candidate) => candidate.id !== comment.id),
      );
      setStatus("Your comment was deleted.");
    } catch {
      setSubmitError("Inverge could not be reached. Nothing was deleted.");
    } finally {
      setConfirmingDelete(null);
    }
  }

  const signInHref = authHref(withComposeIntent(returnPath));
  const countLabel = `${comments.length}${hasMore ? "+" : ""} comment${
    comments.length === 1 && !hasMore ? "" : "s"
  }`;

  return (
    <section aria-labelledby={headingId} className="mt-10 border-t border-border pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            aria-hidden="true"
            className="text-brand-strong"
            icon={MessageMultiple01Icon}
            size={18}
            strokeWidth={1.8}
          />
          <h2
            className="text-lg font-bold tracking-[-0.025em] text-ink"
            id={headingId}
          >
            {heading}
          </h2>
        </div>
        <span className="text-xs text-muted">
          {unavailable ? "Unavailable" : countLabel}
          {mode === "preview" ? " \u00b7 Preview" : ""}
        </span>
      </div>

      {unavailable ? (
        <div className="mt-4 max-w-2xl rounded-2xl border border-border bg-surface-muted p-4">
          <p className="flex gap-2 text-sm leading-6 text-muted">
            <HugeiconsIcon
              aria-hidden="true"
              className="mt-1 shrink-0 text-muted"
              icon={Alert02Icon}
              size={16}
              strokeWidth={1.8}
            />
            The discussion could not be loaded right now. The page above is
            unaffected.
          </p>
          {mode === "live" ? (
            <Button
              className="mt-3"
              disabled={busy}
              onClick={() => void handleRetry()}
              size="sm"
              type="button"
              variant="secondary"
            >
              {phase === "refreshing" ? "Retrying\u2026" : "Try again"}
            </Button>
          ) : null}
        </div>
      ) : comments.length > 0 ? (
        <ul className="mt-5 max-w-2xl space-y-5">
          {comments.map((comment) => {
            const name = authorName(comment.author, creatorLabel);
            const isOwn =
              viewer.signedIn && viewer.id !== null && viewer.id === comment.author.id;
            const confirming = confirmingDelete === comment.id;

            return (
              <li className="flex gap-3" key={comment.id}>
                <Avatar
                  name={name}
                  size={32}
                  src={comment.author.avatarUrl}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
                    <span className="font-semibold text-ink">{name}</span>
                    {comment.author.isCreator ? (
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[0.6875rem] font-semibold text-brand-strong">
                        {creatorLabel}
                      </span>
                    ) : null}
                    {comment.pinned ? (
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[0.6875rem] font-semibold text-brand-strong">
                        Creator&apos;s pick
                      </span>
                    ) : null}
                    <time
                      className="text-xs text-muted"
                      dateTime={comment.createdAt}
                    >
                      {formatTimestamp(comment.createdAt)}
                    </time>
                  </div>
                  <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-ink/85">
                    {comment.body}
                  </p>

                  {isOwn ? (
                    confirming ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-muted">Delete this comment?</span>
                        <button
                          className="min-h-8 rounded-lg px-2 font-semibold text-danger hover:bg-danger/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
                          onClick={() => void handleDelete(comment)}
                          type="button"
                        >
                          Delete
                        </button>
                        <button
                          className="min-h-8 rounded-lg px-2 font-semibold text-muted hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                          onClick={() => setConfirmingDelete(null)}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="mt-1 min-h-8 rounded-lg text-xs font-semibold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        onClick={() => setConfirmingDelete(comment.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    )
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          {emptyMessage}
        </p>
      )}

      {loadError ? (
        <p className="mt-4 max-w-2xl text-sm leading-6 text-danger" role="status">
          {loadError}
        </p>
      ) : null}

      {hasMore ? (
        <Button
          className="mt-5"
          disabled={busy}
          onClick={() => void handleLoadMore()}
          size="sm"
          type="button"
          variant="secondary"
        >
          {phase === "loadingMore" ? "Loading\u2026" : "Load more comments"}
        </Button>
      ) : null}

      {!canPost ? (
        <p className="mt-6 max-w-2xl text-sm leading-6 text-muted">
          {closedMessage}
        </p>
      ) : authRequired ? (
        <p className="mt-6 max-w-2xl text-sm leading-6 text-muted">
          <Link
            className="font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            href={signInHref}
          >
            Sign in again
          </Link>{" "}
          to continue the discussion.
        </p>
      ) : !viewer.signedIn ? (
        <p className="mt-6 max-w-2xl text-sm leading-6 text-muted">
          <Link
            className="font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            href={signInHref}
          >
            Sign in
          </Link>{" "}
          or{" "}
          <Link
            className="font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            href={signInHref}
          >
            create an account
          </Link>{" "}
          to {prompt}.
        </p>
      ) : (
        <form className="mt-6 max-w-2xl" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between gap-3">
            <label
              className="text-sm font-semibold text-ink"
              htmlFor={`${headingId}-input`}
            >
              Add a comment
            </label>
            {mode === "preview" ? (
              <span
                className="text-xs text-muted"
                title="Preview only - nothing is saved to an account."
              >
                Preview
              </span>
            ) : null}
          </div>
          <Textarea
            className="mt-2"
            disabled={phase === "posting"}
            id={`${headingId}-input`}
            maxLength={2000}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask a question or share your view."
            ref={textareaRef}
            rows={3}
            value={draft}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              disabled={phase === "posting" || draft.trim().length === 0}
              size="md"
              type="submit"
            >
              {phase === "posting" ? "Posting\u2026" : "Post comment"}
            </Button>
            {mode === "preview" ? (
              <span className="text-xs text-muted">
                Not saved in this preview.
              </span>
            ) : null}
          </div>

          {verifyRequired ? (
            <p className="mt-3 rounded-xl bg-surface-muted p-3 text-sm leading-6 text-ink">
              Verify your email address before commenting.{" "}
              <Link
                className="font-semibold text-brand-strong underline-offset-4 hover:underline"
                href={`/d/settings?next=${encodeURIComponent(returnPath)}`}
              >
                Verify email in settings
              </Link>
              . You will return to this discussion afterwards.
            </p>
          ) : null}

          {submitError ? (
            <p
              aria-live="polite"
              className="mt-3 text-sm leading-6 text-danger"
              role="alert"
            >
              {submitError}
            </p>
          ) : null}

          <p aria-live="polite" className="mt-3 min-h-5 text-sm text-muted">
            {status}
          </p>
        </form>
      )}
    </section>
  );
}
