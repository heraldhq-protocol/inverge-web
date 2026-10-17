export type MeterTone = "accent" | "neutral" | "danger";

const toneClasses: Record<MeterTone, string> = {
  accent: "bg-brand",
  neutral: "bg-ink/40",
  danger: "bg-danger",
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

/**
 * The one progress bar in the product: validation progress on an idea, funding
 * progress on a campaign.
 *
 * Accessibility: a real `progressbar` role with the value spelled out in
 * `aria-valuetext`, because a bare percentage tells a screen-reader user nothing
 * about what is progressing. `srLabel` gives the visual-only variant a name.
 *
 * `cap` exists because an idea's meter is capped at 100: an idea at three times
 * the supporter floor is not "at 300%". A campaign passes `cap={false}` and may
 * exceed its target.
 */
export function Meter({
  ratio,
  label,
  srLabel,
  tone = "accent",
  size = "md",
  cap = true,
  className = "",
}: {
  /** 0..1. Values above 1 are clamped for the fill unless `cap` is false. */
  ratio: number;
  /** Visible label rendered above the bar. Omit for the flush-to-cover variant. */
  label?: React.ReactNode;
  /** Accessible name when there is no visible label. */
  srLabel?: string;
  tone?: MeterTone;
  size?: "sm" | "md";
  cap?: boolean;
  className?: string;
}) {
  const safe = Number.isFinite(ratio) ? Math.max(0, ratio) : 0;
  const fill = cap ? clamp01(safe) : Math.min(1, safe);

  return (
    <div className={className}>
      {label ? (
        <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
          {label}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fill * 100)}
        aria-valuetext={`${formatPercent(safe)}${srLabel ? ` ${srLabel}` : ""}`}
        aria-label={srLabel}
        className={`w-full overflow-hidden rounded-full bg-ink/12 ${
          size === "sm" ? "h-1" : "h-2"
        }`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none ${toneClasses[tone]}`}
          style={{ width: `${fill * 100}%` }}
        />
      </div>
    </div>
  );
}

/**
 * The card variant: welded to the bottom edge of the cover image, no label, no
 * rounding. It reads as a waterline on the photo and survives a narrow card.
 */
export function CoverMeter({
  ratio,
  srLabel,
  tone = "accent",
}: {
  ratio: number;
  srLabel: string;
  tone?: MeterTone;
}) {
  const fill = clamp01(ratio);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(fill * 100)}
      aria-valuetext={`${formatPercent(ratio)} ${srLabel}`}
      className="absolute inset-x-0 bottom-0 h-1 bg-ink/20"
    >
      <div
        className={`h-full ${toneClasses[tone]}`}
        style={{ width: `${fill * 100}%` }}
      />
    </div>
  );
}
