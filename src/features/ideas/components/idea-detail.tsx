import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowLeft02Icon,
  ArrowUpRight01Icon,
  BulbIcon,
  CheckmarkBadge01Icon,
  CheckmarkCircle02Icon,
  CheckmarkSquare01Icon,
  Clock01Icon,
  Coins01Icon,
  Comment01Icon,
  Idea01Icon,
  LinkSquare02Icon,
  MapPinIcon,
  MonitorPlayIcon,
  Route01Icon,
  Target02Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import type { ReactNode } from "react";

import { Amount } from "@/components/ui/amount";
import { Avatar } from "@/components/ui/avatar";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconTile } from "@/components/ui/icon-tile";
import { Pill } from "@/components/ui/pill";
import { AdSlot } from "@/features/advertising/components/ad-slot";
import { CampaignVideoPlayer } from "@/features/campaigns/components/campaign-video-player";
import { parseHostedVideoSource } from "@/features/campaigns/lib/media";
import type { CampaignVideo } from "@/features/campaigns/types";
import { IdeaActions } from "@/features/ideas/components/idea-actions";
import { IdeaCover } from "@/features/ideas/components/idea-cover";
import { IdeaDiscoveryCard } from "@/features/ideas/components/idea-discovery-card";
import { IdeaDiscussion } from "@/features/ideas/components/idea-discussion";
import { CommunityInvite } from "@/features/feedback/components/community-invite";
import { IdeaFollow } from "@/features/ideas/components/idea-follow";
import { IdeaGoalsStrip } from "@/features/feedback/components/idea-goals-strip";
import {
  IdeaViewerProvider,
  ViewerToggle,
} from "@/features/ideas/components/idea-viewer";
import { previewComments } from "@/features/ideas/content/preview-comments";
import { relatedIdeas, topicsForIdea } from "@/features/ideas/lib/catalog";
import { ideaTaxonomyText } from "@/features/ideas/lib/filter-ideas";
import { ideaTaxonomyHref } from "@/features/ideas/lib/filters";
import { evaluateGate } from "@/features/ideas/lib/gate";
import type {
  DiscoveryIdea,
  IdeaComment,
  IdeaDetail as IdeaDetailModel,
  Topic,
} from "@/features/ideas/types";
import type { MoneyAmount } from "@/lib/money";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}

function formatScore(score: number): string {
  return score.toFixed(1);
}

function countPercent(current: number, required: number): number {
  if (required <= 0) return 100;
  return Math.min(100, Math.round((current / required) * 100));
}

/**
 * Progress toward a money threshold as an integer percent.
 *
 * The ratio is computed in BigInt atomic units and truncated to a whole number,
 * so no binary floating point ever touches an amount (money rule, D-010).
 */
function moneyPercent(current: MoneyAmount, required: MoneyAmount): number {
  const requiredAtomic = BigInt(required.atomic);
  if (requiredAtomic <= 0n) return 100;
  const percent = (BigInt(current.atomic) * 100n) / requiredAtomic;
  return Number(percent > 100n ? 100n : percent);
}

function StoryHeading({
  icon,
  id,
  children,
}: {
  icon: IconSvgElement;
  id: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <IconTile icon={icon} size="sm" tone="soft" />
      <h2
        id={id}
        className="text-lg font-bold tracking-[-0.03em] text-ink sm:text-xl"
      >
        {children}
      </h2>
    </div>
  );
}

/** One validation signal, explained separately (FR-203). */
function Signal({
  explain,
  icon,
  label,
  value,
  sub,
}: {
  explain: string;
  icon: IconSvgElement;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <IconTile icon={icon} size="sm" tone="soft" />
      <div className="min-w-0">
        <dt className="text-xs font-medium text-muted">{label}</dt>
        <dd className="mt-0.5 text-lg font-bold tabular-nums leading-tight text-ink">
          {value}
        </dd>
        {sub ? (
          <dd className="mt-0.5 text-xs font-medium text-ink">{sub}</dd>
        ) : null}
        <p className="mt-0.5 text-xs leading-5 text-muted">{explain}</p>
      </div>
    </div>
  );
}

