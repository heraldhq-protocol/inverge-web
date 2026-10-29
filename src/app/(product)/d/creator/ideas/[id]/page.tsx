import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  Analytics01Icon,
  ArrowUpRight01Icon,
  Coins01Icon,
  Comment01Icon,
  Idea01Icon,
  MessageMultiple01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Amount } from "@/components/ui/amount";
import { MetricCard } from "@/components/ui/metric-card";
import { Pill } from "@/components/ui/pill";
import { StatePanel } from "@/components/ui/state-panel";
import { SubmissionSummary } from "@/features/feedback/components/submission-summary";
import { IdeaCover } from "@/features/ideas/components/idea-cover";
import { IdeaWorkspaceTabs } from "@/features/ideas/components/idea-workspace-tabs";
import {
  ideaStatusLabel,
  ideaStatusTone,
  ideaUpdatedLabel,
  ideaVisibilityLabel,
} from "@/features/ideas/lib/creator-rows";
import { getIdeaWorkspaceView } from "@/features/ideas/server/idea-workspace";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getIdeaWorkspaceView(id);

  return {
    title:
      result.status === "ready"
        ? `${result.view.idea.title} | Creator Studio`
        : "Idea workspace",
    description:
      "One idea's workspace: its state, support, feedback, and the sections that exist for it.",
  };
}

/**
 * The per-idea workspace reached from My ideas (D-017).
 *
 * The view model resolves the id against the account's own idea list and
 * returns null for anything else, so a hand-edited URL can never reach another
 * creator's idea. Header links render only for routes that resolve for this
 * idea: a draft with no published record has no public page, and only the idea
 * with an analytics dataset gets analytics.
 */
