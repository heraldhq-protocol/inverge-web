import { ArrowRight, BookOpen, Home } from "lucide-react";
import Link from "next/link";

import { StateIllustration } from "@/components/ui/state-illustration";
import { ErrorPageLayout } from "@/features/marketing/components/error-page-layout";

export default function NotFound() {
  return (
    <ErrorPageLayout>
      {/* Decorative illustration */}
      <StateIllustration variant="not-found" />

      {/* Eyebrow */}
      <div className="mt-5 flex items-center justify-center gap-2 sm:mt-6">
        <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
          Page not found
        </p>
      </div>

      {/* Primary heading */}
      <h1 className="mt-2.5 text-balance text-2xl font-bold tracking-[-0.035em] text-ink sm:mt-3 sm:text-3xl lg:text-4xl">
        We couldn&apos;t find this page.
      </h1>

      {/* Subtitle / body */}
      <p className="mx-auto mt-2 max-w-md text-balance text-sm leading-relaxed text-muted sm:mt-3 sm:text-base">
        The link you followed may be broken, or the page may have been moved or
        removed. Check the address or head back home.
      </p>

      {/* Action buttons */}
      <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:mt-6 sm:flex-row sm:gap-3.5">
        <Link
          href="/"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-auto"
        >
          <Home className="size-4" aria-hidden="true" />
          <span>Go to home</span>
        </Link>

        <Link
          href="/guides"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-5 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-brand/40 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-auto"
        >
          <BookOpen className="size-4" aria-hidden="true" />
          <span>Explore guides</span>
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
    </ErrorPageLayout>
  );
}
