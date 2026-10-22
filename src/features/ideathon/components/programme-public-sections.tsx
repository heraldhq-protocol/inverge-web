import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  StarAward01Icon,
  TrophyIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Amount } from "@/components/ui/amount";
import { NgnEstimate } from "@/components/ui/ngn-estimate";
import { Pill } from "@/components/ui/pill";
import type { Ideathon } from "@/features/ideathon/types";
import {
  SponsorLogo,
  SponsorLogoWall,
  sortSponsorsForDisplay,
} from "@/features/programmes/components/sponsor-logo";
import type { Programme } from "@/features/programmes/types";
import {
  computeLeaderboard,
  formatProgrammeDate,
  moduleAvailabilityLabel,
  moduleLabel,
  prizePoolTotal,
  submissionFor,
} from "@/features/programmes/lib/programme";

function Block({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      id={id}
      className="border-t border-border pt-7"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id={`${id}-title`}
            className="text-xl font-bold tracking-[-0.035em] text-ink sm:text-2xl"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * Public programme detail below the standings. It adapts to the lifecycle:
 * prizes and sponsors show commitments, results stay hidden until the snapshot
 * is published, and modules marked coming soon are never advertised as live.
 */
export function ProgrammePublicSections({
  competition,
  programme,
}: {
  competition: Ideathon;
  programme: Programme;
}) {
  const pool = prizePoolTotal(programme.rewards);
  const leaderboard = computeLeaderboard(programme);
  const resultsPublic = Boolean(programme.snapshot?.published);
  const judging =
    programme.status === "judging" || programme.status === "results_review";

  return (
    <div className="mt-8 space-y-7">
      <Block
        id="overview"
        title="About this edition"
        description={programme.heroCopy || programme.description}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm leading-7 text-ink-soft">
              {programme.description}
            </p>
            <p className="mt-3 text-xs leading-5 text-muted">
              Hosted by {programme.organiser}. Open to {programme.audience.who}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={Calendar03Icon}
                size={15}
                strokeWidth={1.8}
                aria-hidden="true"
                className="text-brand-strong"
              />
              <h3 className="text-sm font-bold text-ink">Timeline</h3>
            </div>
            <ul className="mt-2 space-y-1.5 text-[0.6875rem]">
              {(
                [
                  [
                    "Registration opens",
                    programme.schedule.registrationOpensAt,
                  ],
                  [
                    "Registration closes",
                    programme.schedule.registrationClosesAt,
                  ],
                  ["Submissions close", programme.schedule.submissionClosesAt],
                  ["Judging ends", programme.schedule.judgingEndsAt],
                  ["Results", programme.schedule.resultsAt],
                  ["Event", programme.schedule.eventStartsAt],
                ] as const
              ).map(([label, at]) => (
                <li key={label} className="flex justify-between gap-2">
                  <span className="text-muted">{label}</span>
                  <span className="text-ink">{formatProgrammeDate(at)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Block>

      <Block
        id="prizes"
        title="Prizes and recognition"
        description="What is committed, who fulfils it, and what is still unconfirmed."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {programme.rewards.map((reward) => (
            <div
              key={reward.id}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <Pill
                  size="xs"
                  tone={reward.placement <= 3 ? "accent" : "neutral"}
                >
                  {reward.placement === 1
                    ? "First"
                    : reward.placement === 2
                      ? "Second"
                      : reward.placement === 3
                        ? "Third"
                        : `Place ${reward.placement}`}
                </Pill>
                <Pill
                  size="xs"
                  tone={
                    reward.fundingStatus === "funded" ? "accent" : "warning"
                  }
                >
                  {reward.fundingStatus}
                </Pill>
              </div>
              <h3 className="mt-2 text-sm font-bold text-ink">
                {reward.title}
              </h3>
              <p className="mt-1 text-xs leading-5 text-muted">
                {reward.description}
              </p>
              <p className="mt-2 text-lg font-bold tabular-nums text-ink">
                {reward.amount ? <Amount value={reward.amount} /> : "Non-cash"}
              </p>
              {reward.amount ? (
                <NgnEstimate
                  amount={reward.amount}
                  block
                  className="mt-0.5 text-[0.6875rem] text-muted"
                  showRate
                />
              ) : null}
              <p className="mt-1 text-[0.625rem] text-muted">
                Fulfilled by {reward.fulfilmentOwner} ·{" "}
                {reward.fulfilmentStatus.replace(/_/g, " ")}
              </p>
            </div>
          ))}
          {programme.rewards.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border-strong p-5 text-xs text-muted sm:col-span-2 lg:col-span-3">
              No prizes are committed for this edition. Recognition and
              community support are the only offers.
            </p>
          ) : null}
        </div>
        <p className="mt-3 text-[0.6875rem] leading-5 text-muted">
          Total promised pool:{" "}
          <strong className="text-ink">
            <Amount value={pool} compact />
          </strong>
          .
        </p>
        <NgnEstimate
          amount={pool}
          block
          className="-mt-1 text-[0.6875rem] leading-5 text-muted"
          showRate
        />
        <p className="mt-1 text-[0.6875rem] leading-5 text-muted">
          A prize is recognition, not an investment or a return, and it is
          fulfilled outside the platform.
        </p>
      </Block>

      {programme.sponsors.length > 0 ? (
        <Block
          id="sponsors"
          title="Sponsors and partners"
          description="What each partner contributes. Sponsorship never changes a score or rank."
        >
          <div className="mb-4 rounded-2xl border border-border bg-canvas p-4">
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted">
              Brands backing this round
            </p>
            <div className="mt-3">
              <SponsorLogoWall sponsors={programme.sponsors} />
            </div>
            <p className="mt-3 text-[0.625rem] leading-5 text-muted">
              A mark appears when the partner supplies one; otherwise their
              initials stand in. A logo shows support for the round, not an
              endorsement of any result.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {sortSponsorsForDisplay(programme.sponsors).map((sponsor) => (
              <li
                key={sponsor.id}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <SponsorLogo sponsor={sponsor} size="sm" />
                    <div>
                      <h3 className="text-sm font-bold text-ink">
                        {sponsor.name}
                      </h3>
                      <p className="text-[0.6875rem] capitalize text-muted">
                        {sponsor.tier} sponsor
                      </p>
                    </div>
                  </div>
                  <HugeiconsIcon
                    icon={StarAward01Icon}
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className="text-brand-strong"
                  />
                </div>
                <ul className="mt-2 space-y-1">
                  {sponsor.deliverables.map((deliverable) => (
                    <li
                      key={deliverable}
                      className="flex gap-1.5 text-[0.6875rem] text-muted"
                    >
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        size={12}
                        strokeWidth={2}
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-brand-strong"
                      />
                      {deliverable}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[0.625rem] text-muted">
                  {sponsor.invoiceStatus === "paid" &&
                  sponsor.confirmedByProvider
                    ? "Commitment confirmed"
                    : "Commitment being confirmed"}
                </p>
              </li>
            ))}
          </ul>
        </Block>
      ) : null}

      <Block
        id="people"
        title="Judges and mentors"
        description="Who evaluates the work and who is available to help."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <h3 className="text-sm font-bold text-ink">Judges</h3>
            <ul className="mt-2 space-y-2">
              {programme.rubric.judges
                .filter((judge) => judge.conflict !== "excluded")
                .map((judge) => (
                  <li key={judge.id} className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-full bg-brand-soft text-[0.625rem] font-bold text-brand-strong">
                      {judge.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-ink">
                        {judge.name}
                      </p>
                      <p className="text-[0.625rem] text-muted">
                        {judge.affiliation}
                      </p>
                    </div>
                  </li>
                ))}
              {programme.rubric.judges.length === 0 ? (
                <p className="text-xs text-muted">
                  Judges are announced before judging begins.
                </p>
              ) : null}
            </ul>
            {judging ? (
              <p className="mt-2 rounded-lg bg-canvas px-2.5 py-1.5 text-[0.625rem] text-muted">
                Judging is in progress. Individual scores stay private.
              </p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <h3 className="text-sm font-bold text-ink">Mentors</h3>
            <ul className="mt-2 space-y-2">
              {programme.experts.map((expert) => (
                <li key={expert.id}>
                  <p className="text-xs font-semibold text-ink">
                    {expert.name}
                  </p>
                  <p className="text-[0.625rem] text-muted">
                    {expert.expertise.join(" · ")} · {expert.availability}
                  </p>
                </li>
              ))}
              {programme.experts.length === 0 ? (
                <p className="text-xs text-muted">
                  No mentor sessions are configured for this edition.
                </p>
              ) : null}
            </ul>
          </div>
        </div>
      </Block>

      {programme.workshops.length > 0 || programme.showcase ? (
        <Block
          id="sessions"
          title="Workshops and showcase"
          description="Optional sessions attached to this edition."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {programme.workshops.map((workshop) => (
              <div
                key={workshop.id}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <Pill size="xs" tone="accent">
                  Workshop
                </Pill>
                <h3 className="mt-2 text-sm font-bold text-ink">
                  {workshop.title}
                </h3>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {workshop.description}
                </p>
                <p className="mt-2 text-[0.625rem] text-muted">
                  {formatProgrammeDate(workshop.startsAt, true)} ·{" "}
                  {workshop.facilitator} · {workshop.seatsTaken}/
                  {workshop.capacity} seats
                </p>
                <p className="mt-1 text-xs font-semibold text-ink">
                  {workshop.price ? <Amount value={workshop.price} /> : "Free"}
                </p>
              </div>
            ))}
            {programme.showcase ? (
              <div className="rounded-2xl border border-border bg-surface p-4">
                <Pill size="xs" tone="accent">
                  Showcase
                </Pill>
                <h3 className="mt-2 text-sm font-bold text-ink">
                  {programme.showcase.title}
                </h3>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {formatProgrammeDate(programme.showcase.startsAt, true)} ·{" "}
                  {programme.showcase.format.replace("_", " ")} ·{" "}
                  {programme.showcase.venue}
                </p>
                <p className="mt-2 text-[0.625rem] text-muted">
                  {programme.showcase.rsvps}/{programme.showcase.capacity} RSVP
                  · {programme.showcase.presenterIdeaIds.length} presenters
                </p>
              </div>
            ) : null}
          </div>
          <p className="mt-2 text-[0.625rem] text-muted">
            Registration and tickets are not connected to a payment provider
            yet.
          </p>
        </Block>
      ) : null}

      {programme.modules.length > 0 ? (
        <Block
          id="modules"
          title="Programme modules"
          description="Optional capabilities for this edition. Each card states what is actually switched on."
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {programme.modules.map((module) => (
              <li
                key={module.key}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-ink">
                    {moduleLabel(module.key)}
                  </h3>
                  <Pill size="xs" tone={module.enabled ? "accent" : "neutral"}>
                    {module.enabled ? "On" : "Off"}
                  </Pill>
                </div>
                <p className="mt-2 text-[0.6875rem] font-semibold text-muted">
                  {moduleAvailabilityLabel(module.availability)}
                </p>
                {module.note ? (
                  <p className="mt-1 text-[0.625rem] leading-5 text-muted">
                    {module.note}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[0.625rem] text-muted">
            “Coming soon” means no part of the module is live yet. “Preview”
            means it exists but is not a committed service for this edition.
          </p>
        </Block>
      ) : null}

      <Block
        id="results"
        title="Results"
        description="Published only after the review is complete."
      >
        {resultsPublic ? (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={TrophyIcon}
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="text-brand-strong"
                />
                <h3 className="text-sm font-bold text-ink">Final standings</h3>
              </div>
              <Pill size="xs" tone="accent">
                Frozen snapshot
              </Pill>
            </div>
            <ol className="mt-3 space-y-2">
              {leaderboard.slice(0, 3).map((entry) => {
                const submission = submissionFor(programme, entry.submissionId);
                return (
                  <li
                    key={entry.submissionId}
                    className="flex items-center gap-3 rounded-lg bg-canvas px-3 py-2"
                  >
                    <span className="grid size-7 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                      {entry.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-ink">
                        {submission?.title}
                      </p>
                      <p className="text-[0.625rem] text-muted">
                        {submission?.creator}
                      </p>
                    </div>
                    <span className="text-xs font-bold tabular-nums text-ink">
                      {entry.judgeScore.toFixed(2)}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="mt-2 text-[0.625rem] text-muted">
              Published{" "}
              {formatProgrammeDate(
                programme.snapshot?.capturedAt ?? programme.schedule.resultsAt,
              )}{" "}
              · checksum {programme.snapshot?.checksum ?? "pending"}
            </p>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border-strong bg-canvas p-5 text-sm text-muted">
            Results are not public yet.{" "}
            {judging
              ? "The review is in progress."
              : "They appear here after publication."}
          </p>
        )}
      </Block>

      {programme.faqs.length > 0 ? (
        <Block
          id="faq"
          title="Questions"
          description="Rules and participation, in plain language."
        >
          <div className="space-y-2">
            {programme.faqs.map((faq) => (
              <details
                key={faq.question}
                className="rounded-xl border border-border bg-surface p-3"
              >
                <summary className="cursor-pointer text-xs font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                  {faq.question}
                </summary>
                <p className="mt-2 text-[0.6875rem] leading-5 text-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </Block>
      ) : null}

      <Block
        id="submit"
        title="Take part"
        description={
          competition.status === "open"
            ? "Publish an idea, support one, or come to the next session."
            : "This edition has closed. Follow the next programme for another chance."
        }
      >
        <div className="flex flex-wrap gap-2">
          <Link
            href="/d/creator/ideas/new"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Start an idea
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              size={15}
              strokeWidth={1.9}
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/ideas"
            className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-brand/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Explore ideas
          </Link>
          <Link
            href="/ideathon/past"
            className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Past ideathons
          </Link>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[0.625rem] text-muted">
          <HugeiconsIcon
            icon={UserGroupIcon}
            size={12}
            strokeWidth={1.8}
            aria-hidden="true"
          />
          A programme can run without fundraising. Entering does not open a
          campaign or move money.
        </p>
      </Block>
    </div>
  );
}
