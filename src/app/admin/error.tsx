"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <section className="mx-auto max-w-3xl rounded-xl border border-border bg-surface p-6">
      <div role="alert">
        <h1 className="text-xl font-semibold text-ink">
          This admin view could not load
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Try loading the view again. Any previously submitted action should be
          checked before you repeat it.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 cursor-pointer focus-visible:outline-brand-strong"
        onClick={retry}
      >
        Try again
      </Button>
    </section>
  );
}
