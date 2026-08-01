import { parseDecimal } from '@/lib/format';
import { TOPIC_BY_SLUG } from '@/lib/feed/categories';
import type { IdeaCategory } from '@/lib/feed/types';
import { PLATFORM, type CampaignType } from './types';

/**
 * The campaign a creator is drafting, and every rule it has to satisfy.
 *
 * Pure: no I/O, no React, no fetch. Same separation `inverge-api` keeps between `pledge-weighting.ts`
 * and the services that call it, and for the same reason — these are the rules of the product, they
 * are stated once, and a form is only one of the things that might want to ask about them.
 *
 * Every constraint here comes from the SRS rather than from taste:
 *
 * - FR-301: between two and six stages.
 * - FR-302: stage shares sum to exactly 100.
 * - FR-305: all or nothing. Reaching the target by the deadline activates escrow; missing it refunds.
 * - FR-306: Flexible Funding is gated by creator tier, so a Starter creator cannot select it.
 * - FR-503a: the working capital tranche is capped, and disclosed to backers before they back.
 * - FR-303: none of it can be changed once the campaign is published, which is why the last step is a
 *   read-only review rather than one more form.
 */

export type MilestoneDraft = {
  /** Stable key for React, not an API id. Nothing here has been saved anywhere. */
  key: string;
  title: string;
  deliverable: string;
  /** Kept as a string so a half-typed "2" does not become 2% on the way to being 25%. */
  tranchePct: string;
  evidenceType: string;
  evidenceSource: string;
};

/**
 * A reward tier as the creator is writing it. Optional (FR-301): a campaign may have none.
 *
 * `amount` and `limitedQuantity` stay strings for the same reason `tranchePct` does — a half-typed
 * "2" should not briefly mean two.
 */
export type RewardDraft = {
  key: string;
  title: string;
  description: string;
  amount: string;
  estimatedDelivery: string;
  /** Blank means unlimited. */
  limitedQuantity: string;
  items: { label: string; quantity: string }[];
  shipping: 'WORLDWIDE' | 'REGION_ONLY' | 'NOTHING_TO_SHIP';
};

export type CampaignDraft = {
  ideaId: string | null;
  /**
   * Raising without validating first.
   *
   * The product's default sequence is idea → validation → campaign, and it is the sequence everything
   * else is built around: supporters carry over, the gate is evidence a reviewer can read, and the
   * campaign page can point at strangers who said this was worth building. A creator may still skip
   * it — some arrive with an audience already, and refusing them is refusing a real case — but they
   * are giving something up, and the form says so rather than presenting the two paths as equal.
   *
   * With no idea to inherit from, the campaign has to carry its own title, summary, category and
   * region, which is what the fields below are for.
   */
  standalone: boolean;
  title: string;
  summary: string;
  /**
   * The browsing topic, by slug.
   *
   * A creator picks from the fifteen topics rather than the API's five categories, because five is
   * too coarse to describe anything: a third of everything is "Other", which tells a backer nothing
   * (categories.ts). The API category is derived from the topic, so what eventually goes over the
   * wire is still one of the five values the enum accepts.
   */
  topic: string;
  region: string;
  type: CampaignType;
  tokenType: 'USDC' | 'CNGN';
  targetAmount: string;
  deadline: string;
  workingCapitalPct: string;
  videoUrl: string;
  coverImageUrl: string;
  milestones: MilestoneDraft[];
  /**
   * What backers get for pledging. Optional, and genuinely so: this product funds work as often as it
   * funds objects, and a campaign to automate vendor payouts has nothing to post to anyone.
   *
   * Rewards never touch the escrow. They do not gate a tranche, do not accelerate one, and are not
   * what a stage is judged on — the evidence definition is. Keeping the two apart is why the stages
   * step comes first.
   */
  rewards: RewardDraft[];
};

export type DraftErrors = Partial<Record<string, string>>;

