import Link from "next/link";

/**
 * Breadcrumb trail.
 *
 * The last step is the current page and is never a link. Every other step is a
 * real route, so a reader can always walk back up the hierarchy.
 */
export function CampaignBreadcrumbs({
  trail,
}: {
  trail: readonly { href?: string; label: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {trail.map((step, index) => {
          const isLast = index === trail.length - 1;

          return (
            <li
              key={`${step.label}-${index}`}
              className="flex items-center gap-1.5"
            >
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {step.href && !isLast ? (
                <Link
                  href={step.href}
                  className="rounded font-medium text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {step.label}
                </Link>
              ) : (
                <span className={isLast ? "truncate text-ink" : undefined}>
                  {step.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
