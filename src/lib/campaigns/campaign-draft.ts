import { parseDecimal } from '@/lib/format';
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
  category: IdeaCategory;
  region: string;
  type: CampaignType;
  tokenType: 'USDC' | 'CNGN';
  targetAmount: string;
  deadline: string;
  workingCapitalPct: string;
  videoUrl: string;
  coverImageUrl: string;
  milestones: MilestoneDraft[];
};

export type DraftErrors = Partial<Record<string, string>>;

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
    category: 'software',
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
  };
}

/** Stage shares, and what is left to assign. The number the stages step is really about. */
export function trancheTotal(milestones: MilestoneDraft[]): number {
  return milestones.reduce((sum, m) => sum + parseDecimal(m.tranchePct), 0);
}

export function trancheRemaining(milestones: MilestoneDraft[]): number {
  return Math.round((100 - trancheTotal(milestones)) * 100) / 100;
}

/** What a stage releases in money. A percentage of an unfamiliar total is not actionable. */
export function trancheAmountOf(draft: CampaignDraft, milestone: MilestoneDraft): number {
  return (parseDecimal(milestone.tranchePct) / 100) * parseDecimal(draft.targetAmount);
}

/** What is released the moment funding closes, before any stage is verified (FR-503a). */
export function workingCapitalAmount(draft: CampaignDraft): number {
  return (parseDecimal(draft.workingCapitalPct) / 100) * parseDecimal(draft.targetAmount);
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
