import type { PrePledgeStatus } from "@/features/pre-pledges/types";

const statusDetails = {
  "near-validation": {
    label: "Near validation",
    dot: "bg-brand",
  },
  validating: {
    label: "Still validating",
    dot: "bg-muted/65",
  },
  "validation-closed": {
    label: "Validation closed",
    dot: "bg-muted/65",
  },
} as const;

export function PrePledgeStatusLabel({ status }: { status: PrePledgeStatus }) {
  const details = statusDetails[status];

  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted">
      <span
        className={`size-2 shrink-0 rounded-full ${details.dot}`}
        aria-hidden="true"
      />
      <span>{details.label}</span>
    </span>
  );
}
