import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CampaignCard } from '@/components/campaigns/campaign-card';
import { CampaignFilters } from '@/components/campaigns/campaign-filters';
import { CampaignLane } from '@/components/campaigns/campaign-lane';
import { EscrowSummary } from '@/components/campaigns/escrow-summary';
import { UnderReviewLane } from '@/components/campaigns/under-review-lane';
import { TrustStrip } from '@/components/ideas/trust-strip';
import {
  getEscrowSummary,
  listCampaignRegions,
  listCampaigns,
  listClosingSoon,
  listDelivered,
  listUnderReview,
} from '@/lib/campaigns/campaigns-api';
import { SEGMENT_LABEL } from '@/lib/campaigns/campaign-stats';
import type { CampaignSegment, CampaignSort } from '@/lib/campaigns/types';
import { CATEGORIES, type IdeaCategory } from '@/lib/feed/types';

export const metadata: Metadata = {
  title: 'Campaigns',
  description:
    'Funded projects releasing money in stages, with every stage reviewed by backers before it pays out.',
};

const SEGMENTS: CampaignSegment[] = ['all', 'raising', 'delivering', 'delivered', 'not-delivered'];
const SORTS: CampaignSort[] = ['closing-soon', 'newest', 'most-backed', 'most-delivered'];

const one = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

/**
 * The campaign catalogue.
 *
 * The reference's discovery surface merchandises: featured, recommended, near you, ending soon
 * (teardown §2). Ours does something else, because **a reader who arrives here is auditing, not
 * shopping.** The claim this product makes is that money is released in stages and backers can stop
 * a stage, so the page leads with the evidence for that claim — the escrow totals, then the stages
 * being reviewed right now — and only then offers something to browse.
 *
 * Every filter lives in the URL, so a lane is linkable and the server renders it. Failed campaigns
 * are in every unfiltered view: a visible failure is the proof the guarantee works
 * (campaign-brief.md §9 rule 1).
 */
export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;

  const rawSegment = one(query.segment);
  const segment: CampaignSegment = SEGMENTS.includes(rawSegment as CampaignSegment)
    ? (rawSegment as CampaignSegment)
    : 'all';

  const rawCategory = one(query.category);
  const category: IdeaCategory | null =
    CATEGORIES.some((c) => c.value === rawCategory) ? (rawCategory as IdeaCategory) : null;

  const rawSort = one(query.sort);
  const sort: CampaignSort = SORTS.includes(rawSort as CampaignSort)
    ? (rawSort as CampaignSort)
    : 'closing-soon';

  const regions = await listCampaignRegions();
  const rawRegion = one(query.region);
  const region = rawRegion && regions.includes(rawRegion) ? rawRegion : null;

  const [campaigns, summary, underReview, closingSoon, delivered] = await Promise.all([
    listCampaigns({ segment, category, region, sort }),
    getEscrowSummary(),
    listUnderReview(),
    listClosingSoon(),
    listDelivered(),
  ]);

  const isFiltered = segment !== 'all' || category !== null || region !== null;
  // The lanes repeat what the grid already shows once a filter is on, and a lane that contradicts
  // the filter above it is worse than no lane.
  const showLanes = !isFiltered;

  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Campaigns
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Ideas that cleared validation and went on to raise. Money is released in stages, and backers
          review each stage before it pays out.
        </p>
      </header>

      <EscrowSummary summary={summary} />

      <UnderReviewLane items={underReview} />

      <div className="space-y-5">
        <CampaignFilters
          state={{ segment, category, region, sort }}
          regions={regions}
          resultCount={campaigns.length}
        />

        {campaigns.length === 0 ? (
          <EmptyState
            title="No campaigns match those filters yet."
            body="Ideas being validated now are the ones that will raise here next."
            actions={
              <>
                <Button variant="primary" size="md" href="/campaigns">
                  Clear filters
                </Button>
                <Button variant="outline" size="md" href="/feed">
                  Browse ideas
                </Button>
              </>
            }
          />
        ) : (
          <>
            <h2 className="sr-only">
              {isFiltered ? SEGMENT_LABEL[segment] : 'All campaigns'}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <li key={campaign.id} className="h-full">
                  <CampaignCard campaign={campaign} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {showLanes && (
        <>
          <CampaignLane
            title="Closing soon"
            blurb="These campaigns reach their deadline within the week. Nothing is charged unless they reach their goal."
            items={closingSoon}
            moreHref="/campaigns?segment=raising"
            moreLabel="All raising now"
          />

          <CampaignLane
            title="Delivered in full"
            blurb="Every stage claimed, reviewed and released. Each one has the receipts to show for it."
            items={delivered}
            moreHref="/campaigns?segment=delivered"
            moreLabel="All delivered"
          />
        </>
      )}

      <TrustStrip />

      {/* Verification belongs on the path to receiving money, and nowhere near publishing an idea
          (app-mockup-kit §C). This is the only place on these screens that mentions it. */}
      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="max-w-[60ch]">
          <h2 className="text-sm font-semibold text-ink">Thinking of launching one?</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            Validate the idea first, and it carries its supporters over as a waitlist. Creators
            receive money, so we verify who you are before a campaign can launch, never to publish an
            idea.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="md" href="/campaigns/new">
            Plan a campaign
          </Button>
          <Button variant="outline" size="md" href="/ideas/new">
            Start an idea
          </Button>
        </div>
      </Card>
    </div>
  );
}
