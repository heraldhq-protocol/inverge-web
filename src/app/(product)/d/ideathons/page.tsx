import type { Metadata } from "next";
import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Calendar03Icon,
  InformationCircleIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";

import { StatePanel } from "@/components/ui/state-panel";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionToken } from "@/features/auth/server/session";
import { RetryButton } from "@/features/programmes/components/retry-button";
import { PhaseBadge } from "@/features/programmes/components/phase-badge";
import { fetchPublicProgrammes } from "@/features/programmes/api/public";
import {
  entryModeLabel,
  formatDateRange,
  isPast,
  PROGRAMME_TYPE_LABELS,
  splitProgrammes,
} from "@/features/programmes/lib/public-programme";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ideathons",
  description:
    "Your Inverge programme workspace: open briefs, registration, entries and published results.",
};

/**
 * The participant hub.
 *
 * The catalogue is real API data. A workspace link opens the per-programme
 * page, which performs the authenticated reads. Preview sign-in is explicit
 * about having no backend identity rather than pretending a registration was
 * saved.
 */
export default async function IdeathonsPage() {
  const preview = isPreviewAuth();
  const token = preview ? null : await readSessionToken();
  const result = await fetchPublicProgrammes();
  const programmes = result.ok ? result.data : [];
  const { live, upcoming } = splitProgrammes(programmes);
  const open = [...live, ...upcoming].sort(
    (left, right) =>
      new Date(left.timeline.registrationOpensAt).getTime() -
      new Date(right.timeline.registrationOpensAt).getTime(),
  );
  const past = programmes.filter(isPast).slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
            Programmes
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
            Ideathons
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
            Enter a brief, submit an idea, and see the result the published
            scoring method produces. Your drafts stay private until you submit.
          </p>
        </div>
        <Link
          href="/ideathon/past"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/40 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Past editions
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            size={15}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </Link>
      </div>

      {preview ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-warning/25 bg-warning/10 p-4">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-warning-strong"
          />
          <div>
            <p className="text-sm font-semibold text-ink">
              Preview sign-in cannot save a registration or entry.
            </p>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-ink-soft">
              This environment uses a local preview identity with no backend
              account. You can read every brief and published result. To enter,
              sign in against the API so the server can attach a real session to
              the request. Nothing on this page records a false entry.
            </p>
          </div>
        </div>
      ) : !token ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-muted"
          />
          <div>
            <p className="text-sm font-semibold text-ink">
              Sign in to manage entries.
            </p>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-muted">
              Browsing is free. Registration, drafts and submissions need a
              confirmed Inverge account.
            </p>
          </div>
        </div>
      ) : null}

      <section aria-labelledby="open-programmes" className="mt-8">
        <h2
          id="open-programmes"
          className="text-sm font-bold tracking-[-0.02em] text-ink"
        >
          Open and upcoming
        </h2>

        <div className="mt-3">
          {!result.ok ? (
            <StatePanel
              variant="unavailable"
              eyebrow="Programmes"
              title="The programme service is unavailable"
              description="We could not load your programmes. This is a service failure, not an empty list; no status has changed."
              action={<RetryButton label="Reload programmes" />}
            />
          ) : open.length === 0 ? (
            <StatePanel
              variant="empty"
              eyebrow="Programmes"
              title="Nothing is open right now"
              description="When the next brief is published it will appear here with its dates and entry rules. Past editions and their results stay available."
              action={
                <Link
                  href="/ideathon/past"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Browse past editions
                </Link>
              }
            />
          ) : (
            <ul className="grid gap-3 lg:grid-cols-2">
              {open.map((programme) => (
                <li
                  key={programme.id}
                  className="flex min-w-0 flex-col justify-between rounded-2xl border border-border bg-surface p-5"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <PhaseBadge phase={programme.phase} />
                      <span className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-muted">
                        {PROGRAMME_TYPE_LABELS[programme.type]}
                      </span>
                    </div>
                    <h3 className="mt-3 text-balance text-lg font-bold tracking-[-0.03em] text-ink">
                      {programme.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
                      {programme.tagline}
                    </p>
                    <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs">
                      <div className="flex items-start gap-2">
                        <dt className="sr-only">Dates</dt>
                        <dd className="flex items-start gap-2 text-muted">
                          <HugeiconsIcon
                            icon={Calendar03Icon}
                            size={14}
                            strokeWidth={1.8}
                            aria-hidden="true"
                            className="mt-0.5 shrink-0"
                          />
                          {formatDateRange(
                            programme.timeline.registrationOpensAt,
                            programme.timeline.judgingEndsAt,
                          )}
                        </dd>
                      </div>
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="text-muted">Entry</dt>
                        <dd className="font-semibold text-ink">
                          {entryModeLabel(programme.entryPolicy.entryMode)}
                        </dd>
                      </div>
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="text-muted">Entries recorded</dt>
                        <dd className="font-semibold tabular-nums text-ink">
                          {programme.entryCount}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/d/ideathons/${programme.slug}`}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-contrast px-4 text-sm font-semibold text-white transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      Open workspace
                      <HugeiconsIcon
                        icon={ArrowRight02Icon}
                        size={14}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </Link>
                    <Link
                      href={`/ideathon/${programme.slug}`}
                      className="inline-flex min-h-11 items-center rounded-xl border border-border bg-canvas px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      Read the brief
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {past.length > 0 ? (
        <section aria-labelledby="past-programmes" className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="past-programmes"
              className="text-sm font-bold tracking-[-0.02em] text-ink"
            >
              Recently closed
            </h2>
            <Link
              href="/ideathon/past"
              className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-brand-strong hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              All past editions
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={13}
                strokeWidth={2}
                aria-hidden="true"
              />
            </Link>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {past.map((programme) => (
              <li key={programme.id}>
                <Link
                  href={`/ideathon/${programme.slug}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {programme.title}
                    </span>
                    <span className="block text-xs text-muted">
                      {programme.results
                        ? `Results published ${programme.results.revision ? `revision ${programme.results.revision}` : ""}`.trim()
                        : "No public results"}
                    </span>
                  </span>
                  <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    size={15}
                    strokeWidth={1.9}
                    aria-hidden="true"
                    className="shrink-0 text-muted"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8 grid gap-4 border-t border-border pt-6 md:grid-cols-2">
        <div className="flex gap-3">
          <HugeiconsIcon
            icon={Shield01Icon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-brand-strong"
          />
          <div>
            <h2 className="text-sm font-bold text-ink">
              Judging is not a popularity vote
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              Each edition publishes its method, rubric and missing-evaluation
              policy. Sponsorship never enters the score. Read the{" "}
              <Link
                href="/ideathon/rules"
                className="font-semibold text-brand-strong underline decoration-brand/25 underline-offset-4 hover:decoration-brand"
              >
                ranking rules
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-brand-strong"
          />
          <div>
            <h2 className="text-sm font-bold text-ink">Drafts are private</h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              A draft is visible only to you. Submitting freezes a snapshot;
              later edits to the underlying idea do not change what judges
              scored.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
