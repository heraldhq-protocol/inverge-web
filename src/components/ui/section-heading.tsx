import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function SectionHeading({
  actionHref,
  actionLabel,
  description,
  title,
}: {
  actionHref: string;
  actionLabel: string;
  description?: string;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 max-w-2xl text-sm leading-5 text-muted">
            {description}
          </p>
        ) : null}
      </div>
      <Link
        href={actionHref}
        className="hidden min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-brand-strong transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:inline-flex"
      >
        {actionLabel}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
