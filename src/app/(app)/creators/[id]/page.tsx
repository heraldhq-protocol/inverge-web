import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';
import { VerifiedBadge } from '@/components/ui/verified-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { IdeaCard } from '@/components/ideas/idea-card';
import { formatDate, humaniseEnum, pluralise } from '@/lib/format';
import { getCreatorProfile } from '@/lib/ideas/ideas-api';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function CreatorProfilePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { tab = 'published' } = await searchParams;

  const data = await getCreatorProfile(id);
  if (!data || !data.creator) {
    notFound();
  }

  const { creator, ideasPublished, ideasSupported } = data;
  const handle = creator.username ? `@${creator.username}` : `@${creator.id}`;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      {/* Hero Profile Banner */}
      <Card className="overflow-hidden border border-border bg-paper p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4 sm:gap-6">
            <Avatar
              name={creator.displayName || creator.username}
              src={creator.avatarUrl}
              size={64}
              className="ring-4 ring-background shadow-md"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  {creator.displayName || creator.username}
                </h1>
                {creator.identityVerified ? (
                  <VerifiedBadge tier={creator.identityVerified ? 'TIER_1_ID' : undefined} />
                ) : (
                  <Pill>Not yet verified</Pill>
                )}
                <Pill tone="accent">{humaniseEnum(creator.tier)} tier</Pill>
              </div>

              <p className="text-sm font-medium text-accent-600">{handle}</p>

              {creator.bio && (
                <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-ink-muted">
                  {creator.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-3">
          <div className="space-y-1">
            <dd className="font-display text-2xl font-bold tracking-tight text-ink">
              {ideasPublished.length}
            </dd>
            <dt className="text-xs font-medium text-ink-muted">Ideas published</dt>
          </div>

          <div className="space-y-1">
            <dd className="font-display text-2xl font-bold tracking-tight text-ink">
              {ideasSupported.length}
            </dd>
            <dt className="text-xs font-medium text-ink-muted">Ideas backed & supported</dt>
          </div>

          <div className="space-y-1">
            <dd className="font-display text-2xl font-bold tracking-tight text-ink">
              {formatDate(creator.memberSince).replace(/^\d+\s/, '')}
            </dd>
            <dt className="text-xs font-medium text-ink-muted">Member on Inverge</dt>
          </div>
        </dl>
      </Card>

      {/* Tabs Section */}
      <div className="space-y-6">
        <nav className="flex border-b border-border" aria-label="Creator activity tabs">
          <Link
            href={`/creators/${encodeURIComponent(id)}?tab=published`}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === 'published'
                ? 'border-accent-500 font-semibold text-accent-600'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            Published Projects ({ideasPublished.length})
          </Link>
          <Link
            href={`/creators/${encodeURIComponent(id)}?tab=supported`}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === 'supported'
                ? 'border-accent-500 font-semibold text-accent-600'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            Supported & Backed ({ideasSupported.length})
          </Link>
        </nav>

        {/* Tab Content */}
        {tab === 'published' && (
          <div>
            {ideasPublished.length === 0 ? (
              <EmptyState
                title="No published projects yet."
                body="This creator has not published any validated ideas to the community yet."
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {ideasPublished.map((idea) => (
                  <IdeaCard key={idea.id} item={idea} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'supported' && (
          <div>
            {ideasSupported.length === 0 ? (
              <EmptyState
                title="No backed projects yet."
                body="This creator has not supported or pre-pledged any community ideas yet."
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {ideasSupported.map((idea) => (
                  <IdeaCard key={idea.id} item={idea} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
