import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Tabs } from '@/components/ui/tabs';
import { CommentThread } from '@/components/ideas/comment-thread';
import { CreatorPanel } from '@/components/ideas/creator-panel';
import { FeedLane } from '@/components/ideas/feed-sections';
import { IdeaActionPanel } from '@/components/ideas/idea-action-panel';
import { IdeaHeader } from '@/components/ideas/idea-header';
import { IdeaStory, storySections } from '@/components/ideas/idea-story';
import { IdeaStoryToc, hasToc } from '@/components/ideas/idea-story-toc';
import { SurveyForm } from '@/components/ideas/survey-form';
import { TrustStrip } from '@/components/ideas/trust-strip';
import { getComments, getIdea, getSurvey } from '@/lib/ideas/ideas-api';
import { getFeed } from '@/lib/feed/feed-api';

const TABS = ['pitch', 'feedback', 'discussion', 'creator'] as const;
type Tab = (typeof TABS)[number];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const idea = await getIdea(id);
  if (!idea) return { title: 'Idea not found' };
  return { title: idea.title, description: idea.problem };
}

/**
 * Idea detail: two columns, sticky action rail on the right, tabs for depth (teardown §4, §5).
 *
 * Server Component. Tabs are **routes via a search param**, not client state, so a tab is shareable and
 * server-rendered; the only client islands are the action controls and the thread's like buttons
 * (conventions §3.1).
 *
 * On mobile the rail moves above the story: a phone reader should see the numbers and the primary action
 * before scrolling into a long pitch.
 */
export default async function IdeaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);

  const idea = await getIdea(id);
  if (!idea) notFound();

  const rawTab = Array.isArray(query.tab) ? query.tab[0] : query.tab;
  const tab: Tab = (TABS as readonly string[]).includes(rawTab ?? '') ? (rawTab as Tab) : 'pitch';

  const [survey, comments, similar] = await Promise.all([
    getSurvey(idea.id),
    getComments(idea.id),
    getFeed({ category: idea.category, excludeIds: [idea.id], take: 6 }),
  ]);

  const sections = storySections(idea);
  const href = (t: Tab) => (t === 'pitch' ? `/ideas/${idea.slug}` : `/ideas/${idea.slug}?tab=${t}`);

  return (
    <div className="space-y-8 overflow-hidden">
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="min-w-0 space-y-8">
          <IdeaHeader idea={idea} />

          {/* Mobile position for the rail: numbers and the action before the story. */}
          <div className="lg:hidden">
            <IdeaActionPanel idea={idea} />
          </div>

          <TrustStrip />

          <Tabs
            items={[
              { href: href('pitch'), label: 'Pitch', active: tab === 'pitch' },
              {
                href: href('feedback'),
                label: 'What supporters said',
                count: idea.feedbackCount,
                active: tab === 'feedback',
              },
              {
                href: href('discussion'),
                label: 'Discussion',
                count: idea.commentCount,
                active: tab === 'discussion',
              },
              { href: href('creator'), label: 'Creator', active: tab === 'creator' },
            ]}
          />

          {tab === 'pitch' && (
            // The contents column is only reserved when there is a contents list to put in it. A null
            // TOC does not collapse a fixed grid column — it hands the column to the story and squeezes
            // the pitch into a 176px ribbon.
            <div className={cn('grid min-w-0 gap-8', hasToc(sections) && 'lg:grid-cols-[11rem_minmax(0,1fr)]')}>
              <IdeaStoryToc sections={sections} />
              <div className="min-w-0">
                <IdeaStory idea={idea} />
              </div>
            </div>
          )}

          {tab === 'feedback' && (
            <SurveyForm ideaId={idea.id} questions={survey.questions} aggregates={survey.aggregates} />
          )}

          {tab === 'discussion' && <CommentThread ideaId={idea.id} comments={comments} />}

          {tab === 'creator' && <CreatorPanel creator={idea.creator} />}
        </div>

        <div className="hidden lg:sticky lg:top-24 lg:block">
          <IdeaActionPanel idea={idea} />
        </div>
      </div>

      {similar.items.length > 0 && (
        <FeedLane
          title="Similar ideas being validated"
          items={similar.items}
          moreHref="/feed"
        />
      )}
    </div>
  );
}
