import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Calendar03Icon,
  MapPinIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import type { ReactNode } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Container } from "@/components/ui/container";
import { Cover } from "@/components/ui/cover";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Meter } from "@/components/ui/meter";
import { Pill, type PillTone } from "@/components/ui/pill";
import { CampaignBreadcrumbs } from "@/features/campaigns/components/campaign-breadcrumbs";
import {
  CampaignTabs,
  type CampaignTabPanel,
} from "@/features/campaigns/components/campaign-tabs";
import { CampaignVideoPlayer } from "@/features/campaigns/components/campaign-video-player";
import { MediaImage } from "@/features/campaigns/components/media-image";
import { LiveCampaignCard } from "@/features/campaigns/components/live-campaign-card";
import {
  resolveCampaignTab,
  type CampaignTab,
  type CampaignTabId,
} from "@/features/campaigns/lib/campaign-tabs";
import type {
  LiveCampaignDetail,
  LiveCampaignDetailView,
  LiveCampaignMilestone,
  LiveRewardTier,
} from "@/features/campaigns/server/live-campaign-detail";
import type { LiveCampaignStatus } from "@/features/campaigns/server/live-campaigns";
import { formatMoney } from "@/lib/money";

const STATUS_TONES: Readonly<Record<LiveCampaignStatus, PillTone>> = {
  active: "accent",
  completed: "neutral",
  failed: "danger",
  funded: "accent",
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

function dateLabel(value: string | null): string {
  if (!value) return "Not published";
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime())
    ? DATE_FORMAT.format(parsed)
    : "Not published";
}

function tabsFor(campaign: LiveCampaignDetail): CampaignTab[] {
  const tabs: CampaignTab[] = [{ id: "story", label: "Story" }];
  if (campaign.milestonePlan.length > 0) {
    tabs.push({ id: "milestones", label: "Milestones" });
  }
  tabs.push({ id: "rewards", label: "Rewards" });
  return tabs;
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-lg font-bold tracking-[-0.025em] text-ink">
      {children}
    </h2>
  );
}

