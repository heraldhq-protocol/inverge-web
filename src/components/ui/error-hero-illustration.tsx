type ErrorHeroIllustrationProps = {
  variant?: "error" | "not-found";
  className?: string;
};

export function ErrorHeroIllustration({
  variant = "error",
  className = "",
}: ErrorHeroIllustrationProps) {
  const isNotFound = variant === "not-found";

  return (
    <div
      className={`relative mx-auto flex h-24 w-28 items-center justify-center sm:h-28 sm:w-32 ${className}`}
      aria-hidden="true"
    >
      {/* Background card (soft sage tint, shifted up and left) */}
      <div className="absolute left-1.5 top-1 size-18 rounded-2xl bg-[#e6f4ec] sm:left-2 sm:top-1.5 sm:size-22 sm:rounded-3xl" />

      {/* Radiating accent lines (upper right of front card) */}
      <div className="absolute -right-3 -top-3 pointer-events-none sm:-right-3.5 sm:-top-3.5">
        <svg
          className={`size-7 ${isNotFound ? "text-brand/50" : "text-[#e88b80]"}`}
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          {/* Three fanned rays radiating outward */}
          <line x1="6" y1="18" x2="10" y2="8" />
          <line x1="12" y1="16" x2="21" y2="7" />
          <line x1="18" y1="16" x2="26" y2="19" />
        </svg>
      </div>

      {/* Foreground card (elevated white card with soft shadow) */}
      <div className="relative z-10 flex size-18 items-center justify-center rounded-2xl border border-border/80 bg-surface shadow-[0_8px_24px_rgba(0,0,0,0.05)] sm:size-22 sm:rounded-3xl">
        {isNotFound ? (
          <div className="flex size-9 items-center justify-center rounded-full bg-brand/10 text-brand-strong sm:size-10">
            <span className="font-mono text-xs font-bold tracking-tight sm:text-sm">
              404
            </span>
          </div>
        ) : (
          <div className="flex size-9 items-center justify-center rounded-full bg-[#fcece9] text-danger sm:size-10">
            <span className="font-serif text-base font-bold leading-none sm:text-lg">
              !
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
