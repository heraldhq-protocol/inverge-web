import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { StatePanel } from "@/components/ui/state-panel";
import { FeedbackBuilder } from "@/features/feedback/components/feedback-builder";
import { getFeedbackBuilderView } from "@/features/feedback/server/builder";

export const metadata: Metadata = {
  title: "Feedback and community",
  description:
    "Configure the feedback form and optional community invitation for one of your ideas.",
};

type PageProps = { params: Promise<{ id: string }> };

export default async function FeedbackBuilderPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getFeedbackBuilderView(id);

  if (result.status === "not_found") notFound();
  if (result.status === "signed_out") {
    redirect(
      `/auth?next=${encodeURIComponent(`/d/creator/ideas/${id}/feedback`)}`,
    );
  }
  if (result.status === "unavailable") {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <StatePanel
          variant="error"
          eyebrow="Feedback unavailable"
          title="We couldn't load this feedback form"
          description={result.reason}
          action={
            <Link
              href={`/d/creator/ideas/${id}/feedback`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Try again
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <FeedbackBuilder
      idea={result.view.idea}
      initialCommunity={result.view.community}
      initialForm={result.view.form}
      mode={result.view.dataSource}
    />
  );
}
