import { fixtureCampaigns } from '@/lib/fixtures/campaigns';
import { parseDecimal } from '@/lib/format';
import { creatorHistory, creatorTrackRecord, escrowSummary, openObjection, segmentOf } from './campaign-stats';
import type {
  CampaignDetail,
  CampaignListItem,
  CampaignQuery,
  CampaignSort,
  CreatorCampaignSummary,
} from './types';

/**
 * Campaign reads. Fixtures only, because the API has no campaign endpoints at all: the models are
 * inert in Prisma and `POST /ideas/:id/convert` is the single live write path
 * (campaign-data-contract.md §1). Nothing in this domain calls the API at all — not even that one
 * live path: the builder is UI, and it makes no request.
 *
 * Flip `USE_FIXTURES` when gap items 6 and 7 land. Filtering and sorting happen here today and move
 * to query params when ask 13 lands; either way no component builds a request or knows a fixture
 * exists (campaign-brief.md §9 rule 8).
 */
import { env } from '@/lib/env';

function all(): CampaignDetail[] {
  // Drafts and campaigns in curation are not public. The API will enforce this; the client module
  // enforcing it too means a fixture can carry one without it leaking into a list (FR-304).
  return fixtureCampaigns().filter((c) => c.status !== 'DRAFT' && c.status !== 'IN_REVIEW');
}

const toListItem = (c: CampaignDetail): CampaignListItem => ({
  objectType: c.objectType,
  id: c.id,
  slug: c.slug,
  title: c.title,
  summary: c.summary,
  category: c.category,
  region: c.region,
  type: c.type,
  status: c.status,
  targetAmount: c.targetAmount,
  totalRaised: c.totalRaised,
  backerCount: c.backerCount,
  deadline: c.deadline,
  workingCapitalPct: c.workingCapitalPct,
  launchedAt: c.launchedAt,
  creator: c.creator,
  milestoneSummary: c.milestoneSummary,
  coverImageUrl: c.coverImageUrl,
  videoUrl: c.videoUrl,
  videoPosterUrl: c.videoPosterUrl,
  topics: c.topics,
});

const SORTERS: Record<CampaignSort, (a: CampaignListItem, b: CampaignListItem) => number> = {
  // Live campaigns first and nearest deadline at the front; anything already closed sorts behind them,
  // most recently closed first. A finished campaign at the top of "closing soon" would be nonsense.
  'closing-soon': (a, b) => {
    const now = Date.now();
    const aLeft = new Date(a.deadline).getTime() - now;
    const bLeft = new Date(b.deadline).getTime() - now;
    if (aLeft >= 0 && bLeft >= 0) return aLeft - bLeft;
    if (aLeft >= 0) return -1;
    if (bLeft >= 0) return 1;
    return bLeft - aLeft;
  },
  newest: (a, b) => new Date(b.launchedAt).getTime() - new Date(a.launchedAt).getTime(),
  'most-backed': (a, b) => b.backerCount - a.backerCount,
  'most-delivered': (a, b) => b.milestoneSummary.released - a.milestoneSummary.released,
};

