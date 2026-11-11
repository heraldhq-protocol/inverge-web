"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function AdminReviewRefresh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      {pending ? "Refreshing…" : "Refresh review"}
    </Button>
  );
}

export function AdminReviewUnavailable({ message }: { message: string }) {
  return (
    <section className="mx-auto max-w-7xl rounded-2xl border border-border bg-surface p-5">
      <h1 className="text-xl font-bold text-ink">
        Campaign review unavailable
      </h1>
      <p role="alert" className="my-4 text-sm leading-6 text-muted">
        {message}
      </p>
      <AdminReviewRefresh />
    </section>
  );
}
