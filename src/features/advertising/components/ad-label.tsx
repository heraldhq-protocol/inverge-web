import { Pill } from "@/components/ui/pill";

/**
 * The paid-placement label.
 *
 * `Sponsored` is the smallest true description. The advertiser name and the
 * sentence beside it make the commercial relationship explicit, so the label is
 * not a badge that could be read as editorial endorsement.
 */
export function AdLabel({
  advertiser,
  className = "",
}: {
  advertiser: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      <Pill size="xs" tone="promoted">
        Sponsored
      </Pill>
      <span className="text-[0.6875rem] leading-4 text-muted">
        Paid placement by{" "}
        <span className="font-semibold text-ink-soft">{advertiser}</span>
      </span>
    </div>
  );
}
