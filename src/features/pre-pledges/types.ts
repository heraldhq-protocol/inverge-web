import type { IdeaSummary, NairaAmount } from "@/features/home/types";

export type PrePledgeStage = "active" | "past";
export type PrePledgeStatus =
  "near-validation" | "validating" | "validation-closed";

export type PrePledgeRecord = {
  idea: IdeaSummary;
  intent: NairaAmount;
  stage: PrePledgeStage;
  status: PrePledgeStatus;
  updatedAt: string;
  updatedLabel: string;
};

export type PrePledgesData = {
  active: PrePledgeRecord[];
  past: PrePledgeRecord[];
};

export type PrePledgeStatusFilter = "all" | PrePledgeStatus;
export type PrePledgeSort =
  "most-recent" | "oldest" | "highest-intent" | "closest-to-validation";

export function isPrePledgeStatusFilter(
  value: string,
): value is PrePledgeStatusFilter {
  return ["all", "near-validation", "validating", "validation-closed"].includes(
    value,
  );
}

export function isPrePledgeSort(value: string): value is PrePledgeSort {
  return [
    "most-recent",
    "oldest",
    "highest-intent",
    "closest-to-validation",
  ].includes(value);
}
