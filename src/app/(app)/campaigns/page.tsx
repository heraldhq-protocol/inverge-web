import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CampaignCard } from '@/components/campaigns/campaign-card';
import { TrustStrip } from '@/components/ideas/trust-strip';
import { listCampaigns } from '@/lib/campaigns/campaigns-api';

export const metadata: Metadata = {
  title: 'Campaigns',
  description:
    'Funded projects releasing money in stages, with every stage reviewed by backers before it pays out.',
};

/**
 * Campaign list. Active first, then delivered, then failed — a reader looking for something to back should
 * not land on a refund, but failed campaigns stay listed, because a visible failure is the proof the
 * guarantee works.
 */
export default async function CampaignsPage() {
  const campaigns = await listCampaigns();

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Campaigns</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Ideas that cleared validation and went on to raise. Money is released in stages, and backers review
          each stage before it pays out.
        </p>
      </header>

      <TrustStrip />

      {campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet."
          body="Ideas being validated now are the ones that will raise here first."
          actions={
            <Button variant="primary" size="md" href="/feed">
              Browse ideas
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <li key={campaign.id} className="h-full">
              <CampaignCard campaign={campaign} />
            </li>
          ))}
        </ul>
      )}

      {/* Verification belongs on the path to receiving money, and nowhere near publishing an idea
          (app-mockup-kit §C). This is the only place on these screens that mentions it. */}
      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="max-w-[60ch]">
          <h2 className="text-sm font-semibold text-ink">Thinking of launching one?</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            Validate the idea first, and it carries its supporters over as a waitlist. Creators receive money,
            so we verify who you are before a campaign can launch, never to publish an idea.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="md" href="/ideas/new">
            Start an idea
          </Button>
          <Button variant="outline" size="md" href="/verify">
            Verification
          </Button>
        </div>
      </Card>
    </div>
  );
}
