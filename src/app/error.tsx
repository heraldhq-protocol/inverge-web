"use client";

import { ArrowRight, Home, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { ErrorHeroIllustration } from "@/components/ui/error-hero-illustration";
import { ErrorPageLayout } from "@/components/ui/error-page-layout";
import { ErrorReferenceBadge } from "@/components/ui/error-reference-badge";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log runtime error for diagnostic observability
    console.error("Runtime error caught by error boundary:", error);
  }, [error]);

  const referenceCode = error.digest
    ? `IVG-${error.digest.slice(0, 6).toUpperCase()}`
    : "IVG-8F21";

  return (
    <ErrorPageLayout>
      {/* Decorative illustration */}
      <ErrorHeroIllustration variant="error" />

      {/* Eyebrow */}
      <div className="mt-5 flex items-center justify-center gap-2 sm:mt-6">
        <span className="size-1.5 rounded-full bg-danger" aria-hidden="true" />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
          Something went wrong
        </p>
      </div>

      {/* Primary heading */}
      <h1 className="mt-2.5 text-balance text-2xl font-bold tracking-[-0.035em] text-ink sm:mt-3 sm:text-3xl lg:text-4xl">
        We couldn&apos;t load this page.
      </h1>

      {/* Subtitle / body */}
      <p className="mx-auto mt-2 max-w-md text-balance text-sm leading-relaxed text-muted sm:mt-3 sm:text-base">
        Something unexpected happened. Try again — your previous actions
        haven&apos;t been repeated.
      </p>

      {/* Action buttons */}
      <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:mt-6 sm:flex-row sm:gap-3.5">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-auto"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          <span>Try again</span>
        </button>

        <Link
          href="/"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-5 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-brand/40 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-auto"
        >
          <Home className="size-4" aria-hidden="true" />
          <span>Go to home</span>
        </Link>
      </div>

      {/* Support text link */}
      <div className="mt-5 sm:mt-6">
        <Link
          href="/contact"
          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-brand-strong transition-colors hover:text-brand sm:text-sm"
        >
          <span>Still having trouble? Contact support</span>
          <ArrowRight
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>

      {/* Reference code */}
      <div className="mt-6 border-t border-border/40 pt-4">
        <ErrorReferenceBadge referenceCode={referenceCode} />
      </div>
    </ErrorPageLayout>
  );
}
