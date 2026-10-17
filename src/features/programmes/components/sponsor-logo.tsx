import type { Sponsor } from "@/features/programmes/types";
import { isSafeLogoUrl } from "@/features/programmes/lib/programme";

type SponsorMark = Pick<Sponsor, "logoUrl" | "name">;

const TIER_ORDER: Record<Sponsor["tier"], number> = {
  lead: 0,
  partner: 1,
  supporter: 2,
};

/** Lead partners read first so the wall reflects the published hierarchy. */
export function sortSponsorsForDisplay(
  sponsors: readonly Sponsor[],
): Sponsor[] {
  return [...sponsors].toSorted(
    (left, right) => TIER_ORDER[left.tier] - TIER_ORDER[right.tier],
  );
}

/** Two letters at most: "Lagos Innovation Lab" becomes "LI". */
function initials(name: string): string {
  const words = name
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);
  const first = words[0]?.[0] ?? "?";
  const last = words.length > 1 ? words[words.length - 1]?.[0] : undefined;
  return `${first}${last ?? ""}`.toUpperCase();
}

/**
 * A sponsor mark with an honest fallback.
 *
 * A supplied logo renders only when it is an https URL or a local asset path.
 * Otherwise the initials tile stands in, so the wall never shows a broken image
 * or an invented brand mark.
 */
export function SponsorLogo({
  sponsor,
  size = "md",
}: {
  sponsor: SponsorMark;
  size?: "sm" | "md";
}) {
  const sizing =
    size === "sm"
      ? "h-9 min-w-9 px-2 text-[0.6875rem]"
      : "h-12 min-w-12 px-3 text-sm";

  if (isSafeLogoUrl(sponsor.logoUrl)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={sponsor.logoUrl}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className={`${sizing} w-auto max-w-44 rounded-lg border border-border bg-white object-contain p-1.5`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-lg border border-border bg-ink/[0.04] font-bold tracking-[0.04em] text-muted ${sizing}`}
    >
      {initials(sponsor.name)}
    </span>
  );
}

/** Brand wall used on the public ideathon and in the admin preview. */
export function SponsorLogoWall({
  emptyLabel = "No sponsor logos supplied yet.",
  sponsors,
}: {
  emptyLabel?: string;
  sponsors: readonly Sponsor[];
}) {
  const ordered = sortSponsorsForDisplay(sponsors);

  if (ordered.length === 0) {
    return <p className="text-xs text-muted">{emptyLabel}</p>;
  }

  return (
    <ul className="flex flex-wrap items-stretch gap-2 sm:gap-3">
      {ordered.map((sponsor) => (
        <li key={sponsor.id}>
          <a
            href={sponsor.website}
            target="_blank"
            rel="noreferrer noopener"
            className="flex h-full min-w-36 flex-col gap-2 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <SponsorLogo sponsor={sponsor} size="sm" />
            <span className="text-[0.6875rem] font-semibold leading-4 text-ink">
              {sponsor.name}
            </span>
            <span className="text-[0.5625rem] uppercase tracking-[0.12em] text-muted">
              {sponsor.tier}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
