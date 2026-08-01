import { buildGateProgress, type GateCriterion } from '@/lib/ideas/gate';
import { fixtureFeedItems } from '@/lib/fixtures/ideas';
import type { FeedItem } from '@/lib/feed/types';

/**
 * The signed-in creator's own ideas, and whether each one has cleared the FR-204 validation gate.
 *
 * Fixture-backed and deliberately so: `GET /ideas` has no owner filter (gap backlog item 4), so there
 * is no honest way to ask the API this question yet, and nothing on these screens calls the API in any
 * case — the campaign surfaces are UI-only until the contract lands.
 *
 * Ideas that have not cleared the gate are **listed, not hidden**, with what is still missing. Hiding
 * them would leave a creator staring at an empty screen with no idea why, and the gate is coaching
 * rather than a rejection (FR-271a).
 */

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

/**
 * The creator we render the builder as. One id, in one place, so the swap is a single line.
 *
 * Deliberately someone who has **one** idea past the gate and several still short of it: a builder
 * demoed against a creator with nothing selectable teaches the wrong lesson about the screen, and one
 * with everything selectable never shows the coaching.
 */
const ME = 'cre_chinedu';

export async function listMyIdeas(): Promise<EligibleIdea[]> {
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
