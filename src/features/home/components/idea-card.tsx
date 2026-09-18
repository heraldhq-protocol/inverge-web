import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { IdeaArtwork } from "@/features/home/components/idea-artwork";
import { formatCompactNaira } from "@/features/home/lib/format-money";
import type { IdeaSummary } from "@/features/home/types";

function ValidationProgress({ value }: { value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-ink">{value}% validated</span>
        <span className="text-muted">Validation signal</span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-label="Idea validation progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <span
          className="block h-full rounded-full bg-brand"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function IdeaDetails({
  idea,
  featured,
}: {
  idea: IdeaSummary;
  featured: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col ${featured ? "p-5 sm:p-6" : "p-4 sm:p-5"}`}
    >
      <p className="text-xs font-semibold text-brand-strong">{idea.category}</p>
      <h3
        className={`mt-1 font-bold tracking-[-0.025em] text-ink ${
          featured ? "text-xl" : "text-lg"
        }`}
      >
        <Link
          href="/ideas"
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
        >
          {idea.title}
        </Link>
      </h3>
      <p className="mt-1.5 line-clamp-3 text-sm leading-5 text-muted">
        {idea.description}
      </p>

      <div className="mt-4 flex items-center gap-2 text-xs text-ink">
        <span className="grid size-7 place-items-center rounded-full bg-contrast text-[0.625rem] font-bold text-white">
          {idea.creatorInitials}
        </span>
        <span className="font-medium">{idea.creator}</span>
      </div>

      <div className="mt-4">
        <ValidationProgress value={idea.validationPercent} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
        <div>
          <dt className="text-[0.6875rem] text-muted">Supporters</dt>
          <dd className="mt-0.5 font-mono text-base font-semibold text-ink">
            {idea.supporters.toLocaleString("en-NG")}
          </dd>
        </div>
        <div>
          <dt className="text-[0.6875rem] text-muted">Pre-pledged intent</dt>
          <dd className="mt-0.5 font-mono text-base font-semibold text-ink">
            {formatCompactNaira(idea.prePledged)}
          </dd>
        </div>
      </dl>

      {featured ? (
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-strong">
          <ArrowUpRight className="size-4" aria-hidden="true" />
          Gaining momentum
        </p>
      ) : null}
    </div>
  );
}

export function IdeaCard({
  idea,
  variant = "standard",
}: {
  idea: IdeaSummary;
  variant?: "compact" | "featured" | "standard";
}) {
  if (variant === "compact") {
    return (
      <article className="grid min-h-40 grid-cols-[7.25rem_minmax(0,1fr)] overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-md sm:grid-cols-[8.5rem_minmax(0,1fr)]">
        <IdeaArtwork compact variant={idea.artwork} />
        <div className="flex min-w-0 flex-col p-4">
          <p className="text-[0.6875rem] font-semibold text-brand-strong">
            {idea.category}
          </p>
          <h3 className="mt-0.5 text-base font-bold leading-tight tracking-tight text-ink">
            <Link href="/ideas">{idea.title}</Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-4 text-muted">
            {idea.description}
          </p>
          <div className="mt-auto flex items-center gap-3 pt-3 text-[0.6875rem] text-muted">
            <span>{idea.supporters} supporters</span>
            <span aria-hidden="true">•</span>
            <span>{idea.validationPercent}% validated</span>
          </div>
        </div>
      </article>
    );
  }

  const isFeatured = variant === "featured";

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-md ${
        isFeatured
          ? "md:grid md:grid-cols-[1.2fr_0.9fr]"
          : "flex h-full flex-col"
      }`}
    >
      <IdeaArtwork variant={idea.artwork} />
      <IdeaDetails idea={idea} featured={isFeatured} />
    </article>
  );
}
