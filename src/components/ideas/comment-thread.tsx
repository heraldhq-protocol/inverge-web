'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Pill } from '@/components/ui/pill';
import { daysSince, pluralise } from '@/lib/format';
import { likeComment, unlikeComment, postComment, getComments } from '@/lib/ideas/ideas-api';
import type { IdeaComment } from '@/lib/ideas/types';

export function CommentThread({ ideaId, comments: initialComments }: { ideaId: string; comments: IdeaComment[] }) {
  const router = useRouter();
  const [comments, setComments] = useState<IdeaComment[]>(initialComments);
  const [likes, setLikes] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialComments.filter((c) => c.likedByMe).map((c) => [c.id, true]))
  );
  const [mainComment, setMainComment] = useState('');
  const [replyComment, setReplyComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Client-side re-fetch to ensure `likedByMe` status resolves with client localStorage session token
  useEffect(() => {
    let active = true;
    getComments(ideaId)
      .then((freshComments) => {
        if (!active) return;
        if (Array.isArray(freshComments) && freshComments.length > 0) {
          setComments(freshComments);
          setLikes((prev) => {
            const next = { ...prev };
            for (const c of freshComments) {
              if (c.likedByMe !== undefined) {
                next[c.id] = Boolean(c.likedByMe);
              }
            }
            return next;
          });
        }
      })
      .catch((err) => {
        console.warn('[CommentThread] Client fetch comments failed:', err);
      });
    return () => {
      active = false;
    };
  }, [ideaId]);

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
    const text = parentId ? replyComment.trim() : mainComment.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      const created = await postComment(ideaId, text, parentId);
      setComments((prev) => [created, ...prev]);
      if (parentId) {
        setReplyComment('');
        setReplyTo(null);
      } else {
        setMainComment('');
      }
      router.refresh();
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
          value={mainComment}
          onChange={(e) => setMainComment(e.target.value)}
          placeholder="What would you like to know about this idea?"
          className="mt-2 w-full rounded-lg border border-border bg-surface p-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        />
        <div className="mt-2.5 flex justify-end">
          <Button
            variant="primary"
            size="md"
            disabled={!mainComment.trim() || submitting}
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
                  onReply={() => {
                    setReplyTo((current) => {
                      const next = current === comment.id ? null : comment.id;
                      setReplyComment('');
                      return next;
                    });
                  }}
                />

                {replyTo === comment.id && (
                  <div className="mt-3 rounded-lg border border-border bg-surface p-3">
                    <textarea
                      rows={2}
                      value={replyComment}
                      onChange={(e) => setReplyComment(e.target.value)}
                      placeholder="Write a reply..."
                      className="w-full rounded border border-border bg-paper p-2 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setReplyTo(null); setReplyComment(''); }}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!replyComment.trim() || submitting}
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
  const baseCount = comment.likeCount;
  const initialLiked = Boolean(comment.likedByMe);
  let count = baseCount;
  if (liked && !initialLiked) count += 1;
  if (!liked && initialLiked) count -= 1;
  if (count < 0) count = 0;

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

      <div className="mt-2.5 flex items-center gap-3">
        <button
          type="button"
          onClick={onLike}
          aria-pressed={liked}
          className={`group inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
            liked
              ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100'
              : 'text-ink-muted hover:bg-surface hover:text-rose-500'
          }`}
        >
          <HeartIcon filled={liked} className={`h-4 w-4 transition-transform group-active:scale-125 ${liked ? 'text-rose-500 fill-rose-500' : 'text-ink-muted group-hover:text-rose-500'}`} />
          <span className="tabular-nums font-semibold">{count}</span>
          <span className="sr-only">{liked ? 'Remove your like' : 'Like this comment'}</span>
        </button>

        {onReply && (
          <button
            type="button"
            onClick={onReply}
            className="inline-flex min-h-9 items-center rounded-full px-2.5 py-1 text-xs font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            Reply
          </button>
        )}
      </div>
    </article>
  );
}

function HeartIcon({ filled, className }: { filled?: boolean; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? '0' : '2'}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
    </svg>
  );
}