export default async function IdeaWorkspacePage({ params }: PageProps) {
  const { id } = await params;
  const result = await getIdeaWorkspaceView(id);
  if (result.status === "not_found") notFound();
  if (result.status === "signed_out") {
    redirect(`/auth?next=${encodeURIComponent(`/d/creator/ideas/${id}`)}`);
  }
  if (result.status === "unavailable") {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <StatePanel
          variant="error"
          eyebrow="Idea workspace unavailable"
          title="We couldn't load this idea"
          description={result.reason}
          action={
            <Link
              href={`/d/creator/ideas/${id}`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Try again
            </Link>
          }
        />
      </div>
    );
  }

  const view = result.view;
  const { idea, analyticsHref, dataSource, detailHref, feedbackHref, feedbackCount } =
    view;
  const updated = ideaUpdatedLabel(idea.updatedAt);

  const actions = [
    detailHref
      ? {
          href: detailHref,
          icon: ArrowUpRight01Icon,
          label: "View public idea",
        }
      : null,
    feedbackHref
      ? {
          href: feedbackHref,
          icon: MessageMultiple01Icon,
          label: "Feedback setup",
        }
      : null,
    analyticsHref
      ? { href: analyticsHref, icon: Analytics01Icon, label: "Analytics" }
      : null,
  ].filter((action): action is NonNullable<typeof action> => action !== null);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <Link
          href="/d/creator/ideas"
          className="font-semibold hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
        >
          My ideas
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{idea.title}</span>
      </nav>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:size-20">
            <IdeaCover
              artwork={idea.artwork}
              cover={idea.cover}
              alt=""
              sizes="80px"
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={ideaStatusTone(idea.status)} size="sm">
                {ideaStatusLabel[idea.status]}
              </Pill>
              <span className="text-xs text-muted">
                {ideaVisibilityLabel(idea)}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
              {idea.title}
            </h1>
            <p className="mt-0.5 text-xs text-muted">
              {idea.category}
              {updated ? ` · Updated ${updated}` : ""}
            </p>
          </div>
        </div>

        {actions.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {actions.map((action) => (
              <li key={action.href}>
                <Link
                  href={action.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand-strong hover:bg-brand-soft hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
                >
                  <HugeiconsIcon
                    icon={action.icon}
                    size={16}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  {action.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs leading-5 text-muted">
            This draft has never been published, so it has no public page or
            feedback setup yet.
          </p>
        )}
      </div>

      <div className="mt-4">
        <IdeaWorkspaceTabs
          active="overview"
          analyticsHref={analyticsHref}
          feedbackHref={feedbackHref}
          ideaId={idea.id}
        />
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Supporters"
          icon={UserMultiple02Icon}
          value={idea.supporters.toLocaleString("en-US")}
          hint="People who signaled support for this idea."
        />
        <MetricCard
          label="Feedback responses"
          icon={Comment01Icon}
          value={feedbackCount.toLocaleString("en-US")}
          hint="Structured responses to this idea's feedback form."
        />
        <MetricCard
          label="Validation"
          icon={Idea01Icon}
          value={`${idea.validationPercent}%`}
          hint="Progress toward this idea's validation threshold."
        />
        <MetricCard
          label="Pre-pledged intent"
          icon={Coins01Icon}
          value={<Amount value={idea.prePledged} compact />}
          hint="Non-binding interest. No money has moved."
        />
      </dl>

      {view.summary ? (
        <section aria-labelledby="workspace-summary" className="mt-7">
          <h2
            id="workspace-summary"
            className="text-base font-bold tracking-[-0.02em] text-ink"
          >
            What this idea proposes
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-sm font-semibold text-ink">The problem</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                {view.summary.problem}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-sm font-semibold text-ink">
                The proposed solution
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                {view.summary.solution}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <p className="mt-6 max-w-3xl text-xs leading-5 text-muted">
          This idea has never been published, so there is no public presentation
          to review here. Its metrics update when the idea leaves draft.
        </p>
      )}

      <section aria-labelledby="workspace-feedback" className="mt-7">
        <div className="flex items-end justify-between gap-4">
          <h2
            id="workspace-feedback"
            className="text-base font-bold tracking-[-0.02em] text-ink"
          >
            Latest feedback
          </h2>
          {dataSource === "preview" && feedbackCount > 0 ? (
            <Link
              href="/d/creator/feedback"
              className="text-sm font-semibold text-brand-strong hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
            >
              Open feedback inbox
            </Link>
          ) : null}
        </div>

        {dataSource === "live" && feedbackCount > 0 ? (
          <p className="mt-3 rounded-2xl border border-border bg-surface px-4 py-5 text-sm leading-6 text-muted">
            {feedbackCount} {feedbackCount === 1 ? "response" : "responses"}{" "}
            are counted for this idea. The API does not expose a creator
            response list yet, so individual answers are not shown here.
          </p>
        ) : feedbackCount > 0 ? (
          <>
            <p className="mt-1 text-xs text-muted">
              {feedbackCount} {feedbackCount === 1 ? "response" : "responses"},
              newest first.
            </p>
            <ul className="mt-3 grid gap-3">
              {view.latestFeedback.map((response) => (
                <li key={response.submittedAt}>
                  <SubmissionSummary
                    submittedAt={response.submittedAt}
                    answers={response.answers}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed border-border-strong bg-surface px-5 py-8 text-center">
            <p className="text-base font-bold text-ink">No responses yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted">
              {feedbackHref
                ? "Set the questions once, share the idea, and responses arrive here."
                : "This idea has no public page yet, so nobody can answer a form for it."}
            </p>
            {feedbackHref ? (
              <div className="mt-4 flex justify-center">
                <Link
                  href={feedbackHref}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-strong px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-strong/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
                >
                  <HugeiconsIcon
                    icon={MessageMultiple01Icon}
                    size={16}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  Set up feedback
                </Link>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <p className="mt-6 max-w-3xl text-xs leading-5 text-muted">
        {dataSource === "live"
          ? "This workspace reads the idea and its ownership from the API. The response list is not connected yet."
          : "Preview workspace. Support, validation, and responses come from fixtures until idea persistence is connected; nothing here writes to an API."}
      </p>
    </div>
  );
}
