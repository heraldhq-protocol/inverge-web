import { buildGateProgress, type GateCriterion } from '@/lib/ideas/gate';
import { fixtureFeedItems } from '@/lib/fixtures/ideas';
import { getSessionToken } from '@/lib/api/client';
import { env } from '@/lib/env';
import type { FeedItem } from '@/lib/feed/types';

export type EligibleIdea = {
  id: string;
  slug: string;
  title: string;
  problem: string;
  /** Cleared the FR-204 gate, so it can be converted. */
  ready: boolean;
  /** How far along the binding constraint is, 0..1. */
  progress: number;
  /**
   * The criteria still short, as data rather than sentences, so the component renders each figure
   * through `Amount`/`Count` instead of hand-formatting money here (conventions §1.2). Empty when
   * ready.
   */
  missing: GateCriterion[];
  askAmount: string;
  supporterCount: number;
  category: FeedItem['category'];
  region: string | null;
  topics?: string[];
};

const ME = 'cre_chinedu';

function fixtureMyIdeas(): EligibleIdea[] {
  return fixtureFeedItems()
    .filter((item) => item.creator?.id === ME)
    .map((item) => {
      const gate = buildGateProgress(item);
      const ready = item.status === 'THRESHOLD_MET';
      const missing = ready ? [] : gate.criteria.filter((c) => !c.met);

      return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        problem: item.problem,
        ready,
        progress: gate.overallPct,
        missing,
        askAmount: item.askAmount,
        supporterCount: item.supporterCount,
        category: item.category,
        region: item.region,
        topics: item.topics,
      };
    });
}

export async function listMyIdeas(token?: string): Promise<EligibleIdea[]> {
  if (env.useFixtures) {
    return fixtureMyIdeas();
  }

  const authToken = token ?? getSessionToken();
  if (!authToken) {
    return fixtureMyIdeas();
  }

  try {
    const res = await fetch(`${env.apiUrl}/ideas?mine=true`, {
      headers: { Authorization: `Bearer ${authToken}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`[my-ideas] GET /ideas?mine=true returned ${res.status}, falling back to fixture`);
      return fixtureMyIdeas();
    }

    const items = (await res.json()) as any[];
    if (!Array.isArray(items) || items.length === 0) {
      return fixtureMyIdeas();
    }

    return items.map((item) => {
      const gate = buildGateProgress({
        supporterCount: item.supporterCount ?? 0,
        weightedPrePledgeTotal: String(item.weightedPrePledgeTotal ?? '0'),
        feedbackScore: String(item.feedbackScore ?? '0'),
        feedbackCount: item.feedbackCount ?? 0,
        askAmount: String(item.askAmount ?? '0'),
      });
      const ready = item.status === 'THRESHOLD_MET';
      const missing = ready ? [] : gate.criteria.filter((c) => !c.met);

      return {
        id: item.id,
        slug: item.slug ?? item.id,
        title: item.title,
        problem: item.problem,
        ready,
        progress: gate.overallPct,
        missing,
        askAmount: String(item.askAmount ?? '0'),
        supporterCount: item.supporterCount ?? 0,
        category: item.category ?? 'software',
        region: item.region ?? null,
        topics: item.topics ?? [],
      };
    });
  } catch (err) {
    console.warn('[my-ideas] Live my ideas request failed, falling back to fixture:', err);
    return fixtureMyIdeas();
  }
}
