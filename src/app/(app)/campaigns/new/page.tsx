import type { Metadata } from 'next';
import { CampaignBuilder } from '@/components/campaigns/new/campaign-builder';
import { listMyIdeas } from '@/lib/campaigns/my-ideas';

export const metadata: Metadata = {
  title: 'Plan a campaign',
  description:
    'Turn a validated idea into a campaign: a target, a deadline, and the stages the money is released against.',
};

/**
 * The campaign builder.
 *
 * Server shell, client form. The idea list is fetched here so the first paint has something in it;
 * everything after that is local state, because a half-filled campaign is not a shareable URL
 * (`campaign-builder.tsx`).
 *
 * Nothing is written anywhere. When the contract lands, the single call goes at the end of step
 * three — `POST /ideas/:id/convert`, the only campaign write path the API has.
 */
export default async function NewCampaignPage() {
  const ideas = await listMyIdeas();

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Turn this idea into a campaign
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          You are setting the terms backers will hold you to: what you are raising, by when, and what
          each stage has to deliver before its share of the money is released.
        </p>
      </header>

      <CampaignBuilder ideas={ideas} />
    </div>
  );
}
