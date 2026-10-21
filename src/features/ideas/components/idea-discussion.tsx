"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { MessageMultiple01Icon } from "@hugeicons/core-free-icons";
import { type FormEvent, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useIdeaViewer } from "@/features/ideas/components/idea-viewer";
import type { IdeaComment } from "@/features/ideas/types";

function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(iso));
}

/**
 * The public discussion thread. Comments are readable by anyone; posting
 * requires a signed-in account, so the input is gated by the viewer state.
 * In preview, posting appends to the local list and is clearly labelled.
 */
export function IdeaDiscussion({
  comments: initialComments,
}: {
  comments: readonly IdeaComment[];
}) {
  const { viewer } = useIdeaViewer();
  const [comments, setComments] = useState<IdeaComment[]>([...initialComments]);
  const [draft, setDraft] = useState("");

  function handlePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;

    setComments((current) => [
      ...current,
      {
        author: "You",
        authorInitials: "YO",
        body,
        createdAt: new Date().toISOString(),
        id: `preview-${current.length}`,
      },
    ]);
    setDraft("");
  }

  return (
    <section
      aria-labelledby="idea-discussion"
      className="mt-10 border-t border-border pt-8"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={MessageMultiple01Icon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
            className="text-brand-strong"
          />
          <h2
            id="idea-discussion"
            className="text-lg font-bold tracking-[-0.025em] text-ink"
          >
            Community discussion
          </h2>
        </div>
        <span className="text-xs text-muted" title="Sample data">
          {comments.length} comments · Preview
        </span>
      </div>

      {comments.length > 0 ? (
        <ul className="mt-5 max-w-2xl space-y-5">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-contrast text-[0.625rem] font-bold text-white">
                {comment.authorInitials}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
                  <span className="font-semibold text-ink">
                    {comment.author}
                  </span>
                  {comment.pinned ? (
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[0.6875rem] font-semibold text-brand-strong">
                      Creator
                    </span>
                  ) : null}
                  <span className="text-xs text-muted">
                    {formatTimestamp(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-ink/85">
                  {comment.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          No comments yet. Join the discussion to share what you think about
          this idea.
        </p>
      )}

      {viewer === "signed-in" ? (
        <form onSubmit={handlePost} className="mt-6 max-w-2xl">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="discussion-input"
              className="text-sm font-semibold text-ink"
            >
              Add a comment
            </label>
            <span
              className="text-xs text-muted"
              title="Preview only — nothing is saved to an account yet."
            >
              Preview
            </span>
          </div>
          <Textarea
            id="discussion-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Ask a question or share your view."
            className="mt-2"
          />
          <Button type="submit" size="md" className="mt-3">
            Post comment
          </Button>
        </form>
      ) : (
        <p className="mt-6 text-sm leading-6 text-muted">
          <Link
            href="/auth"
            className="font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Create an account
          </Link>{" "}
          to join the discussion.
        </p>
      )}
    </section>
  );
}
