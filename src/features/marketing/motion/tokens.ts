// Motion design tokens for GSAP-based marketing animations
export const DURATIONS = {
  instant: 0.1,
  fast: 0.18,
  base: 0.28,
  slow: 0.48,
  hero: 0.8,
} as const;

export const EASINGS = {
  standard: "power2.out",
  enter: "power3.out",
  exit: "power2.in",
} as const;

export const STAGGER_STEP = 0.06;

export const DISTANCES = {
  8: 8,
  16: 16,
  24: 24,
  32: 32,
} as const;