export async function listCampaigns(query: CampaignQuery = {}): Promise<CampaignListItem[]> {
  const { segment = 'all', category = null, region = null, sort = 'closing-soon' } = query;

  if (!env.useFixtures) {
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (region) params.set('region', region);
      if (sort) params.set('sort', sort);
      const res = await fetch(`${env.apiUrl}/campaigns?${params.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        return data.map((c: any) => ({
          objectType: 'campaign',
          id: c.id,
          slug: c.slug || c.id,
          title: c.title || c.idea?.title || 'Untitled Campaign',
          summary: c.summary || c.idea?.problem || '',
          category: c.idea?.category || 'software',
          region: c.idea?.region || null,
          type: c.type || 'ALL_OR_NOTHING',
          status: c.status,
          targetAmount: String(c.targetAmount || 0),
          totalRaised: String(c.totalRaised || 0),
          backerCount: c.contributions?.length || 0,
          deadline: c.deadline,
          workingCapitalPct: String(c.workingCapitalPct || 20),
          launchedAt: c.launchedAt || c.createdAt,
          creator: c.creator,
          milestoneSummary: c.milestoneSummary || { total: c.milestones?.length || 0, released: 0 },
          coverImageUrl: c.coverImageUrl || c.idea?.coverImageUrl || null,
          videoUrl: c.videoUrl || null,
          videoPosterUrl: c.videoPosterUrl || null,
          topics: [],
        }));
      }
    } catch (err) {
      console.warn('[campaigns-api] Live listCampaigns failed, falling back to fixtures:', err);
    }
  }

  const items = all().map(toListItem);

  const filtered = items.filter((c) => {
    // Failed campaigns are never filtered out of a default view. A visible failure is the proof the
    // refund guarantee works, so only an explicit segment may exclude one (campaign-brief.md §9 rule 1).
    if (segment !== 'all' && segmentOf(c) !== segment) return false;
    if (category && c.category !== category) return false;
    if (region && c.region !== region) return false;
    return true;
  });

  return filtered.sort(SORTERS[sort] ?? SORTERS['closing-soon']);
}

export async function getCampaign(idOrSlug: string): Promise<CampaignDetail | null> {
  if (!env.useFixtures) {
    try {
      const res = await fetch(`${env.apiUrl}/campaigns/${idOrSlug}`, { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn(`[campaigns-api] Live getCampaign failed for ${idOrSlug}, falling back:`, err);
    }
  }
  return all().find((c) => c.id === idOrSlug || c.slug === idOrSlug) ?? null;
}

/**
 * The FR-801 figures. Summed from the campaigns we hold, which is correct and does not survive
 * pagination — ask 12 replaces the arithmetic with the indexer's own totals.
 */
export async function getEscrowSummary() {
  if (!env.useFixtures) {
    try {
      const res = await fetch(`${env.apiUrl}/platform/escrow`, { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[campaigns-api] Live getEscrowSummary failed, falling back:', err);
    }
  }
  return escrowSummary(all());
}

/** Every campaign with an open objection window, for the catalogue's lead lane. */
export async function listUnderReview(): Promise<
  { campaign: CampaignListItem; milestone: NonNullable<ReturnType<typeof openObjection>> }[]
> {
  return all()
    .map((c) => ({ campaign: toListItem(c), milestone: openObjection(c) }))
    .filter((x): x is { campaign: CampaignListItem; milestone: NonNullable<typeof x.milestone> } =>
      x.milestone !== null
    )
    .sort(
      (a, b) =>
        new Date(a.milestone.claim?.objectionWindowEndsAt ?? 0).getTime() -
        new Date(b.milestone.claim?.objectionWindowEndsAt ?? 0).getTime()
    );
}

/** A creator's other campaigns and their track record. What ask 14 would embed in the projection. */
export async function getCreatorCampaigns(
  creatorId: string,
  excludeId?: string
): Promise<{
  history: CreatorCampaignSummary[];
  record: ReturnType<typeof creatorTrackRecord>;
}> {
  const campaigns = all();
  return {
    history: creatorHistory(campaigns, creatorId, excludeId),
    record: creatorTrackRecord(campaigns, creatorId),
  };
}

/** Regions present in the catalogue, so the filter never offers one with nothing behind it. */
export async function listCampaignRegions(): Promise<string[]> {
  const regions = new Set<string>();
  for (const c of all()) if (c.region) regions.add(c.region);
  return [...regions].sort((a, b) => a.localeCompare(b));
}

/** Campaigns closing within the week, for the closing-soon lane. Live campaigns only. */
export async function listClosingSoon(withinDays = 7): Promise<CampaignListItem[]> {
  const cutoff = Date.now() + withinDays * 86_400_000;
  return all()
    .filter((c) => c.status === 'ACTIVE')
    .filter((c) => {
      const deadline = new Date(c.deadline).getTime();
      return deadline > Date.now() && deadline <= cutoff;
    })
    .map(toListItem)
    .sort(SORTERS['closing-soon']);
}

/** Campaigns that delivered every stage. Our success-stories module, and every card cites a receipt. */
export async function listDelivered(): Promise<CampaignListItem[]> {
  return all()
    .filter((c) => c.status === 'COMPLETED')
    .map(toListItem)
    .sort((a, b) => parseDecimal(b.totalRaised) - parseDecimal(a.totalRaised));
}
