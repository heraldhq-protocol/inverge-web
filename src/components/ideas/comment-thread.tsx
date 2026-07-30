'use client';

import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Pill } from '@/components/ui/pill';
import { daysSince, pluralise } from '@/lib/format';
import type { IdeaComment } from '@/lib/ideas/types';

/**
 * The discussion thread.
 *
 * Nesting is **one level only**, matching the API's shape: the endpoint returns a flat list carrying
 * `parentId` and `likeCount`, ordered highlighted → most-liked → newest, capped at 300, for the client
 * to nest (teardown §5.6). Deeper nesting on a phone is unreadable anyway.
 *
 * Removed comments keep their row as a muted tombstone rather than vanishing: not deleting the record,
 * but not letting it speak either, is the honest answer for a moderated thread. No reason and no author
 * is shown, because our moderation holds for review rather than publishing a verdict.
 *
 * Likes are local state — the write path is `POST/DELETE /ideas/:id/comments/:commentId/like`, which
 * exists on the API and is not wired in this fixture build.
 */
export function CommentThread({ comments }: { comments: IdeaComment[] }) {
  const [likes, setLikes] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(comments.filter((c) => c.likedByMe).map((c) => [c.id, true]))
  );

  if (comments.length === 0) {
    return (
      <EmptyState
        title="No questions yet."
        body="Ask the creator anything about this idea. Specific questions get better answers than encouragement."
      />
    );
  }

  const roots = comments.filter((c) => !c.parentId);
  const repliesOf = (id: string) => comments.filter((c) => c.parentId === id);

  const toggle = (id: string) => setLikes((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-muted tabular-nums">
        {comments.length} {pluralise(comments.length, 'comment')}
      </p>

      <ul className="space-y-4">
        {roots.map((comment) => (
          <li key={comment.id}>
            <Card className={comment.highlighted ? 'border-accent-500/35 bg-accent-50 p-4' : 'p-4'}>
              {comment.highlighted && (
                <div className="mb-2">
                  <Pill tone="accent">Highlighted by the creator</Pill>
                </div>
              )}
              <Comment comment={comment} liked={!!likes[comment.id]} onLike={() => toggle(comment.id)} />

              {repliesOf(comment.id).length > 0 && (
                <ul className="mt-4 space-y-4 border-l-2 border-border pl-4">
                  {repliesOf(comment.id).map((reply) => (
                    <li key={reply.id}>
                      <Comment
                        comment={reply}
                        liked={!!likes[reply.id]}
                        onLike={() => toggle(reply.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Comment({
  comment,
  liked,
  onLike,
}: {
  comment: IdeaComment;
  liked: boolean;
  onLike: () => void;
}) {
  if (comment.removed) {
    return (
      <p className="text-sm italic text-ink-muted">This comment was removed.</p>
    );
  }

  const days = daysSince(comment.createdAt);
  const count = comment.likeCount + (liked && !comment.likedByMe ? 1 : 0);

  return (
    <article>
      <div className="flex items-center gap-2">
        <Avatar name={comment.author.displayName} src={comment.author.avatarUrl} size={32} />
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
            <span className="truncate">{comment.author.displayName}</span>
            {comment.author.isCreator && <Pill tone="accent">Creator</Pill>}
          </p>
          <p className="text-xs text-ink-muted">
            {days === 0 ? 'Today' : `${days} ${pluralise(days, 'day')} ago`}
          </p>
        </div>
      </div>

      <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-ink">{comment.body}</p>

      <button
        type="button"
        onClick={onLike}
        aria-pressed={liked}
        className="mt-2.5 inline-flex min-h-11 items-center gap-1.5 rounded text-xs font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        <span aria-hidden="true">{liked ? '♥' : '♡'}</span>
        <span className="tabular-nums">{count}</span>
        <span className="sr-only">{liked ? 'Remove your like' : 'Like this comment'}</span>
      </button>
    </article>
  );
}
