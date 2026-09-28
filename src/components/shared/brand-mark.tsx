import Link from "next/link";

export function BrandMark({
  compact = false,
  href = "/",
  inverted = false,
}: {
  compact?: boolean;
  href?: string;
  inverted?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 shrink-0 items-center rounded-md transition-[gap] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${
        compact ? "gap-0" : "gap-2.5"
      } ${inverted ? "text-white" : "text-ink"}`}
      aria-label="Inverge home"
    >
      <svg
        aria-hidden="true"
        className="size-8 text-brand"
        viewBox="0 0 32 32"
        fill="none"
      >
        <rect width="32" height="32" rx="9" fill="currentColor" />
        <path d="M8 22C11 12 18 8 24 9C23 15 19 22 8 22Z" fill="white" />
      </svg>
      <span
        className={`overflow-hidden whitespace-nowrap text-xl font-bold tracking-[-0.04em] transition-[max-width,opacity,transform] duration-200 ease-out ${
          compact
            ? "max-w-0 -translate-x-1 opacity-0"
            : "max-w-28 translate-x-0 opacity-100"
        }`}
      >
        inverge
      </span>
    </Link>
  );
}
