import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";

const toneClasses = {
  brand: "bg-brand/10 text-brand-strong",
  soft: "bg-brand-soft text-brand-strong",
  forest: "bg-contrast text-white",
  plain: "bg-canvas text-ink",
} as const;

const sizeClasses = {
  sm: "size-8 rounded-lg",
  md: "size-10 rounded-xl",
  lg: "size-12 rounded-2xl",
} as const;

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;

/**
 * A small icon in a tinted tile.
 *
 * Accepts a raw Hugeicons descriptor so every surface draws from the one icon
 * set. The tile is decorative: the adjacent text always carries the meaning.
 */
export function IconTile({
  icon,
  tone = "brand",
  size = "md",
  className = "",
}: {
  icon: IconSvgElement;
  tone?: keyof typeof toneClasses;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center ${sizeClasses[size]} ${toneClasses[tone]} ${className}`}
    >
      <HugeiconsIcon icon={icon} size={iconSizes[size]} strokeWidth={1.7} />
    </span>
  );
}
