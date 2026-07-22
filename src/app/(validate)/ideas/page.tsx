import Link from 'next/link';
import { api } from '@/lib/api/client';
import type { IdeaListItem } from '@/lib/api/types';
import { Amount, Count } from '@/components/ui/amount';

// Always fresh from the API (avoids build-time prerender fetching a possibly-down API).
export const dynamic = 'force-dynamic';

export default async function IdeasPage() {
  const { data, error } = await api.GET('/ideas', {});
  const ideas = (data as IdeaListItem[] | undefined) ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Ideas</h1>
        <Link
          href="/ideas/new"
          className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background hover:opacity-90"
        >
          Publish an idea
        </Link>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-500">
          Couldn’t reach the API. Is <code>inverge-api</code> running?
        </p>
      )}

      {ideas.length === 0 ? (
        <p className="text-foreground/60">No published ideas yet.</p>
      ) : (
        <ul className="divide-y divide-foreground/10">
          {ideas.map((idea) => (
            <li key={idea.id} className="py-4">
              <Link
                href={`/ideas/${idea.id}`}
                className="group flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium group-hover:underline">{idea.title}</span>
                    {idea.promoted && (
                      <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs text-foreground/60">
                        Promoted
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-foreground/60">
                    Ask <Amount value={idea.askAmount} />
                  </p>
                </div>
                <div className="flex shrink-0 gap-6 text-sm text-foreground/70">
                  <span>
                    <Count value={idea.supporterCount} /> supporters
                  </span>
                  <span>
                    <Amount value={idea.prePledgeTotal} /> pledged
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