export const emptyReward = (key: string): RewardDraft => ({
  key,
  title: '',
  description: '',
  amount: '',
  estimatedDelivery: '',
  limitedQuantity: '',
  items: [],
  shipping: 'NOTHING_TO_SHIP',
});

export const emptyMilestone = (key: string): MilestoneDraft => ({
  key,
  title: '',
  deliverable: '',
  tranchePct: '',
  evidenceType: '',
  evidenceSource: '',
});

export function emptyDraft(): CampaignDraft {
  return {
    ideaId: null,
    standalone: false,
    title: '',
    summary: '',
    topic: '',
    region: '',
    type: 'ALL_OR_NOTHING',
    tokenType: 'USDC',
    targetAmount: '',
    deadline: '',
    workingCapitalPct: '',
    videoUrl: '',
    coverImageUrl: '',
    // Two is the floor, so the form opens at the floor rather than at zero. A creator adding their
    // first stage to an empty list has to work out what a stage even is; two empty rows show them.
    milestones: [emptyMilestone('m1'), emptyMilestone('m2')],
    // Rewards open empty, unlike stages: none is a valid and common answer, and pre-filling a row
    // would imply otherwise.
    rewards: [],
  };
}

/**
 * A complete, valid draft, for filling the form in one click while working on the screens.
 *
 * Reviewing a four-step form means retyping four steps every time one line of markup changes, which
 * is how validation states and the review step end up under-tested — nobody gets that far often
 * enough. The control that calls this is rendered only outside production builds
 * (`campaign-builder.tsx`), so this never reaches a creator.
 *
 * The content is real-shaped for the same reason every fixture is: a form filled with "test test"
 * cannot be judged for line lengths, wrapping or tone (conventions §1.5). Shares sum to 100, so the
 * happy path lands on the review step rather than on an error.
 */
export function sampleDraft(ideaId: string | null): CampaignDraft {
  const inThreeMonths = new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10);
  const inSixMonths = new Date(Date.now() + 180 * 86_400_000).toISOString().slice(0, 10);

  return {
    ideaId,
    standalone: ideaId === null,
    title: 'Ariaria Dye House',
    summary:
      'Fabric dyers in Aba mix by eye, so no two batches match and export orders fall through.',
    topic: 'fashion',
    region: 'Aba',
    type: 'ALL_OR_NOTHING',
    tokenType: 'USDC',
    targetAmount: '9000',
    deadline: inThreeMonths,
    workingCapitalPct: '20',
    videoUrl: 'https://media.ariariadye.example/pitch.mp4',
    coverImageUrl: '',
    milestones: [
      {
        key: 'sample-1',
        title: 'Dye house fitted out',
        deliverable: 'Vats, scales and a water line installed and running in the shared unit.',
        tranchePct: '30',
        evidenceType: 'Photos and receipts',
        evidenceSource: 'Build photos plus supplier receipts',
      },
      {
        key: 'sample-2',
        title: 'Repeatable colour matching',
        deliverable: 'Twenty batches dyed to the same reference within an agreed tolerance.',
        tranchePct: '35',
        evidenceType: 'Batch record',
        evidenceSource: 'Measured readings for every batch, published',
      },
      {
        key: 'sample-3',
        title: 'First export order shipped',
        deliverable: 'One order shipped and accepted by a buyer outside Nigeria.',
        tranchePct: '35',
        evidenceType: 'Shipping documents',
        evidenceSource: 'Bill of lading plus written buyer acceptance',
      },
    ],
    rewards: [
      {
        key: 'sample-r1',
        title: 'Name on the wall',
        description:
          'Your name painted on the dye house wall, and the batch record for the first run sent to you.',
        amount: '25',
        estimatedDelivery: inSixMonths,
        limitedQuantity: '',
        items: [],
        shipping: 'NOTHING_TO_SHIP',
      },
      {
        key: 'sample-r2',
        title: 'Two metres of the first run',
        description:
          'Two metres of cloth from the first colour-matched batch, cut and posted once the run passes.',
        amount: '90',
        estimatedDelivery: inSixMonths,
        limitedQuantity: '120',
        items: [{ label: 'Hand-dyed cloth, two metres', quantity: '1' }],
        shipping: 'WORLDWIDE',
      },
    ],
  };
}

