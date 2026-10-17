/**
 * Share-image palette.
 *
 * Mirrors the CSS custom properties in `src/app/globals.css` as literal hex,
 * because the share-image renderer runs outside the stylesheet and cannot read
 * CSS variables. Change one, change both.
 */
export const ogTokens = {
  /** Warm cream page. */
  canvas: "#fbf9f5",
  surface: "#ffffff",
  surfaceMuted: "#f7f4ef",

  /** Forest, used for the deep panel and inverted type. */
  contrast: "#0d1d15",
  brandStrong: "#116b3a",

  brand: "#1fa85c",
  brandSoft: "#eaf7ef",
  brandTint: "#f3faf6",

  ink: "#1f1f1e",
  inkSoft: "#4b4b48",
  muted: "#71716e",

  border: "#eae6e1",
  borderStrong: "#ded8cf",
} as const;

/**
 * The logo mark, matching `src/components/shared/brand-mark.tsx` and
 * `src/app/icon.svg`: a rounded square with a single leaf.
 */
export const ogLogo = {
  viewBox: "0 0 32 32",
  radius: 9,
  leafPath: "M8 22C11 12 18 8 24 9C23 15 19 22 8 22Z",
} as const;

/** Card geometry. Open Graph's canonical large-preview size. */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
