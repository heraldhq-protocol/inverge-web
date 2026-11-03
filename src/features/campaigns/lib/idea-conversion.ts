import {
  createDraftMilestone,
  emptyCampaignDraft,
  formatBpsNumber,
  nextDraftId,
  type CampaignDraft,
  type DraftMilestone,
} from "@/features/campaigns/lib/wizard";
import type { IdeaDetail } from "@/features/ideas/types";
import type { MoneyAmount } from "@/lib/money";

/**
 * The boundary between an idea and the campaign plan it becomes.
 *
 * The API's conversion endpoint takes the funding plan only: type, token,
 * target, deadline and 2–6 milestone tranches. Everything else the wizard
 * authors is persisted by the draft save that follows. Keeping the mapping here
 * means the server route and the tests share one definition of what conversion
 * sends, rather than the route guessing at the wizard's shape.
 */

export const CONVERT_IDEA_CAMPAIGN_TYPE = "ALL_OR_NOTHING" as const;

export type ConvertIdeaMilestonePayload = {
  title: string;
  deliverable: string;
  tranchePct: number;
  evidenceDefinition: { text: string };
};

export type ConvertIdeaPayload = {
  type: typeof CONVERT_IDEA_CAMPAIGN_TYPE;
  tokenType: "USDC" | "CNGN";
  targetAmount: string;
  deadline: string;
  workingCapitalPct: 20;
  milestones: ConvertIdeaMilestonePayload[];
};

export type ConvertPlanResult =
  { ok: true; payload: ConvertIdeaPayload } | { ok: false; message: string };

const MAX_MILESTONES = 6;
const MIN_MILESTONES = 2;
const TARGET_PATTERN = /^\d+(\.\d{1,2})?$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function milestonePayloads(
  value: unknown,
): ConvertIdeaMilestonePayload[] | null {
  if (!Array.isArray(value)) return null;
  if (value.length < MIN_MILESTONES || value.length > MAX_MILESTONES) {
    return null;
  }

  const milestones: ConvertIdeaMilestonePayload[] = [];
  for (const entry of value) {
    const record = asRecord(entry);
    if (!record) return null;

    const title = text(record.title);
    const deliverable = text(record.deliverable);
    const evidence = text(record.evidence);
    const allocation = text(record.allocationPercent);
    const tranchePct = Number(allocation);

    if (!title || !deliverable || !evidence || !allocation) return null;
    if (!Number.isFinite(tranchePct) || tranchePct <= 0) return null;

    milestones.push({
      deliverable,
      evidenceDefinition: { text: evidence },
      title,
      tranchePct,
    });
  }

  const total = milestones.reduce(
    (sum, milestone) => sum + milestone.tranchePct,
    0,
  );
  if (Math.round(total) !== 100) return null;

  return milestones;
}

/**
 * Reads a full wizard payload and returns the conversion plan, or a reason the
 * plan cannot be converted. The client validates first; this is the server's
 * second line of defence so a malformed body becomes a 400 rather than a crash.
 */
export function toConvertIdeaPayload(value: unknown): ConvertPlanResult {
  const record = asRecord(value);
  if (!record)
    return { message: "Send the campaign plan as a JSON object.", ok: false };

  const targetAmount = text(record.targetAmount);
  if (!TARGET_PATTERN.test(targetAmount) || Number(targetAmount) <= 0) {
    return {
      message: "Set a funding target before converting the idea.",
      ok: false,
    };
  }

  const deadline = text(record.deadline);
  if (!deadline || Number.isNaN(Date.parse(deadline))) {
    return {
      message: "Set a funding deadline before converting the idea.",
      ok: false,
    };
  }

  const workingCapitalPercent = text(record.workingCapitalPercent);
  if (workingCapitalPercent !== "20") {
    return {
      message: "The working-capital tranche must be the platform's fixed 20%.",
      ok: false,
    };
  }

  const tokenType = record.tokenType === "CNGN" ? "CNGN" : "USDC";
  const milestones = milestonePayloads(record.milestones);
  if (!milestones) {
    return {
      message:
        "Complete 2–6 milestones with a deliverable, an evidence definition and tranches that total 100%.",
      ok: false,
    };
  }

  return {
    ok: true,
    payload: {
      deadline: new Date(deadline).toISOString(),
      milestones,
      targetAmount,
      tokenType,
      type: CONVERT_IDEA_CAMPAIGN_TYPE,
      workingCapitalPct: 20,
    },
  };
}

/** A decimal input string from integer atomic units, without losing cents. */
function atomicToDecimalInput(amount: MoneyAmount): string {
  const atomic = BigInt(amount.atomic);
  if (atomic <= 0n) return "";

  const divisor = 10n ** BigInt(amount.decimals);
  const whole = atomic / divisor;
  const fraction = (atomic % divisor)
    .toString()
    .padStart(amount.decimals, "0")
    .replace(/0+$/, "");

  return fraction ? `${whole}.${fraction}` : whole.toString();
}

function equalAllocations(count: number): string[] {
  const totalBps = 10_000;
  const base = Math.floor(totalBps / count);
  const remainder = totalBps - base * count;

  return Array.from({ length: count }, (_, index) =>
    formatBpsNumber(base + (index === count - 1 ? remainder : 0)),
  );
}

function milestonesFromIdea(idea: IdeaDetail): DraftMilestone[] {
  const steps = idea.roadmapSteps.slice(0, MAX_MILESTONES);
  if (steps.length < MIN_MILESTONES) {
    return [createDraftMilestone("50"), createDraftMilestone("50")];
  }

  const allocations = equalAllocations(steps.length);
  return steps.map((step, index) => {
    const title = step.description.trim().slice(0, 90);
    return {
      allocationPercent: allocations[index] ?? "",
      deliverable: step.description,
      evidence: "",
      expectedAt: ISO_DATE_PATTERN.test(step.date) ? step.date : "",
      id: nextDraftId("milestone"),
      title,
    };
  });
}

/**
 * A campaign draft prefilled from the idea the creator chose to convert.
 *
 * The roadmap becomes a starting milestone plan, but evidence is deliberately
 * left blank: conversion is a one-way lifecycle change, so the creator should
 * finish and review the plan rather than have a save convert the idea by
 * accident. The ask and its breakdown carry over unchanged.
 */
export function draftFromIdea(idea: IdeaDetail): CampaignDraft {
  return {
    ...emptyCampaignDraft,
    beneficiaries: idea.targetUser,
    category: idea.taxonomyCategory ?? "",
    deadline: "",
    location:
      idea.location === "Location not shared" ? "" : idea.location.trim(),
    milestones: milestonesFromIdea(idea),
    problem: idea.problem,
    risks: idea.risks ?? "",
    solution: idea.solution,
    subcategory: idea.taxonomySubcategory ?? "",
    summary: idea.description,
    targetInput: atomicToDecimalInput(idea.askAmount),
    title: idea.title,
    useOfFunds: idea.askBreakdown.map((line) => ({
      amountInput: atomicToDecimalInput(line.amount),
      id: nextDraftId("funds"),
      label: line.label,
    })),
  };
}
