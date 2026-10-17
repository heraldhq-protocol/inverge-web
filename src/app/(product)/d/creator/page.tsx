import type { Metadata } from "next";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Comment01Icon,
  Coins01Icon,
  Idea01Icon,
  PlusSignIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Amount } from "@/components/ui/amount";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { CreatorIdeaList } from "@/features/ideas/components/creator-idea-list";
import { CreatorStudioTabs } from "@/features/ideas/components/creator-studio-tabs";
import { getCreatorView } from "@/features/ideas/server/creator-view";

export const metadata: Metadata = {
  title: "Creator Studio",
  description:
    "Build, validate, and grow your ideas: support, feedback, and next steps in one workspace.",
};

/**
 * Creator Studio overview.
 *
 * Metrics come from the same rows the list renders, so the numbers and the
 * records can never disagree. Nothing here implies money has been raised: the
 * only monetary figure is non-binding pre-pledge intent.
 */
export default function CreatorStudioPage() {
  const { feedbackIdea, metrics, nextSteps, rows } = getCreatorView();
  const recent = rows.slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
            Workspace
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
            Creator Studio
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
            Build. Validate. Grow.
          </p>
        </div>
        <Link
          href="/d/creator/ideas/new"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <HugeiconsIcon
            icon={PlusSignIcon}
            size={17}
            strokeWidth={2}
            aria-hidden="true"
          />
          New idea
        </Link>
      </div>

      <div className="mt-5">
        <CreatorStudioTabs active="overview" />
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Published ideas"
          icon={Idea01Icon}
          value={metrics.publishedIdeas.toLocaleString("en-US")}
          hint={
            metrics.draftIdeas > 0
              ? `${metrics.draftIdeas} ${metrics.draftIdeas === 1 ? "draft is" : "drafts are"} still private.`
              : "Every idea you own is listed in discovery."
          }
        />
        <MetricCard
          label="Feedback received"
          icon={Comment01Icon}
          value={metrics.feedbackReceived.toLocaleString("en-US")}
          hint="Structured responses across your ideas. Volume, not a score."
        />
        <MetricCard
          label="Supporters"
          icon={UserMultiple02Icon}
          value={metrics.totalSupporters.toLocaleString("en-US")}
          hint="Support signals across your ideas. One account can support more than one idea."
        />
        <MetricCard
          label="Pre-pledged intent"
          icon={Coins01Icon}
          value={<Amount value={metrics.prePledgedIntent} compact />}
          hint="Non-binding interest. No money has moved and no campaign is open."
        />
      </dl>

      {nextSteps.length > 0 ? (
        <section aria-labelledby="next-steps-heading" className="mt-6">
          <h2
            id="next-steps-heading"
            className="text-base font-bold tracking-[-0.02em] text-ink"
          >
            Suggested next steps
          </h2>
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {nextSteps.map((step) => (
              <li
                key={step.title}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <p className="text-sm font-semibold text-ink">{step.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {step.description}
                </p>
                <Link
                  href={step.href}
                  className="mt-2 inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {step.label}
                  <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    size={13}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-7">
        <SectionHeading
          title="Your ideas"
          description="Drafts stay private until you list them."
          actionHref="/d/creator/ideas"
          actionLabel="View all ideas"
        />
        <CreatorIdeaList
          rows={recent}
          emptyAction={
            <Link
              href="/d/creator/ideas/new"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Start an idea
            </Link>
          }
        />
      </section>

      <section aria-labelledby="tools-heading" className="mt-7">
        <h2
          id="tools-heading"
          className="text-base font-bold tracking-[-0.02em] text-ink"
        >
          Feedback and analytics
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <HugeiconsIcon
                icon={Comment01Icon}
                size={17}
                strokeWidth={1.8}
                aria-hidden="true"
                className="text-brand-strong"
              />
              Feedback
            </p>
            {feedbackIdea ? (
              <>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {feedbackIdea.feedbackResponses} responses are recorded for{" "}
                  {feedbackIdea.title}. Review the form and its questions.
                </p>
                <Link
                  href={feedbackIdea.feedbackHref ?? "/d/creator/ideas"}
                  className="mt-2 inline-flex min-h-9 items-center text-xs font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Open feedback setup
                </Link>
              </>
            ) : (
              <p className="mt-1 text-xs leading-5 text-muted">
                No idea has a feedback form with responses yet. Add questions to
                an idea to start collecting structured feedback.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <HugeiconsIcon
                icon={UserMultiple02Icon}
                size={17}
                strokeWidth={1.8}
                aria-hidden="true"
                className="text-brand-strong"
              />
              Analytics
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Support growth, estimated interest, and feedback breakdowns per
              idea. Basic analytics stay available without a paid plan.
            </p>
            <Link
              href="/d/creator/analytics"
              className="mt-2 inline-flex min-h-9 items-center text-xs font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Open analytics
            </Link>
          </div>
        </div>
      </section>

      <p className="mt-6 max-w-3xl text-xs leading-5 text-muted">
        Preview workspace. Figures come from the same fixture records the public
        idea pages use; no analytics endpoint is connected yet.
      </p>
    </div>
  );
}
