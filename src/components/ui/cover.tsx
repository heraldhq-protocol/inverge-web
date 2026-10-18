import Image from "next/image";
import type { ReactNode } from "react";

export type CoverRatio = "band" | "thumbnail";

// Four steps of the one brand hue plus the forest ground: hierarchy from a
// single hue rather than a second colour signalling a second thing. Weighted
// toward the pale end, because a grid of mostly-dark bands reads as stripes.
const SURFACES = [
  "bg-brand/10 text-brand-strong",
  "bg-contrast text-canvas",
  "bg-brand/[0.06] text-brand-strong",
  "bg-brand/10 text-brand-strong",
  "bg-brand text-white",
] as const;

/** Deterministic tint from the seed, so an idea keeps one colour across surfaces. */
// Steps are typed `as const` for the literal class strings, so index access is
// unchecked under `noUncheckedIndexedAccess`; keep an explicit floor.
const DEFAULT_SURFACE = "bg-brand/10 text-brand-strong";

function surfaceFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 9973;
  }
  return SURFACES[hash % SURFACES.length] ?? DEFAULT_SURFACE;
}

/**
 * The small caption chip laid over the artwork.
 *
 * Shared so a cover and the campaign media carousel place an identical chip, and
 * so the class list has one owner. It is decorative, so it never intercepts a
 * click meant for the artwork or a control beneath it, and `z-10` keeps it above
 * both.
 */
export function CoverBadge({ children }: { children: ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-ink/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-white">
      {children}
    </span>
  );
}

/**
 * Cover art for an idea or a campaign.
 *
 * Without a photo the fallback is a deterministic colour band tinted from the
 * seed plus a short label the caller supplies, so it reads as deliberate rather
 * than as a failed load. It takes a `band` (short, for idea cards that have no
 * image) or a `thumbnail` (16:9, for campaign cards whose poster is already in
 * that frame) — the fallback keeps the same ratio, so a mixed grid stays even.
 */
export function Cover({
  seed,
  label,
  src,
  size = "grid",
  ratio = "band",
  className = "",
}: {
  /** Stable id (or slug) the fallback tint is derived from. */
  seed: string;
  /** Short caption shown on the cover, e.g. a topic. */
  label: string;
  src?: string | null;
  size?: "grid" | "featured" | "lane";
  ratio?: CoverRatio;
  className?: string;
}) {
  const thumbnail = ratio === "thumbnail";

  if (src) {
    return (
      <div
        className={`relative w-full overflow-hidden bg-ink/5 ${
          thumbnail ? "aspect-video" : "aspect-[3/2]"
        } ${className}`}
      >
        <Image
          src={src}
          alt={`${label} cover`}
          fill
          sizes={
            size === "featured"
              ? "(min-width: 1024px) 640px, 100vw"
              : "(min-width: 640px) 320px, 100vw"
          }
          className="object-cover"
        />
        <CoverBadge>{label}</CoverBadge>
      </div>
    );
  }

  const height = thumbnail
    ? "aspect-video"
    : size === "featured"
      ? "h-28 sm:h-32"
      : size === "lane"
        ? "h-16"
        : "h-20";

  return (
    <div
      className={`relative w-full overflow-hidden ${height} ${surfaceFor(seed)} ${className}`}
      aria-hidden="true"
    >
      {/* A quiet mark so an image-less cover reads as deliberate. */}
      <svg
        className={`absolute w-auto opacity-[0.09] ${
          thumbnail ? "-right-8 -top-16 h-[190%]" : "-right-4 -top-10 h-[220%]"
        }`}
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="50" cy="50" r="46" />
        <circle cx="50" cy="50" r="30" />
      </svg>

      <div
        className={`relative flex h-full px-3.5 ${
          thumbnail ? "items-end pb-3" : "items-center"
        }`}
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.15em] opacity-75">
          {label}
        </span>
      </div>
    </div>
  );
}