/** Stage shares, and what is left to assign. The number the stages step is really about. */
export function trancheTotal(milestones: MilestoneDraft[]): number {
  return milestones.reduce((sum, m) => sum + parseDecimal(m.tranchePct), 0);
}

export function trancheRemaining(milestones: MilestoneDraft[]): number {
  return Math.round((100 - trancheTotal(milestones)) * 100) / 100;
}

/**
 * Split the whole raise evenly across the stages, in whole percent, summing to **exactly** 100.
 *
 * Three stages is 33.33 recurring, and three fields reading "33.33" sum to 99.99, which fails FR-302
 * for a reason no creator would ever guess from looking at the form. So the split is integers and the
 * remainder lands on the earliest stages: 34/33/33. Ugly arithmetic beats an unexplainable rejection.
 */
export function distributeEvenly(milestones: MilestoneDraft[]): MilestoneDraft[] {
  const n = milestones.length;
  if (n === 0) return milestones;

  const base = Math.floor(100 / n);
  const remainder = 100 - base * n;

  return milestones.map((m, i) => ({
    ...m,
    tranchePct: String(base + (i < remainder ? 1 : 0)),
  }));
}

/**
 * Add a stage without breaking the total.
 *
 * The new stage takes whatever is unassigned, so a creator who had reached 100 gets a stage at 0 and
 * an explicit prompt rather than a silently invalid form. Nothing already entered is touched: a
 * builder that rewrites numbers the creator typed is worse than one that leaves a gap.
 */
export function addMilestone(milestones: MilestoneDraft[], key: string): MilestoneDraft[] {
  const remaining = Math.max(0, trancheRemaining(milestones));
  return [...milestones, { ...emptyMilestone(key), tranchePct: remaining > 0 ? String(remaining) : '' }];
}

/**
 * Remove a stage and hand its share to the one before it, so a form that summed to 100 still does.
 *
 * The alternative is dropping to 95% and making the creator hunt for the five percent, which is the
 * single most likely way to arrive at the review step with an error nobody can see.
 */
export function removeMilestone(milestones: MilestoneDraft[], key: string): MilestoneDraft[] {
  const index = milestones.findIndex((m) => m.key === key);
  if (index === -1 || milestones.length <= PLATFORM.minMilestones) return milestones;

  const freed = parseDecimal(milestones[index].tranchePct);
  const rest = milestones.filter((m) => m.key !== key);
  if (freed <= 0) return rest;

  // Prefer the stage before the one removed; fall back to the new last stage.
  const target = Math.max(0, Math.min(index - 1, rest.length - 1));
  return rest.map((m, i) =>
    i === target ? { ...m, tranchePct: String(parseDecimal(m.tranchePct) + freed) } : m
  );
}

/**
 * What is released the moment funding closes, before any stage is verified (FR-503a).
 *
 * A share of the **target**, and this is the field where the base matters most: it is the only money
 * that moves before anybody has checked anything, so pegging it to an uncapped raise would let a
 * campaign that overfunded ten times over pay out more up front than its entire plan was worth
 * (campaign-stats.ts).
 */
export function workingCapitalAmount(draft: CampaignDraft): number {
  return (parseDecimal(draft.workingCapitalPct) / 100) * parseDecimal(draft.targetAmount);
}

/**
 * What the stages have to divide between them, **if the campaign raises exactly its goal**.
 *
 * Live, the stages split the actual raise less the upfront, so a campaign that overfunds gives every
 * stage more to work with. At draft time there is no raise to divide, so the preview shows the floor
 * case — the least each stage could be worth — and the form says so rather than implying the figure
 * is fixed.
 */
export function distributableAtTarget(draft: CampaignDraft): number {
  return Math.max(0, parseDecimal(draft.targetAmount) - workingCapitalAmount(draft));
}

