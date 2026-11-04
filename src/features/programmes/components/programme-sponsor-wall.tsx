import type { ProgrammeSponsor } from "@/features/programmes/api/types";
import { isSafeLogoUrl } from "@/features/programmes/lib/programme";

function initials(name: string): string {
  const words = name
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);
  const first = words[0]?.[0] ?? "?";
  const last = words.length > 1 ? words[words.length - 1]?.[0] : undefined;
  return `${first}${last ?? ""}`.toUpperCase();
}

const tierOrder = (tier: string): number => {
  const normalised = tier.toUpperCase();
  if (normalised === "LEAD") return 0;
  if (normalised === "PARTNER") return 1;
  return 2;
};

/**
 * Sponsor acknowledgement from the programme's published records.
 *
 * A logo is rendered only when the organiser supplied a safe https URL. The
 * fallback is initials, never an invented logo. The wall is acknowledgement,
 * not an endorsement claim, and it carries no ranking weight.
 */
export function ProgrammeSponsorWall({
  sponsors,
}: {
  sponsors: ProgrammeSponsor[];
}) {
  if (sponsors.length === 0) return null;

  const ordered = [...sponsors].sort(
    (left, right) => tierOrder(left.tier) - tierOrder(right.tier),
  );

  return (
    <section aria-labelledby="sponsors" className="border-t border-border pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="sponsors"
          className="text-sm font-bold tracking-[-0.02em] text-ink"
        >
          Supported by
        </h2>
        <p className="text-xs text-muted">
          Sponsors fund the programme. They do not score entries.
        </p>
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((sponsor) => {
          const logo = isSafeLogoUrl(sponsor.logoUrl ?? undefined)
            ? sponsor.logoUrl
            : null;
          const content = (
            <>
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="h-8 w-auto max-w-32 object-contain"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="grid size-8 place-items-center rounded-md bg-ink/[0.06] text-[0.625rem] font-bold tracking-[0.04em] text-muted"
                >
                  {initials(sponsor.name)}
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-ink">
                  {sponsor.name}
                </span>
                <span className="block text-[0.625rem] uppercase tracking-[0.12em] text-muted">
                  {sponsor.tier}
                </span>
              </span>
            </>
          );

          return (
            <li key={sponsor.id}>
              {sponsor.website ? (
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {content}
                </a>
              ) : (
                <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface p-3">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
