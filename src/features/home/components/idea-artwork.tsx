import { Bike, GraduationCap, Leaf, Palette, Store, Sun } from "lucide-react";

import type { IdeaArtworkVariant } from "@/features/home/types";

const artwork = {
  campus: {
    Icon: Store,
    background: "from-emerald-950 via-emerald-800 to-lime-600",
    accent: "bg-lime-300/25",
  },
  community: {
    Icon: GraduationCap,
    background: "from-amber-950 via-orange-800 to-amber-500",
    accent: "bg-orange-200/25",
  },
  creative: {
    Icon: Palette,
    background: "from-fuchsia-950 via-rose-800 to-orange-500",
    accent: "bg-pink-200/25",
  },
  energy: {
    Icon: Sun,
    background: "from-sky-950 via-sky-700 to-amber-400",
    accent: "bg-yellow-200/30",
  },
  food: {
    Icon: Leaf,
    background: "from-stone-950 via-emerald-800 to-lime-500",
    accent: "bg-emerald-200/25",
  },
  logistics: {
    Icon: Bike,
    background: "from-emerald-950 via-green-700 to-teal-400",
    accent: "bg-teal-200/25",
  },
} as const;

export function IdeaArtwork({
  compact = false,
  featured = false,
  variant,
}: {
  compact?: boolean;
  featured?: boolean;
  variant: IdeaArtworkVariant;
}) {
  const { Icon, background, accent } = artwork[variant];

  return (
    <div
      aria-hidden="true"
      className={`relative isolate min-w-0 overflow-hidden bg-gradient-to-br ${background} ${
        compact
          ? "h-full min-h-28"
          : featured
            ? "aspect-[16/9] min-h-52 md:min-h-0 md:aspect-auto"
            : "aspect-[16/9] min-h-40"
      }`}
    >
      <span
        className={`absolute -right-8 -top-10 size-36 rounded-full ${accent}`}
      />
      <span className="absolute -bottom-14 -left-10 size-40 rounded-full border-[18px] border-white/10" />
      <span className="absolute left-1/2 top-1/2 h-px w-4/5 -translate-x-1/2 rotate-[-18deg] bg-white/20" />
      <span className="absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.12)_30%,rgba(255,255,255,0.12)_32%,transparent_32%)]" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-16 place-items-center rounded-2xl border border-white/25 bg-black/15 text-white shadow-xl backdrop-blur-sm">
          <Icon className="size-8" strokeWidth={1.45} />
        </span>
      </span>
    </div>
  );
}
