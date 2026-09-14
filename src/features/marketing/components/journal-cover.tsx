import type { EditorialEntry } from "@/features/marketing/content/editorial";

const coverLabels = {
  signal: {
    eyebrow: "Signal before spend",
    mark: "01",
    bars: ["w-4/5", "w-2/3", "w-1/2"],
  },
  milestones: {
    eyebrow: "Release by proof",
    mark: "02",
    bars: ["w-full", "w-3/4", "w-1/3"],
  },
  refunds: {
    eyebrow: "Know the boundary",
    mark: "03",
    bars: ["w-full", "w-3/5", "w-2/5"],
  },
  questions: {
    eyebrow: "Read before backing",
    mark: "07",
    bars: ["w-2/3", "w-5/6", "w-1/2"],
  },
} as const;

type JournalCoverProps = {
  cover: NonNullable<EditorialEntry["cover"]>;
  title: string;
  size?: "compact" | "header";
  className?: string;
};

export function JournalCover({
  cover,
  title,
  size = "compact",
  className = "",
}: JournalCoverProps) {
  const design = coverLabels[cover];
  const isHeader = size === "header";

  return (
    <div
      role="img"
      aria-label={`Editorial cover for ${title}`}
      className={`relative overflow-hidden bg-contrast text-white ${
        isHeader
          ? "aspect-[21/9] sm:aspect-[3/1] rounded-2xl p-6 sm:p-8"
          : "aspect-[2.2/1] w-full p-5 sm:p-6"
      } ${className}`}
    >
      {/* Subtle decorative geometry without oversized shapes */}
      <div
        aria-hidden="true"
        className="absolute -right-8 -top-12 size-40 rounded-full border-[20px] border-brand/15"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-16 -left-10 size-36 rounded-full bg-brand/10"
      />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
            Inverge journal
          </span>
          <span className="grid size-7 place-items-center rounded-md bg-brand font-mono text-[11px] font-bold text-white">
            {design.mark}
          </span>
        </div>

        <div>
          <p
            className={`font-bold tracking-tight text-white ${
              isHeader ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
            }`}
          >
            {design.eyebrow}
          </p>
          <div className="mt-2.5 flex gap-1.5" aria-hidden="true">
            {design.bars.map((width, index) => (
              <span
                key={width}
                className={`block h-1.5 rounded-full ${width} ${
                  index === 0 ? "bg-brand" : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