function GateRow({
  label,
  met,
  percent,
  value,
}: {
  label: string;
  met: boolean;
  percent: number;
  value: ReactNode;
}) {
  return (
    <li>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-ink">{label}</span>
        <span className="text-xs tabular-nums text-muted">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/[0.07]">
        <div
          className="h-full rounded-full bg-brand"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1 text-[0.6875rem] font-medium">
        {met ? (
          <span className="inline-flex items-center gap-1 text-brand-strong">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={12}
              strokeWidth={2.4}
              aria-hidden="true"
            />
            Met
          </span>
        ) : (
          <span className="text-muted">Not met yet</span>
        )}
      </p>
    </li>
  );
}

function GateMeter({ idea }: { idea: IdeaDetailModel }) {
  const gate = evaluateGate(
    { prePledged: idea.prePledged, supporters: idea.supporters },
    idea.gate,
  );

  return (
    <div className="border-t border-border pt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-ink">Progress to launch</p>
        <span className="text-[0.6875rem] text-muted">FR-204 threshold</span>
      </div>
      <ul className="mt-3 space-y-3.5">
        {gate.checks.map((check) =>
          check.requirement === "supporters" ? (
            <GateRow
              key="supporters"
              label="Supporters"
              met={check.met}
              percent={countPercent(check.current, check.required)}
              value={`${check.current.toLocaleString("en-US")} / ${check.required.toLocaleString("en-US")}`}
            />
          ) : (
            <GateRow
              key="pre-pledged"
              label="Estimated interest"
              met={check.met}
              percent={moneyPercent(check.current, check.required)}
              value={
                <>
                  <Amount value={check.current} compact /> /{" "}
                  <Amount value={check.required} compact />
                </>
              }
            />
          ),
        )}
      </ul>
      <p className="mt-3 text-[0.6875rem] leading-5 text-muted">
        This tracks launch readiness, not money raised. When both are met, the
        creator can open a campaign and supporters are notified first.
      </p>
    </div>
  );
}

