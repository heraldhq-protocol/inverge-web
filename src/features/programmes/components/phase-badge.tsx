import type { ProgrammePhase } from "@/features/programmes/api/types";
import { phaseLabel } from "@/features/programmes/lib/public-programme";

const phaseStyles: Record<ProgrammePhase, string> = {
  SCHEDULED: "border-ink/15 bg-surface text-ink-soft",
  REGISTRATION_OPEN: "border-brand/30 bg-brand-soft text-brand-strong",
  SUBMISSION_OPEN: "border-brand/40 bg-brand-soft text-brand-strong",
  JUDGING: "border-warning/25 bg-warning/10 text-warning-strong",
  RESULTS_REVIEW: "border-warning/25 bg-warning/10 text-warning-strong",
  COMPLETED: "border-ink/15 bg-ink/[0.05] text-ink-soft",
  ARCHIVED: "border-ink/15 bg-ink/[0.05] text-muted",
};

/**
 * Phase label with a text label, not colour alone. The dot is decorative and
 * hidden from assistive technology, so the badge still reads in a monochrome
 * print-out or for a colour-blind reader.
 */
export function PhaseBadge({
  phase,
  className = "",
}: {
  phase: ProgrammePhase;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold ${phaseStyles[phase]} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${
          phase === "SUBMISSION_OPEN" || phase === "REGISTRATION_OPEN"
            ? "bg-brand"
            : phase === "JUDGING" || phase === "RESULTS_REVIEW"
              ? "bg-warning"
              : "bg-current opacity-50"
        }`}
      />
      {phaseLabel(phase)}
    </span>
  );
}
