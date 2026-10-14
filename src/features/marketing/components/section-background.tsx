import Image from "next/image";

const backgrounds = {
  canvas: "/images/bg/minimal-emerald-layered-waves.png",
  forest: "/images/bg/forest-green-contour-waves.png",
  pattern: "/images/bg/minimalist-mint-leaf-wave-pattern.png",
} as const;

export type BackgroundTone = keyof typeof backgrounds;

type SectionBackgroundProps = {
  tone: BackgroundTone;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/**
 * Decorative background art for marketing sections and tiles.
 *
 * Renders a non-interactive, hidden-from-assistive-tech image that fills its
 * nearest positioned ancestor. Callers own the overlay needed for legibility.
 */
export function SectionBackground({
  tone,
  priority = false,
  sizes = "100vw",
  className = "",
}: SectionBackgroundProps) {
  return (
    <Image
      src={backgrounds[tone]}
      alt=""
      aria-hidden="true"
      fill
      priority={priority}
      sizes={sizes}
      className={`pointer-events-none select-none object-cover ${className}`}
    />
  );
}
