'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getSessionToken } from '@/lib/api/client';

const btn =
  'rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-40';
const field =
  'rounded-lg border border-foreground/15 bg-transparent px-3 py-1.5 text-sm';

export function IdeaActions({ ideaId }: { ideaId: string }) {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pledge, setPledge] = useState(50);
  const [rating, setRating] = useState(5);

  useEffect(() => setSignedIn(Boolean(getSessionToken())), []);

  async function run(key: string, call: () => Promise<{ error?: unknown }>) {
    setBusy(key);
    setMsg(null);
    const { error } = await call();
    setBusy(null);
    if (error) return setMsg('Something went wrong — are you still signed in?');
    setMsg('Saved.');
    router.refresh(); // re-render the server component with fresh metrics
  }

  if (!signedIn) {
    return (
      <div className="rounded-xl border border-foreground/10 p-4 text-sm text-foreground/60">
        Sign in to support, pre-pledge, or leave feedback.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-foreground/10 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          disabled={Boolean(busy)}
          onClick={() =>
            run('support', () =>
              api.POST('/ideas/{id}/support', { params: { path: { id: ideaId } } }),
            )
          }
          className={btn}
        >
          Support
        </button>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={pledge}
            onChange={(e) => setPledge(Number(e.target.value))}
            className={`${field} w-24`}
            aria-label="Pre-pledge amount"
          />
          <button
            disabled={Boolean(busy)}
            onClick={() =>
              run('pledge', () =>
                api.POST('/ideas/{id}/pre-pledge', {
                  params: { path: { id: ideaId } },
                  body: { amount: pledge },
                }),
              )
            }
            className={btn}
          >
            Pre-pledge
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className={field}
            aria-label="Feedback rating"
          >
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                {r}★
              </option>
            ))}
          </select>
          <button
            disabled={Boolean(busy)}
            onClick={() =>
              run('feedback', () =>
                api.POST('/ideas/{id}/feedback', {
                  params: { path: { id: ideaId } },
                  body: { rating },
                }),
              )
            }
            className={btn}
          >
            Leave feedback
          </button>
        </div>
      </div>
      {msg && <p className="text-sm text-foreground/60">{msg}</p>}
      <p className="text-xs text-foreground/40">
        Pre-pledges move no funds — they signal intent (FR-202).
      </p>
    </div>
  );
}