function MetricStrip({ idea }: { idea: IdeaDetailModel }) {
  const metrics = [
    {
      icon: UserMultiple02Icon,
      label: "Supporters",
      value: idea.supporters.toLocaleString("en-US"),
    },
    {
      icon: Coins01Icon,
      label: "Estimated interest",
      value: <Amount value={idea.prePledged} compact />,
    },
    {
      icon: Comment01Icon,
      label: "Feedback",
      value: idea.feedbackResponses.toLocaleString("en-US"),
    },
  ] as const;

  return (
    <dl className="grid grid-cols-1 divide-y divide-border rounded-2xl border border-border bg-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {metrics.map(({ icon, label, value }) => (
        <div
          key={label}
          className="flex items-center gap-3 px-4 py-3.5 sm:px-5"
        >
          <IconTile icon={icon} size="sm" tone="soft" />
          <div className="min-w-0">
            <dt className="text-[0.6875rem] leading-4 text-muted">{label}</dt>
            <dd className="truncate text-base font-bold tabular-nums text-ink">
              {value}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

export function IdeaDetail({
  dataSource = "preview",
  idea,
  ideas,
  topics,
  comments = [],
  commentsState = "preview",
}: {
  dataSource?: "live" | "preview";
  idea: IdeaDetailModel;
  ideas: readonly DiscoveryIdea[];
  topics: readonly Topic[];
  comments?: readonly IdeaComment[];
  commentsState?: "live" | "preview" | "unavailable";
}) {
  const live = dataSource === "live";
  const ideaTopics = topicsForIdea(topics, idea.id);
  const related = relatedIdeas({ idea, ideas, topics });
  const firstTopic = ideaTopics[0];
  const gate = evaluateGate(
    { prePledged: idea.prePledged, supporters: idea.supporters },
    idea.gate,
  );
  const stage = gate.convertible
    ? "Ready to launch"
    : idea.changes && idea.changes.length > 0
      ? "Revised after feedback"
      : "Collecting feedback";
  const taxonomyHref = ideaTaxonomyHref(idea);
  const taxonomyText = ideaTaxonomyText(idea);
  // A demo video is the strongest thing an idea can show, so it takes the hero
  // slot when the link is a host we can embed. A non-video demo link (a mockup,
  // a prototype) keeps the cover in the hero and is offered as a link instead.
  const demo = idea.demoUrl ? parseHostedVideoSource(idea.demoUrl) : null;
  const demoVideo: CampaignVideo | null =
    demo?.ok === true
      ? {
          alt: `${idea.title} demo`,
          caption: null,
          id: "idea-demo",
          kind: "video",
          poster: idea.cover ?? null,
          source: demo.source,
        }
      : null;

  return (
    <IdeaViewerProvider>
      <Container className="py-6 sm:py-8">
        <nav aria-label="Breadcrumb" className="text-xs text-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link
                href="/ideas"
                className="rounded font-medium text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Ideas
              </Link>
            </li>
            {firstTopic ? (
              <>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href={`/topics/${firstTopic.slug}`}
                    className="rounded font-medium text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    {firstTopic.title}
                  </Link>
                </li>
              </>
            ) : null}
            <li aria-hidden="true">/</li>
            <li className="truncate text-ink">{idea.title}</li>
          </ol>
        </nav>

        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(19rem,1fr)] lg:gap-10">
          <div className="min-w-0">
            <figure
              className={`relative overflow-hidden rounded-2xl border border-border bg-surface-muted ${
                demoVideo ? "aspect-video" : "aspect-[2.05/1]"
              }`}
            >
              {demoVideo ? (
                <CampaignVideoPlayer
                  media={demoVideo}
                  sizes="(min-width: 1024px) 760px, 100vw"
                />
              ) : (
                <IdeaCover
                  artwork={idea.artwork}
                  cover={idea.cover}
                  alt={`${idea.title}, ${taxonomyText}`}
                  priority
                  sizes="(min-width: 1024px) 760px, 100vw"
                />
              )}
              {idea.promoted ? (
                <div className="absolute right-3 top-3">
                  <Pill
                    tone="promoted"
                    className="bg-surface/95 shadow-sm backdrop-blur"
                    title="Paid placement affects visibility only, never validation metrics"
                  >
                    Promoted
                  </Pill>
                </div>
              ) : null}
            </figure>

            <header className="mt-5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs">
                <p className="font-semibold text-brand-strong">
                  {taxonomyText}
                </p>
                <span className="text-border-strong" aria-hidden="true">
                  ·
                </span>
                <Pill tone={gate.convertible ? "accent" : "neutral"} size="xs">
                  {stage}
                </Pill>
                <span className="text-muted">
                  {live ? "On Inverge since" : "Published"}{" "}
                  {formatDate(idea.publishedAt)}
                </span>
              </div>
              <h1 className="mt-2 text-balance text-3xl font-bold tracking-[-0.045em] text-ink sm:text-[2.5rem] sm:leading-[1.08]">
                {idea.title}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
                {idea.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-2">
                  <Avatar name={idea.creator} size={32} />
                  {idea.creatorUsername ? (
                    <Link
                      href={`/u/${encodeURIComponent(idea.creatorUsername)}`}
                      className="font-medium text-ink underline-offset-4 transition-colors hover:text-brand-strong hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      {idea.creator}
                    </Link>
                  ) : (
                    <span className="font-medium text-ink">{idea.creator}</span>
                  )}
                  {idea.creatorVerified ? (
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-strong"
                      title="Identity verified"
                    >
                      <HugeiconsIcon
                        icon={CheckmarkBadge01Icon}
                        size={16}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      Verified
                    </span>
                  ) : null}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted">
                  <HugeiconsIcon
                    icon={MapPinIcon}
                    size={16}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  {idea.location}
                </span>
              </div>
            </header>

            <div className="mt-5">
              <MetricStrip idea={idea} />
            </div>

            {idea.demoUrl && !demoVideo ? (
              <section aria-labelledby="idea-demo" className="mt-6">
                <div className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-4">
                  <IconTile icon={MonitorPlayIcon} size="md" />
                  <div className="min-w-0">
                    <h2 id="idea-demo" className="text-sm font-bold text-ink">
                      See it before you back it
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      The creator attached a demo, a mockup, or a prototype you
                      can open.
                    </p>
                    <a
                      href={idea.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      Open the demo
                      <HugeiconsIcon
                        icon={LinkSquare02Icon}
                        size={16}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </div>
                </div>
              </section>
            ) : null}

            <div className="mt-7 space-y-8">
              <section aria-labelledby="idea-problem">
                <StoryHeading icon={BulbIcon} id="idea-problem">
                  The problem
                </StoryHeading>
                <p className="mt-3 max-w-[70ch] text-[1.02rem] leading-8 text-ink-soft">
                  {idea.problem}
                </p>
                <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-surface-muted/70 p-4">
                    <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                      <HugeiconsIcon
                        icon={UserMultiple02Icon}
                        size={16}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      Who it&apos;s for
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-ink">
                      {idea.targetUser}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-surface-muted/70 p-4">
                    <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                      <HugeiconsIcon
                        icon={Clock01Icon}
                        size={16}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      What happens today
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-ink">
                      {idea.currentAlternative}
                    </dd>
                  </div>
                </dl>
              </section>

              <section aria-labelledby="idea-solution">
                <StoryHeading icon={Idea01Icon} id="idea-solution">
                  The solution
                </StoryHeading>
                <p className="mt-3 max-w-[70ch] text-[1.02rem] leading-8 text-ink-soft">
                  {idea.solution}
                </p>
              </section>

              {live ? null : (
                <AdSlot
                  page={{ category: idea.discoveryCategory, kind: "idea" }}
                  placementId="idea-detail-inline"
                />
              )}

              {idea.roadmapSteps.length > 0 ? (
                <section aria-labelledby="idea-roadmap">
                  <StoryHeading icon={Route01Icon} id="idea-roadmap">
                    Roadmap
                  </StoryHeading>
                  <ol className="relative mt-4 max-w-2xl space-y-5 border-l border-border pl-6">
                    {idea.roadmapSteps.map((step) => (
                      <li
                        key={step.date + step.description}
                        className="relative"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute -left-[1.875rem] top-0.5 grid size-4 place-items-center rounded-full border-2 border-brand bg-surface"
                        >
                          <span className="size-1.5 rounded-full bg-brand" />
                        </span>
                        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted">
                          {formatDate(step.date)}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-ink">
                          {step.description}
                        </p>
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}

              <section aria-labelledby="idea-ask">
                <StoryHeading icon={Coins01Icon} id="idea-ask">
                  The ask
                </StoryHeading>
                <div className="mt-4 max-w-2xl rounded-2xl border border-border bg-brand-tint p-4 sm:p-5">
                  <p className="text-sm leading-6 text-ink-soft">
                    The creator anticipates needing about{" "}
                    <span className="font-semibold tabular-nums text-ink">
                      <Amount value={idea.askAmount} />
                    </span>{" "}
                    to validate and build this. It is not money raised and not
                    an approved campaign budget.
                  </p>
                  {idea.askBreakdown.length > 0 ? (
                    <dl className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
                      {idea.askBreakdown.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-baseline justify-between gap-4 px-4 py-2.5"
                        >
                          <dt className="text-sm text-ink">{item.label}</dt>
                          <dd className="whitespace-nowrap text-sm font-semibold tabular-nums text-ink">
                            <Amount value={item.amount} />
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  {idea.fundingIntent ? (
                    <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-[0.6875rem] leading-4 text-muted">
                      {idea.fundingIntent.nextStep}
                    </p>
                  ) : (
                    <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-[0.6875rem] leading-4 text-muted">
                      This idea is not seeking funding. The figures above
                      describe the work, not a campaign target or money raised.
                    </p>
                  )}
                </div>
              </section>

              {idea.risks ? (
                <section aria-labelledby="idea-risks">
                  <StoryHeading icon={Alert02Icon} id="idea-risks">
                    Risks and challenges
                  </StoryHeading>
                  <p className="mt-3 max-w-[70ch] text-[1.02rem] leading-8 text-ink-soft">
                    {idea.risks}
                  </p>
                </section>
              ) : null}

              {idea.creatorBio ? (
                <section aria-labelledby="idea-creator">
                  <StoryHeading icon={CheckmarkBadge01Icon} id="idea-creator">
                    About the creator
                  </StoryHeading>
                  <p className="mt-3 max-w-[70ch] text-[1.02rem] leading-8 text-ink-soft">
                    {idea.creatorBio}
                  </p>
                  <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
                    {idea.creatorVerified ? (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                          Identity
                        </dt>
                        <dd className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                          <HugeiconsIcon
                            icon={CheckmarkBadge01Icon}
                            size={16}
                            strokeWidth={1.8}
                            aria-hidden="true"
                            className="text-brand-strong"
                          />
                          Verified
                        </dd>
                      </div>
                    ) : null}
                    {idea.responseRate !== undefined ? (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                          Response rate
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-ink">
                          Replies to {Math.round(idea.responseRate * 100)}% of
                          feedback
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
              ) : null}

              {idea.changes && idea.changes.length > 0 ? (
                <section aria-labelledby="idea-changes">
                  <StoryHeading icon={CheckmarkSquare01Icon} id="idea-changes">
                    Changed after feedback
                  </StoryHeading>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                    What the creator updated because of what supporters said.
                  </p>
                  <ol className="mt-4 max-w-2xl space-y-4">
                    {idea.changes.map((change) => (
                      <li
                        key={change.date + change.description}
                        className="flex gap-4"
                      >
                        <span
                          className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-strong"
                          aria-hidden="true"
                        >
                          <HugeiconsIcon
                            icon={CheckmarkCircle02Icon}
                            size={14}
                            strokeWidth={2.4}
                            aria-hidden="true"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted">
                            {formatDate(change.date)}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-ink">
                            {change.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}
            </div>

            {ideaTopics.length > 0 ? (
              <section className="mt-8 border-t border-border pt-6">
                <Eyebrow className="text-muted">Filed under</Eyebrow>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {ideaTopics.map((topic) => (
                    <li key={topic.slug}>
                      <Link
                        href={`/topics/${topic.slug}`}
                        className="inline-flex min-h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-brand/35 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        {topic.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {live ? (
              <IdeaDiscussion
                canPost={false}
                comments={comments}
                source="live"
                unavailable={commentsState === "unavailable"}
              />
            ) : (
              <IdeaDiscussion comments={previewComments[idea.id] ?? []} />
            )}
          </div>

          <aside className="min-w-0 lg:self-start">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-start gap-3">
                <Avatar name={idea.creator} size={44} />
                <div className="min-w-0 flex-1">
                  {idea.creatorUsername ? (
                    <Link
                      href={`/u/${encodeURIComponent(idea.creatorUsername)}`}
                      className="block truncate text-sm font-bold text-ink underline-offset-4 transition-colors hover:text-brand-strong hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      {idea.creator}
                    </Link>
                  ) : (
                    <p className="truncate text-sm font-bold text-ink">
                      {idea.creator}
                    </p>
                  )}
                  {idea.creatorVerified ? (
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-brand-strong">
                      <HugeiconsIcon
                        icon={CheckmarkBadge01Icon}
                        size={14}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      Verified creator
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-muted">Idea creator</p>
                  )}
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <HugeiconsIcon
                      icon={MapPinIcon}
                      size={14}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    {idea.location}
                  </p>
                  {idea.creatorFollow ? (
                    <p className="mt-1 text-[0.6875rem] tabular-nums text-muted">
                      {idea.creatorFollow.followerCount.toLocaleString("en-US")}{" "}
                      followers
                    </p>
                  ) : null}
                </div>
              </div>
              {idea.creatorFollow ? (
                <div className="mt-3">
                  <IdeaFollow creatorName={idea.creator} ideaId={idea.id} />
                </div>
              ) : null}
            </div>

            {idea.goals ? (
              <div className="mt-3">
                <IdeaGoalsStrip goals={idea.goals} compact />
              </div>
            ) : null}

            <div className="mt-3 rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <Eyebrow className="text-muted">Validation signals</Eyebrow>
                {live ? (
                  <span
                    className="text-[0.625rem] text-muted"
                    title="Idea figures come from the Inverge API"
                  >
                    Live
                  </span>
                ) : null}
              </div>
              <dl className="mt-4 space-y-4">
                <Signal
                  icon={UserMultiple02Icon}
                  label="Supporters"
                  value={idea.supporters.toLocaleString("en-US")}
                  sub={
                    idea.verifiedSupporters !== undefined
                      ? `${idea.verifiedSupporters.toLocaleString("en-US")} identity-verified`
                      : undefined
                  }
                  explain="People who want this idea to exist. This is not a customer count."
                />
                <Signal
                  icon={Coins01Icon}
                  label="Estimated interest"
                  value={<Amount value={idea.prePledged} compact />}
                  explain="A weighted, non-binding estimate of funding intent. No funds have moved."
                />
                <Signal
                  icon={Comment01Icon}
                  label="Feedback"
                  value={
                    <>
                      {idea.feedbackResponses.toLocaleString("en-US")}
                      <span className="text-sm font-semibold text-muted">
                        {" "}
                        · {formatScore(idea.feedbackScore)} / 5
                      </span>
                    </>
                  }
                  explain="Structured survey responses. A rating is not proof of demand."
                />
              </dl>

              {idea.supportersByRegion && idea.supportersByRegion.length > 0 ? (
                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-[0.6875rem] font-semibold text-ink">
                    Where supporters are
                  </p>
                  <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                    {idea.supportersByRegion.map((region) => (
                      <li key={region.label} className="text-xs text-ink">
                        <span className="font-bold tabular-nums">
                          {region.count.toLocaleString("en-US")}
                        </span>{" "}
                        <span className="text-muted">{region.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-4">
                <GateMeter idea={idea} />
              </div>
            </div>

            {live ? null : (
              <AdSlot
                page={{ category: idea.discoveryCategory, kind: "idea" }}
                placementId="idea-detail-rail"
              />
            )}

            {live ? null : (
              <div className="mt-3">
                <IdeaActions idea={idea} />
              </div>
            )}

            {idea.community?.enabled && idea.community.showOnIdeaPage ? (
              <div className="mt-3">
                <CommunityInvite invite={idea.community} variant="compact" />
              </div>
            ) : null}

            {live ? null : (
              <div className="mt-3 rounded-2xl border border-border bg-brand-tint p-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand-strong">
                    <HugeiconsIcon
                      icon={Target02Icon}
                      size={16}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink">
                      {gate.convertible
                        ? "Ready for a campaign"
                        : "This idea is in early access"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {gate.convertible
                        ? "The creator has reached the validation threshold. Supporters will be notified first if a campaign opens."
                        : "The creator is still gathering signal. Once they publish updates, supporters see them here first."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {live ? null : (
              <div className="mt-3">
                <ViewerToggle />
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/ideas"
                className="inline-flex items-center gap-2 rounded text-sm font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <HugeiconsIcon
                  icon={ArrowLeft02Icon}
                  size={16}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                Back to all ideas
              </Link>
              {taxonomyHref ? (
                <Link
                  href={taxonomyHref}
                  className="inline-flex items-center gap-1 rounded text-xs font-semibold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  More in {taxonomyText}
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    size={14}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </Link>
              ) : null}
            </div>
          </aside>
        </div>

        {related.length > 0 ? (
          <section
            aria-labelledby="related-ideas"
            className="mt-10 border-t border-border pt-7"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2
                  id="related-ideas"
                  className="text-xl font-bold tracking-[-0.035em] text-ink sm:text-2xl"
                >
                  Ideas like this
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Sharing a category or a topic with {idea.title}.
                </p>
              </div>
              {firstTopic ? (
                <Link
                  href={`/topics/${firstTopic.slug}`}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg text-sm font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  View all ({ideaTopics.length})
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    size={16}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </Link>
              ) : null}
            </div>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((candidate) => (
                <li key={candidate.id} className="grid">
                  <IdeaDiscoveryCard idea={candidate} source="internal" />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </IdeaViewerProvider>
  );
}
