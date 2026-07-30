import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { CampaignHeader } from '@/components/campaigns/campaign-header';
import { MilestoneTracker } from '@/components/campaigns/milestone-tracker';
import { ObjectionWindow } from '@/components/campaigns/objection-window';
import { ReceiptTimeline } from '@/components/campaigns/receipt-timeline';
import { RefundNotice } from '@/components/campaigns/refund-notice';
import { TrustStrip } from '@/components/ideas/trust-strip';
import { getCampaign } from '@/lib/campaigns/campaigns-api';
import { milestoneState } from '@/lib/campaigns/milestone-state';

const TABS = ['stages', 'story', 'receipts'] as const;
type Tab = (typeof TABS)[number];

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
 * **Stages is the default tab, not the story.** The reference puts the story first and rewards second,
 * because that is what it sells. Ours sells the delivery mechanic, so the tracker is the first thing on the
 * page after the header (teardown §5.2).
 *
 * Everything here reads from fixtures: the API has no campaign endpoints at all
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

  const underReview = campaign.milestones.find((m) => milestoneState(m) === 'UNDER_REVIEW');
  const hasFailure = campaign.milestones.some((m) => milestoneState(m) === 'NOT_DELIVERED');
  const href = (t: Tab) =>
    t === 'stages' ? `/campaigns/${campaign.slug}` : `/campaigns/${campaign.slug}?tab=${t}`;

  return (
    <div className="space-y-8">
      <CampaignHeader campaign={campaign} />

      {/* The failure notice outranks everything: a backer arriving at a failed campaign needs the refund
          answer before anything else on the page. */}
      {hasFailure && <RefundNotice campaign={campaign} />}

      <TrustStrip />

      <Tabs
        items={[
          { href: href('stages'), label: 'Delivery stages', count: campaign.milestones.length, active: tab === 'stages' },
          { href: href('story'), label: 'The plan', active: tab === 'story' },
          { href: href('receipts'), label: 'Receipts', count: campaign.receipts.length, active: tab === 'receipts' },
        ]}
      />

      {tab === 'stages' && (
        <div className="space-y-8">
          <MilestoneTracker campaign={campaign} />
          {underReview && <ObjectionWindow campaign={campaign} milestone={underReview} />}
        </div>
      )}

      {tab === 'story' && (
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
          <div className="max-w-[68ch] space-y-8">
            <Prose heading="The problem">{campaign.story.problem}</Prose>
            <Prose heading="The solution">{campaign.story.solution}</Prose>
            <Prose heading="How it gets built">{campaign.story.roadmap}</Prose>

            {/* Mandated on every campaign, same as the reference, and for the same reason: a creator who
                can name how this fails is a creator who has thought about it (playbook §2). */}
            <Prose heading="Risks and challenges">{campaign.risks}</Prose>

            <Prose heading="What happens if a stage is not delivered">
              Backers get a week to review what was delivered at each stage. If enough of them object, that
              stage is not released, the money still held is returned in proportion to what each backer put
              in, and stages already delivered are not clawed back.
            </Prose>
          </div>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Money released early</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {campaign.workingCapitalPct}% of the raise is released as soon as funding closes, so the creator
              can start work rather than fund the first stage themselves. That portion is disclosed here
              before anyone backs the campaign, and it is not part of what gets returned if a later stage is
              not delivered.
            </p>
          </Card>
        </div>
      )}

      {tab === 'receipts' && (
        <div className="max-w-2xl">
          <ReceiptTimeline receipts={campaign.receipts} />
        </div>
      )}
    </div>
  );
}

function Prose({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="scroll-mt-24">
      <h2 className="font-display text-xl font-bold tracking-tight text-ink">{heading}</h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{children}</p>
    </section>
  );
}