/** What a stage releases at the goal. A percentage of an unfamiliar total is not actionable. */
export function trancheAmountOf(draft: CampaignDraft, milestone: MilestoneDraft): number {
  return (parseDecimal(milestone.tranchePct) / 100) * distributableAtTarget(draft);
}

/** The API category a chosen topic belongs to. Falls back to the catch-all rather than to nothing. */
export function categoryOf(draft: CampaignDraft): IdeaCategory {
  return TOPIC_BY_SLUG.get(draft.topic)?.category ?? 'other';
}

/** Step one is satisfied by either a validated idea or an explicit decision to go without one. */
export function validateOrigin(draft: CampaignDraft): DraftErrors {
  if (draft.standalone || draft.ideaId) return {};
  return { origin: 'Pick the idea this campaign comes from, or choose to raise without one.' };
}

export function validateRaise(draft: CampaignDraft): DraftErrors {
  const errors: DraftErrors = {};

  // With no idea behind it the campaign has nothing to inherit, so it states its own identity. These
  // are not optional extras: a card with no title is not a card.
  if (draft.standalone) {
    if (!draft.title.trim()) {
      errors.title = 'Give the campaign a name. It is the first thing anyone reads.';
    }
    if (!draft.summary.trim()) {
      errors.summary = 'One sentence on the problem this solves. It is the line under the title.';
    }
    if (!draft.topic.trim()) {
      errors.topic = 'Pick the topic backers will browse this under.';
    }
    if (!draft.region.trim()) {
      errors.region = 'Where is this happening? Backers filter by it.';
    }
  }

  const target = parseDecimal(draft.targetAmount);
  if (!draft.targetAmount.trim()) {
    errors.targetAmount = 'Give a target. Backers see this figure against what has been raised.';
  } else if (target <= 0) {
    errors.targetAmount = 'The target has to be more than zero.';
  }

  if (!draft.deadline) {
    errors.deadline = 'Pick the date funding closes.';
  } else {
    const deadline = new Date(draft.deadline);
    if (Number.isNaN(deadline.getTime())) {
      errors.deadline = 'That date could not be read.';
    } else if (deadline.getTime() <= Date.now()) {
      errors.deadline = 'The deadline has to be in the future.';
    }
  }

  const wc = parseDecimal(draft.workingCapitalPct);
  if (draft.workingCapitalPct.trim() && (wc < 0 || wc > PLATFORM.workingCapitalMaxPct)) {
    errors.workingCapitalPct = `Between 0 and ${PLATFORM.workingCapitalMaxPct}%. It is released before any stage is verified, so it is capped.`;
  }

  // A campaign asks strangers for money, so the pitch video is required to publish one. Publishing an
  // idea stays free and frictionless; this is the other side of that line (types.ts).
  if (!draft.videoUrl.trim()) {
    errors.videoUrl = 'A pitch video is required. Backers are funding a plan, and they should hear it from you.';
  } else if (!/^https:\/\/\S+$/i.test(draft.videoUrl.trim())) {
    errors.videoUrl = 'Give a full https link to the video.';
  }

  if (draft.coverImageUrl.trim() && !/^https:\/\/\S+$/i.test(draft.coverImageUrl.trim())) {
    errors.coverImageUrl = 'Give a full https link to the image, or leave it blank.';
  }

  return errors;
}

/**
 * Reward tiers. Optional as a whole; complete once started.
 *
 * A half-written tier is worse than no tier: it goes on the page next to a price, and a backer
 * choosing between levels is comparing exactly the fields left blank.
 */
