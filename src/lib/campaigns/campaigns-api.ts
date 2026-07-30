import { fixtureCampaigns } from '@/lib/fixtures/campaigns';
import type { CampaignDetail, CampaignListItem } from './types';

/**
 * Campaign reads. Fixtures only, because the API has no campaign endpoints at all: the models are
 * inert in Prisma and `POST /ideas/:id/convert` is the single live write path
 * (campaign-data-contract.md §1).
 *
 * Flip `USE_FIXTURES` when items 6 and 7 of the API gap backlog land. Until then this file is the
 * only place that knows campaigns are mocked.
 */
const USE_FIXTURES = true;

export async function listCampaigns(): Promise<CampaignListItem[]> {
  if (USE_FIXTURES) {
    // Active first, then completed, then failed: a reader looking for something to back should not
    // land on a refund. Failed campaigns stay listed — hiding them would undercut the guarantee.
    const order: Record<string, number> = { ACTIVE: 0, FUNDED: 1, COMPLETED: 2, FAILED: 3 };
    return fixtureCampaigns()
      .slice()
      .sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
  }
  throw new Error('Live campaign list not wired: see docs/campaign-data-contract.md §4 item 6');
}

export async function getCampaign(idOrSlug: string): Promise<CampaignDetail | null> {
  if (USE_FIXTURES) {
    return fixtureCampaigns().find((c) => c.id === idOrSlug || c.slug === idOrSlug) ?? null;
  }
  throw new Error('Live campaign read not wired: see docs/campaign-data-contract.md §4 item 6');
}