function StoryPanel({ campaign }: { campaign: LiveCampaignDetail }) {
  const entries = [
    { body: campaign.story.problem, label: "The problem" },
    { body: campaign.story.solution, label: "The plan" },
    { body: campaign.story.targetUser, label: "Who it is for" },
    {
      body: campaign.story.currentAlternative,
      label: "What people do today",
    },
  ].filter((entry) => entry.body);

  return (
    <div className="space-y-7">
      {entries.length > 0 ? (
        <dl className="grid gap-5 sm:grid-cols-2">
          {entries.map((entry) => (
            <div key={entry.label}>
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-brand-strong">
                {entry.label}
              </dt>
              <dd className="mt-2 whitespace-pre-line text-sm leading-6 text-ink">
                {entry.body}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="rounded-2xl border border-border bg-surface-muted p-4 text-sm leading-6 text-muted">
          This campaign was published without a written problem and solution.
          The summary above is the public record.
        </p>
      )}

      {campaign.story.roadmap ? (
        <section>
          <SectionHeading>Roadmap</SectionHeading>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink">
            {campaign.story.roadmap}
          </p>
        </section>
      ) : null}

      {campaign.roadmapSteps.length > 0 ? (
        <section>
          <SectionHeading>Planned steps</SectionHeading>
          <ol className="mt-3 space-y-3">
            {campaign.roadmapSteps.map((step, index) => (
              <li
                key={`${step.date}-${index}`}
                className="flex gap-3 rounded-2xl border border-border bg-surface p-4"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand-strong">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  {step.date ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                      {step.date}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm leading-6 text-ink">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {campaign.story.risks ? (
        <section>
          <SectionHeading>Risks and challenges</SectionHeading>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink">
            {campaign.story.risks}
          </p>
        </section>
      ) : null}

      {campaign.storyMedia.length > 0 ? (
        <section>
          <SectionHeading>Media</SectionHeading>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {campaign.storyMedia.map((item) => (
              <li key={item.id}>
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-surface-muted">
                  {item.kind === "image" ? (
                    <MediaImage
                      src={item.src}
                      alt={item.alt}
                      sizes="(min-width: 640px) 360px, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <CampaignVideoPlayer
                      media={item}
                      sizes="(min-width: 640px) 360px, 100vw"
                    />
                  )}
                </div>
                {item.caption ? (
                  <p className="mt-2 text-xs leading-5 text-muted">
                    {item.caption}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function MilestoneRow({ milestone }: { milestone: LiveCampaignMilestone }) {
  const released = milestone.state === "released";
  const rejected = milestone.state === "rejected";

  return (
    <li className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Milestone {milestone.index + 1} - tranche {milestone.tranchePct}%
          </p>
          <h3 className="mt-1 text-base font-bold text-ink">
            {milestone.title}
          </h3>
        </div>
        <Pill tone={released ? "accent" : rejected ? "danger" : "neutral"}>
          {milestone.stateLabel}
        </Pill>
      </div>

      {milestone.deliverable ? (
        <p className="mt-3 text-sm leading-6 text-ink">
          {milestone.deliverable}
        </p>
      ) : null}

      {milestone.evidenceDefinition ? (
        <p className="mt-2 text-xs leading-5 text-muted">
          <span className="font-semibold text-ink">Evidence required:</span>{" "}
          {milestone.evidenceDefinition}
        </p>
      ) : null}

      {milestone.objectionWindowEndsAt ? (
        <p className="mt-2 text-xs leading-5 text-muted">
          Objection window ends {dateLabel(milestone.objectionWindowEndsAt)}.
        </p>
      ) : null}
    </li>
  );
}

function MilestonesPanel({ campaign }: { campaign: LiveCampaignDetail }) {
  return (
    <div>
      <p className="text-sm leading-6 text-muted">
        Funds are released against these milestones after the evidence is
        published and the objection window closes. The state shown is the latest
        public claim, not a promise about future releases.
      </p>
      <ol className="mt-5 space-y-3">
        {campaign.milestonePlan.map((milestone) => (
          <MilestoneRow key={milestone.id} milestone={milestone} />
        ))}
      </ol>
    </div>
  );
}

function RewardCard({ reward }: { reward: LiveRewardTier }) {
  return (
    <li className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-strong">
        {reward.minimum ? `From ${formatMoney(reward.minimum)}` : "Reward"}
      </p>
      <h3 className="mt-2 text-base font-bold text-ink">{reward.title}</h3>
      {reward.description ? (
        <p className="mt-2 text-sm leading-6 text-muted">
          {reward.description}
        </p>
      ) : null}
      <dl className="mt-auto space-y-1 pt-4 text-xs text-muted">
        <div className="flex justify-between gap-3">
          <dt>Estimated delivery</dt>
          <dd className="text-right text-ink">
            {reward.estimatedDelivery ?? "Not stated"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Quantity</dt>
          <dd className="text-right text-ink">
            {reward.limitedQuantity === null
              ? "Unlimited"
              : `${reward.limitedQuantity} available`}
          </dd>
        </div>
      </dl>
    </li>
  );
}

function RewardsPanel({ campaign }: { campaign: LiveCampaignDetail }) {
  if (campaign.rewardDataState === "unsupported") {
    return (
      <p className="rounded-2xl border border-border bg-surface-muted p-4 text-sm leading-6 text-muted">
        This campaign has reward data that this page cannot read yet. The
        creator&apos;s tiers are not shown rather than rendered incorrectly.
      </p>
    );
  }

  if (campaign.rewards.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-surface-muted p-4 text-sm leading-6 text-muted">
        This is a donation-based campaign. There are no reward tiers to choose
        from.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {campaign.rewards.map((reward) => (
        <RewardCard key={reward.id} reward={reward} />
      ))}
    </ul>
  );
}

function FundingRail({ campaign }: { campaign: LiveCampaignDetail }) {
  const raised = BigInt(campaign.raised.atomic) > 0n;

  return (
    <section
      aria-label="Campaign funding"
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold tracking-tight text-ink">Funding</h2>
        <Pill tone={STATUS_TONES[campaign.status]}>{campaign.statusLabel}</Pill>
      </div>

      <p className="mt-4 text-2xl font-bold tabular-nums tracking-[-0.04em] text-ink">
        {formatMoney(campaign.raised)}
        <span className="text-base font-medium text-muted">
          {" "}
          / {formatMoney(campaign.target)}
        </span>
      </p>
      <p className="mt-1 text-xs text-muted">
        {raised
          ? `${campaign.percentFunded}% of the target in the indexed record`
          : "No contribution has been indexed for this campaign yet"}
      </p>

      <Meter
        cap={false}
        className="mt-3"
        ratio={campaign.percentFunded / 100}
        srLabel={`Funding progress for ${campaign.title}`}
        size="sm"
      />

      <dl className="mt-5 space-y-2.5 border-t border-border pt-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-1.5 text-muted">
            <HugeiconsIcon
              icon={Calendar03Icon}
              size={14}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            Deadline
          </dt>
          <dd className="text-right font-medium text-ink">
            {dateLabel(campaign.deadline)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Milestones released</dt>
          <dd className="text-right font-medium text-ink">
            {campaign.milestones.total === 0
              ? "None published"
              : `${campaign.milestones.released} of ${campaign.milestones.total}`}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Category</dt>
          <dd className="text-right font-medium text-ink">
            {campaign.taxonomyText}
          </dd>
        </div>
      </dl>

      {campaign.status === "active" ? (
        <p className="mt-4 rounded-xl bg-surface-muted p-3 text-xs leading-5 text-muted">
          Contributions are not collected on this marketing page. Backing opens
          in the Inverge product once the contribution flow is live.
        </p>
      ) : null}
    </section>
  );
}

function EscrowNote() {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2">
        <HugeiconsIcon
          icon={Shield01Icon}
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
          className="text-brand-strong"
        />
        <h2 className="text-sm font-bold text-ink">Milestone escrow</h2>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">
        Campaign funds are held against milestones. This public page shows
        campaign totals and milestone states only - never escrow balances,
        treasury figures, backer identities, wallets or transaction internals.
      </p>
    </section>
  );
}

/**
 * A public campaign read from the live API.
 *
 * The API has no campaign slug of its own, so the page is addressed by the
 * source idea's slug (or the campaign id). Sections the API does not publish -
 * creator-written updates, a receipts timeline, FAQ entities - are absent rather
 * than borrowed from the preview fixtures. The only funding figures shown are
 * the API's own `totalRaised`/`targetAmount` pair, with an explicit note that
 * they are the indexed record.
 */
export function LiveCampaignDetailPage({
  requestedTab,
  view,
}: {
  requestedTab?: string | undefined;
  view: LiveCampaignDetailView;
}) {
  const { campaign, related, relatedState } = view;
  const tabs = tabsFor(campaign);
  const resolvedTab = resolveCampaignTab(requestedTab, tabs);
  // A demo video in the hero is the strongest thing a campaign can show. The
  // creator's own order decides: the first video wins, then the first photo,
  // then the campaign cover.
  const heroVideo = campaign.heroMedia.find((item) => item.kind === "video");
  const heroImage = campaign.heroMedia.find((item) => item.kind === "image");
  const categoryHref = campaign.taxonomyCategory
    ? `/campaigns/categories/${campaign.taxonomyCategory}${
        campaign.taxonomySubcategory ? `/${campaign.taxonomySubcategory}` : ""
      }`
    : null;

  const content: Record<CampaignTabId, ReactNode> = {
    discussion: null,
    facts: null,
    faqs: null,
    milestones: <MilestonesPanel campaign={campaign} />,
    rewards: <RewardsPanel campaign={campaign} />,
    story: <StoryPanel campaign={campaign} />,
    updates: null,
  };

  const panels: CampaignTabPanel[] = tabs.map((tab) => ({
    content: content[tab.id],
    tab,
  }));

  return (
    <div className="bg-canvas pb-14 sm:pb-20">
      <Container className="py-6 sm:py-8">
        <CampaignBreadcrumbs
          trail={[
            { href: "/", label: "Home" },
            { href: "/campaigns", label: "Campaigns" },
            ...(categoryHref
              ? [{ href: categoryHref, label: campaign.taxonomyText }]
              : []),
            { label: campaign.title },
          ]}
        />

        <div className="mt-5 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_23rem] xl:gap-10">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-3xl border border-border bg-surface-muted">
              {heroVideo?.kind === "video" ? (
                <div className="relative aspect-video">
                  <CampaignVideoPlayer
                    media={heroVideo}
                    sizes="(min-width: 1024px) 900px, 100vw"
                  />
                </div>
              ) : (
                <Cover
                  label={campaign.taxonomyText}
                  ratio="band"
                  seed={campaign.slug}
                  size="featured"
                  src={
                    heroImage?.kind === "image" ? heroImage.src : campaign.cover
                  }
                />
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Pill tone={STATUS_TONES[campaign.status]}>
                {campaign.statusLabel}
              </Pill>
              {categoryHref ? (
                <Link
                  href={categoryHref}
                  className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <Pill tone="neutral">{campaign.taxonomyText}</Pill>
                </Link>
              ) : (
                <Pill tone="neutral">{campaign.taxonomyText}</Pill>
              )}
            </div>

            <h1 className="mt-3 text-balance text-3xl font-bold leading-[1.08] tracking-[-0.045em] text-ink sm:text-4xl lg:text-[2.75rem]">
              {campaign.title}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
              {campaign.summary}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-border py-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar
                  name={campaign.creator}
                  size={40}
                  src={campaign.creatorAvatar}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {campaign.creator}
                  </p>
                  <p className="text-xs text-muted">Campaign creator</p>
                </div>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <HugeiconsIcon
                  icon={MapPinIcon}
                  size={14}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                {campaign.location}
              </p>
              {campaign.launchedAt ? (
                <p className="text-xs text-muted">
                  Launched {dateLabel(campaign.launchedAt)}
                </p>
              ) : null}
            </div>

            {campaign.creatorBio ? (
              <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
                {campaign.creatorBio}
              </p>
            ) : null}

            <div className="mt-6 lg:hidden">
              <FundingRail campaign={campaign} />
            </div>

            <div className="mt-8">
              <CampaignTabs
                key={resolvedTab}
                activeTab={resolvedTab}
                panels={panels}
                slug={campaign.slug}
              />
            </div>

            {campaign.ideaId ? (
              <p className="mt-6 text-sm text-muted">
                This campaign grew out of an idea.{" "}
                <Link
                  href={`/ideas/${encodeURIComponent(campaign.ideaId)}`}
                  className="font-semibold text-brand-strong underline-offset-2 hover:underline"
                >
                  Read the original validation record
                </Link>
                .
              </p>
            ) : null}

            {relatedState === "live" && related.length > 0 ? (
              <section aria-labelledby="related-campaigns" className="mt-10">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <Eyebrow>Related</Eyebrow>
                    <h2
                      id="related-campaigns"
                      className="mt-1 text-xl font-bold tracking-[-0.03em] text-ink"
                    >
                      Other campaigns in {campaign.taxonomyText}
                    </h2>
                  </div>
                  <Link
                    href={`/campaigns/${encodeURIComponent(campaign.slug)}/recommended`}
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-strong hover:text-brand"
                  >
                    See more
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={14}
                      strokeWidth={1.9}
                      aria-hidden="true"
                    />
                  </Link>
                </div>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {related.map((candidate) => (
                    <li key={candidate.id} className="h-full">
                      <LiveCampaignCard campaign={candidate} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {relatedState === "unavailable" ? (
              <p className="mt-8 rounded-2xl border border-border bg-surface-muted p-4 text-sm leading-6 text-muted">
                Related campaigns could not be loaded right now. The campaign
                above is unaffected.
              </p>
            ) : null}
          </div>

          <aside className="hidden min-w-0 lg:block">
            <div className="lg:sticky lg:top-24 space-y-4">
              <FundingRail campaign={campaign} />
              <EscrowNote />
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
