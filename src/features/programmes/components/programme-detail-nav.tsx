const sections = [
  { href: "#overview", label: "Overview" },
  { href: "#eligibility", label: "Eligibility" },
  { href: "#timeline", label: "Timeline" },
  { href: "#judging", label: "Judging" },
  { href: "#entries", label: "Entries" },
  { href: "#leaderboard", label: "Leaderboard" },
  { href: "#faqs", label: "FAQs" },
] as const;

/**
 * In-page navigation for a programme.
 *
 * Anchors, not a custom tab widget: each section has a real destination, works
 * without JavaScript and remains navigable with a screen reader's heading list.
 */
export function ProgrammeDetailNav() {
  return (
    <nav
      aria-label="Programme sections"
      className="border-y border-border bg-canvas/95"
    >
      <ul className="-mx-5 flex items-center gap-1 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        {sections.map((section) => (
          <li key={section.href} className="shrink-0">
            <a
              href={section.href}
              className="inline-flex min-h-12 items-center px-3 text-sm font-semibold text-muted transition-colors first:pl-0 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