export function validateRewards(draft: CampaignDraft): DraftErrors {
  const errors: DraftErrors = {};

  draft.rewards.forEach((r) => {
    if (!r.title.trim()) errors[`${r.key}.title`] = 'Name this tier.';
    if (!r.description.trim()) {
      errors[`${r.key}.description`] = 'Say what a backer at this level actually gets.';
    }

    const amount = parseDecimal(r.amount);
    if (!r.amount.trim()) {
      errors[`${r.key}.amount`] = 'Give the pledge amount for this tier.';
    } else if (amount <= 0) {
      errors[`${r.key}.amount`] = 'A tier has to cost something.';
    }

    if (!r.estimatedDelivery) {
      errors[`${r.key}.estimatedDelivery`] = 'When do you expect to deliver this?';
    }

    if (r.limitedQuantity.trim()) {
      const qty = parseDecimal(r.limitedQuantity);
      if (qty < 1 || !Number.isInteger(qty)) {
        errors[`${r.key}.limitedQuantity`] = 'A cap has to be a whole number of at least one.';
      }
    }

    r.items.forEach((item, i) => {
      if (!item.label.trim()) errors[`${r.key}.item.${i}`] = 'Name this item or remove it.';
    });
  });

  // Two tiers at the same price is a decision a backer cannot make.
  const amounts = draft.rewards.map((r) => parseDecimal(r.amount)).filter((n) => n > 0);
  if (new Set(amounts).size !== amounts.length) {
    errors.duplicate = 'Two tiers share a pledge amount. Backers need a reason to pick one.';
  }

  return errors;
}

/** Tiers cheapest first, which is the order a backer reads them in. */
export function sortedRewards(rewards: RewardDraft[]): RewardDraft[] {
  return [...rewards].sort((a, b) => parseDecimal(a.amount) - parseDecimal(b.amount));
}

export function validateStages(draft: CampaignDraft): DraftErrors {
  const errors: DraftErrors = {};
  const { milestones } = draft;

  if (milestones.length < PLATFORM.minMilestones) {
    errors.count = `A campaign needs at least ${PLATFORM.minMilestones} stages.`;
  } else if (milestones.length > PLATFORM.maxMilestones) {
    errors.count = `A campaign can have at most ${PLATFORM.maxMilestones} stages.`;
  }

  milestones.forEach((m, i) => {
    if (!m.title.trim()) errors[`${m.key}.title`] = 'Name what this stage delivers.';
    if (!m.deliverable.trim()) {
      errors[`${m.key}.deliverable`] = 'Say what will exist when this stage is done.';
    }
    if (!m.evidenceType.trim()) {
      errors[`${m.key}.evidenceType`] = 'Name the proof you will submit.';
    }
    if (!m.evidenceSource.trim()) {
      errors[`${m.key}.evidenceSource`] = 'Say where the proof comes from.';
    }

    const pct = parseDecimal(m.tranchePct);
    if (!m.tranchePct.trim()) {
      errors[`${m.key}.tranchePct`] = 'Give this stage a share.';
    } else if (pct <= 0) {
      errors[`${m.key}.tranchePct`] = 'A stage has to release something.';
    } else if (pct > 100) {
      errors[`${m.key}.tranchePct`] = 'A stage cannot release more than the whole raise.';
    }
    void i;
  });

  // FR-302 is exact, not approximate: the escrow programme rejects anything else, so the form has to
  // as well rather than letting a creator discover it at submission.
  const total = trancheTotal(milestones);
  if (Math.abs(total - 100) > 0.001) {
    errors.tranche = 'Stage shares must add up to exactly 100%.';
  }

  return errors;
}

export function hasErrors(errors: DraftErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Whether a creator's tier lets them pick Flexible Funding, and what the floor would be (FR-306).
 *
 * Shown rather than hidden, disabled rather than absent. A ladder nobody can see is not an incentive,
 * and "one delivered campaign unlocks this" is the clearest statement of what delivering buys you
 * (campaign-brief.md §13 question 4).
 */
export function flexibleFunding(tier: 'STARTER' | 'TRUSTED' | 'ESTABLISHED') {
  if (tier === 'ESTABLISHED') {
    return { allowed: true, floorPct: 50, requirement: null };
  }
  if (tier === 'TRUSTED') {
    return { allowed: true, floorPct: 70, requirement: null };
  }
  return {
    allowed: false,
    floorPct: null,
    requirement:
      'Deliver one campaign in full, with no upheld objections, and flexible funding opens at a 70% floor.',
  };
}
