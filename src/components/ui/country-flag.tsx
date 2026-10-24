"use client";

import * as Flags from "country-flag-icons/react/3x2";
import type { ReactElement, SVGProps } from "react";

type FlagComponent = (props: SVGProps<SVGSVGElement>) => ReactElement;

/**
 * The SVG flag components are keyed by ISO 3166-1 alpha-2, the same code the
 * country list and the API use. The cast is only because the package exports a
 * namespace of named components rather than an indexable map.
 */
const FLAGS = Flags as unknown as Record<string, FlagComponent | undefined>;

/**
 * A decorative country flag.
 *
 * It is always `aria-hidden`: the country name sits next to it in every place
 * this is used, and a screen reader announcing "flag of Nigeria" before
 * "Nigeria" would be noise. Unknown codes render a neutral swatch rather than a
 * broken image or a guessed flag.
 */
export function CountryFlag({
  code,
  className = "h-3.5 w-[21px]",
}: {
  code: string;
  className?: string;
}) {
  const normalized = code.trim().toUpperCase();
  const Flag = FLAGS[normalized];

  if (!Flag) {
    return (
      <span
        aria-hidden="true"
        className={`inline-block shrink-0 rounded-[2px] bg-canvas ring-1 ring-border/60 ${className}`}
      />
    );
  }

  return (
    <Flag
      aria-hidden="true"
      focusable="false"
      className={`inline-block shrink-0 rounded-[2px] ring-1 ring-border/60 ${className}`}
    />
  );
}
