import { Pill } from "@/components/ui/pill";
import {
  campaignPhaseLabels,
  campaignPhaseTones,
  contributionStateLabels,
  contributionStateTones,
  milestoneStateLabels,
  milestoneStateTones,
  paymentStateLabels,
  paymentStateTones,
  refundStateLabels,
  refundStateTones,
} from "@/features/campaigns/lib/status";
import type {
  CampaignPhase,
  ContributionState,
  MilestoneState,
  PaymentState,
  RefundState,
} from "@/features/campaigns/types";

/**
 * Status labels for campaign surfaces.
 *
 * Each one reads its text and tone from the single label map in `lib/status`,
 * so a milestone's badge says the same thing on a card, a timeline, and a
 * creator's worklist. The label always carries the meaning; colour is secondary
 * (WCAG 1.4.1).
 */

type PillSize = "sm" | "xs";

export function PhasePill({
  phase,
  size = "sm",
  className = "",
}: {
  phase: CampaignPhase;
  size?: PillSize;
  className?: string;
}) {
  return (
    <Pill tone={campaignPhaseTones[phase]} size={size} className={className}>
      {campaignPhaseLabels[phase]}
    </Pill>
  );
}

export function MilestonePill({
  state,
  size = "sm",
  className = "",
}: {
  state: MilestoneState;
  size?: PillSize;
  className?: string;
}) {
  return (
    <Pill tone={milestoneStateTones[state]} size={size} className={className}>
      {milestoneStateLabels[state]}
    </Pill>
  );
}

export function PaymentPill({
  state,
  size = "sm",
  className = "",
}: {
  state: PaymentState;
  size?: PillSize;
  className?: string;
}) {
  return (
    <Pill tone={paymentStateTones[state]} size={size} className={className}>
      {paymentStateLabels[state]}
    </Pill>
  );
}

export function ContributionPill({
  state,
  size = "sm",
  className = "",
}: {
  state: ContributionState;
  size?: PillSize;
  className?: string;
}) {
  return (
    <Pill
      tone={contributionStateTones[state]}
      size={size}
      className={className}
    >
      {contributionStateLabels[state]}
    </Pill>
  );
}

export function RefundPill({
  state,
  size = "sm",
  className = "",
}: {
  state: RefundState;
  size?: PillSize;
  className?: string;
}) {
  return (
    <Pill tone={refundStateTones[state]} size={size} className={className}>
      {refundStateLabels[state]}
    </Pill>
  );
}

/**
 * The milestone-plan promise, carried on every card and hero.
 *
 * It is a claim about the campaign's structure, so it is only ever rendered for
 * a campaign that actually has a plan. `acceptsRefunds` marks the one case where
 * the plan will not run, because a card that still says "Milestone plan" after
 * the target was missed would imply money is still going to be released.
 */
export function PlanBadge({
  hasPlan,
  accepting,
  size = "xs",
  className = "",
}: {
  hasPlan: boolean;
  accepting: boolean;
  size?: PillSize;
  className?: string;
}) {
  if (!hasPlan) return null;

  return (
    <Pill
      tone={accepting ? "accent" : "neutral"}
      size={size}
      className={className}
      title={
        accepting
          ? "Funds are released in published stages as milestones are approved"
          : "The plan did not run. Any escrow is refundable"
      }
    >
      {accepting ? "Milestone plan" : "Plan did not run"}
    </Pill>
  );
}
