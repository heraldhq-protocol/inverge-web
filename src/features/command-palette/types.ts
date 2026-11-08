import type { IconSvgElement } from "@hugeicons/react";

export type PaletteContext = "public" | "product" | "admin";

/**
 * One local command. These are navigation and entry-point actions that exist in
 * the app; none of them invent a route or a backend capability.
 */
export type PaletteCommand = {
  id: string;
  label: string;
  group: string;
  href: string;
  icon: IconSvgElement;
  description?: string | undefined;
  /** Search aliases, not displayed. "bookmarks" should find "Saved". */
  keywords: string[];
};
