import Link from "next/link";

export function BrandMark({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex min-h-11 items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${inverted ? "text-white" : "text-ink"}`}
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
      <span className="text-xl font-bold tracking-[-0.04em]">inverge</span>
    </Link>
  );
}
