'use client';

import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Pill } from '@/components/ui/pill';
import { daysSince, pluralise } from '@/lib/format';
import { likeComment, unlikeComment, postComment } from '@/lib/ideas/ideas-api';
import type { IdeaComment } from '@/lib/ideas/types';

export function CommentThread({ ideaId, comments: initialComments }: { ideaId: string; comments: IdeaComment[] }) {
  const [comments, setComments] = useState<IdeaComment[]>(initialComments);
  const [likes, setLikes] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialComments.filter((c) => c.likedByMe).map((c) => [c.id, true]))
  );
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const roots = comments.filter((c) => !c.parentId);
  const repliesOf = (id: string) => comments.filter((c) => c.parentId === id);

  const toggleLike = async (commentId: string) => {
    const isLiked = !!likes[commentId];
    setLikes((prev) => ({ ...prev, [commentId]: !isLiked }));
    try {
      if (isLiked) {
        await unlikeComment(ideaId, commentId);
      } else {
        await likeComment(ideaId, commentId);
      }
    } catch (err) {
      console.warn('[CommentThread] Failed to toggle comment like:', err);
      // Revert optimistic update
      setLikes((prev) => ({ ...prev, [commentId]: isLiked }));
    }
  };

  const handlePost = async (parentId?: string | null) => {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const created = await postComment(ideaId, newComment.trim(), parentId);
      setComments((prev) => [created, ...prev]);
      setNewComment('');
      setReplyTo(null);
    } catch (err) {
      console.warn('[CommentThread] Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Comment Input */}
      <div className="rounded-lg border border-border bg-paper p-4">
        <label htmlFor="new-comment" className="block text-xs font-semibold text-ink">
          Ask the creator a question or leave feedback
        </label>
        <textarea
          id="new-comment"
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="What would you like to know about this idea?"
          className="mt-2 w-full rounded-lg border border-border bg-surface p-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        />
        <div className="mt-2.5 flex justify-end">
          <Button
            variant="primary"
            size="md"
            disabled={!newComment.trim() || submitting}
            onClick={() => handlePost(null)}
          >
            {submitting ? 'Posting...' : 'Post Question'}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-muted tabular-nums">
          {comments.length} {pluralise(comments.length, 'comment')}
        </p>
      </div>

      {comments.length === 0 ? (
        <EmptyState
          title="No questions yet."
          body="Ask the creator anything about this idea. Specific questions get better answers than encouragement."
        />
      ) : (
        <ul className="space-y-4">
          {roots.map((comment) => (
            <li key={comment.id}>
              <Card className={comment.highlighted ? 'border-accent-500/35 bg-accent-50 p-4' : 'p-4'}>
                {comment.highlighted && (
                  <div className="mb-2">
                    <Pill tone="accent">Highlighted by the creator</Pill>
                  </div>
                )}
                <Comment
                  comment={comment}
                  liked={!!likes[comment.id]}
                  onLike={() => toggleLike(comment.id)}
                  onReply={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                />

                {replyTo === comment.id && (
                  <div className="mt-3 rounded-lg border border-border bg-surface p-3">
                    <textarea
                      rows={2}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a reply..."
                      className="w-full rounded border border-border bg-paper p-2 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!newComment.trim() || submitting}
                        onClick={() => handlePost(comment.id)}
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                )}

                {repliesOf(comment.id).length > 0 && (
                  <ul className="mt-4 space-y-4 border-l-2 border-border pl-4">
                    {repliesOf(comment.id).map((reply) => (
                      <li key={reply.id}>
                        <Comment
                          comment={reply}
                          liked={!!likes[reply.id]}
                          onLike={() => toggleLike(reply.id)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Comment({
  comment,
  liked,
  onLike,
  onReply,
}: {
  comment: IdeaComment;
  liked: boolean;
  onLike: () => void;
  onReply?: () => void;
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
            <span className="truncate">{comment.author.displayName || 'Anonymous'}</span>
            {comment.author.isCreator && <Pill tone="accent">Creator</Pill>}
          </p>
          <p className="text-xs text-ink-muted">
            {days === 0 ? 'Today' : `${days} ${pluralise(days, 'day')} ago`}
          </p>
        </div>
      </div>

      <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-ink">{comment.body}</p>

      <div className="mt-2.5 flex items-center gap-4">
        <button
          type="button"
          onClick={onLike}
          aria-pressed={liked}
          className="inline-flex min-h-11 items-center gap-1.5 rounded text-xs font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <span aria-hidden="true">{liked ? '♥' : '♡'}</span>
          <span className="tabular-nums">{count}</span>
          <span className="sr-only">{liked ? 'Remove your like' : 'Like this comment'}</span>
        </button>

        {onReply && (
          <button
            type="button"
            onClick={onReply}
            className="inline-flex min-h-11 items-center text-xs font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            Reply
          </button>
        )}
      </div>
    </article>
  );
}
