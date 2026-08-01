import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Amount } from '@/components/ui/amount';
import { Tabs } from '@/components/ui/tabs';
import { CampaignCreatorPanel } from '@/components/campaigns/campaign-creator';
import { CampaignFaq } from '@/components/campaigns/campaign-faq';
import { CampaignFundingPanel } from '@/components/campaigns/campaign-funding-panel';
import { CampaignHeader } from '@/components/campaigns/campaign-header';
import { CampaignLane } from '@/components/campaigns/campaign-lane';
import { CampaignMedia } from '@/components/campaigns/campaign-media';
import { CampaignPlan } from '@/components/campaigns/campaign-plan';
import { CampaignRewards } from '@/components/campaigns/campaign-rewards';
import { CampaignTimeline } from '@/components/campaigns/campaign-timeline';
import { MilestoneDetail } from '@/components/campaigns/milestone-detail';
import { MilestoneTracker } from '@/components/campaigns/milestone-tracker';
import { ObjectionWindow } from '@/components/campaigns/objection-window';
import { ReceiptTimeline } from '@/components/campaigns/receipt-timeline';
import { RefundNotice } from '@/components/campaigns/refund-notice';
import { TrustStrip } from '@/components/ideas/trust-strip';
import {
  getCampaign,
  getCreatorCampaigns,
  listCampaigns,
} from '@/lib/campaigns/campaigns-api';
import {
  failedMilestone,
  heldTotal,
  openObjection,
  refundedTotal,
  releasedTotal,
} from '@/lib/campaigns/campaign-stats';

const TABS = ['stages', 'plan', 'rewards', 'creator', 'timeline', 'receipts', 'faq'] as const;
type Tab = (typeof TABS)[number];

const TAB_LABEL: Record<Tab, string> = {
  stages: 'Delivery stages',
  plan: 'The plan',
  rewards: 'Rewards',
  creator: 'Creator',
  timeline: 'Timeline',
  receipts: 'Receipts',
  faq: 'How this works',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign) return { title: 'Campaign not found' };
  return { title: campaign.title, description: campaign.summary };
}

/**
 * Campaign detail.
 *
 * Above the fold is the reference's contract (teardown §4): media left, funding panel right, the
 * trust strip under both, then tabs for depth. Nothing scrolls before a reader has seen the number,
 * the deadline and the primary action.
 *
 * **Stages is the default tab, not the story.** The reference leads with the story because the story
 * is what it sells. Ours sells the delivery mechanic, so the tracker is the first thing after the
 * header.
 *
 * Server Component throughout. Tabs are routes via a search param, so a tab is shareable and
 * server-rendered; the only client island on the page is the video, which exists to keep a byte of
 * it from loading until someone asks (conventions §3.1).
 *
 * Everything reads from fixtures: the API has no campaign endpoints at all
 * (campaign-data-contract.md §1).
 */
export default async function CampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);

  const campaign = await getCampaign(id);
  if (!campaign) notFound();

  const rawTab = Array.isArray(query.tab) ? query.tab[0] : query.tab;
  const tab: Tab = (TABS as readonly string[]).includes(rawTab ?? '') ? (rawTab as Tab) : 'stages';

  const [creatorCampaigns, similar] = await Promise.all([
    getCreatorCampaigns(campaign.creator.id, campaign.id),
    listCampaigns({ category: campaign.category, sort: 'closing-soon' }),
  ]);

  const underReview = openObjection(campaign);
  const failed = failedMilestone(campaign);
  const href = (t: Tab) =>
    t === 'stages' ? `/campaigns/${campaign.slug}` : `/campaigns/${campaign.slug}?tab=${t}`;

  return (
    <div className="space-y-8 overflow-hidden">
      <CampaignHeader campaign={campaign} />

      {/* Band 2: media left, funding panel right. On a phone the panel comes first — the numbers and
          the rule that protects a reader belong above a long pitch, not below it. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="min-w-0 space-y-6">
          <CampaignMedia campaign={campaign} />

          <div className="lg:hidden">
            <CampaignFundingPanel campaign={campaign} />
          </div>

          {/* The failure notice outranks everything below it: a backer arriving at a failed campaign
              needs the refund answer before anything else on the page. */}
          {failed && <RefundNotice campaign={campaign} />}

          <TrustStrip />

          <Tabs
            items={TABS.map((t) => ({
              href: href(t),
              label: TAB_LABEL[t],
              count:
                t === 'stages'
                  ? campaign.milestones.length
                  : t === 'rewards'
                    ? campaign.rewards.length
                    : t === 'receipts'
                      ? campaign.receipts.length
                      : undefined,
              active: tab === t,
            }))}
          />

          {tab === 'stages' && (
            <div className="space-y-8">
              <MilestoneTracker campaign={campaign} />
              {underReview && <ObjectionWindow campaign={campaign} milestone={underReview} />}
              <MilestoneDetail campaign={campaign} />
            </div>
          )}

          {tab === 'plan' && <CampaignPlan campaign={campaign} />}

          {tab === 'rewards' && <CampaignRewards campaign={campaign} />}

          {tab === 'creator' && (
            <CampaignCreatorPanel
              creator={campaign.creator}
              history={creatorCampaigns.history}
              record={creatorCampaigns.record}
            />
          )}

          {tab === 'timeline' && <CampaignTimeline campaign={campaign} />}

          {tab === 'receipts' && (
            <div className="max-w-2xl space-y-5">
              <dl className="grid grid-cols-3 gap-4 rounded-xl border border-border bg-surface p-5">
                <Figure label="Released so far" value={releasedTotal(campaign)} />
                <Figure label="Still held" value={heldTotal(campaign)} />
                <Figure label="Returned to backers" value={refundedTotal(campaign)} />
              </dl>
              <ReceiptTimeline receipts={campaign.receipts} />
            </div>
          )}

          {tab === 'faq' && <CampaignFaq ideaSlug={campaign.ideaSlug} />}
        </div>

        <div className="hidden lg:sticky lg:top-24 lg:block">
          <CampaignFundingPanel campaign={campaign} />
        </div>
      </div>

      <CampaignLane
        title="Other campaigns like this one"
        items={similar.filter((c) => c.id !== campaign.id).slice(0, 3)}
        moreHref="/campaigns"
        moreLabel="All campaigns"
      />
    </div>
  );
}

function Figure({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0">
      <dd className="font-display text-lg font-bold tracking-tight text-ink">
        <Amount value={value} currency="USD" />
      </dd>
      <dt className="text-xs text-ink-muted">{label}</dt>
    </div>
  );
}
