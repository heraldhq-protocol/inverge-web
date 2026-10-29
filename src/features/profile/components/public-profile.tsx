import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  CheckmarkBadge01Icon,
  Idea01Icon,
  LinkSquare02Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";
import type {
  PublicProfile,
  PublicProfileIdea,
  PublicProfileSupportedIdea,
} from "@/features/profile/types";

const STATUS_COPY: Readonly<Record<string, string>> = {
  ARCHIVED: "Archived",
  CONVERTED: "Converted",
  THRESHOLD_MET: "Threshold met",
  VALIDATING: "Validating",
};

const TIER_COPY: Readonly<Record<PublicProfile["tier"], string>> = {
  ESTABLISHED: "Established",
  STARTER: "Starter",
  TRUSTED: "Trusted",
};

function monthYear(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function ProfileIdeaCard({ idea }: { idea: PublicProfileIdea }) {
  return (
    <Link
      href={idea.href}
      className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg hover:shadow-ink/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:hover:translate-y-0"
    >
      <div className="flex items-start justify-between gap-3">
        <Pill tone="neutral" size="xs">
          {STATUS_COPY[idea.status] ?? "Public idea"}
        </Pill>
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-canvas text-ink transition-colors group-hover:bg-brand group-hover:text-white"
        >
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            size={14}
            strokeWidth={1.9}
          />
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug tracking-[-0.03em] text-ink">
        {idea.title}
      </h3>
      {idea.summary ? (
        <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-muted">
          {idea.summary}
        </p>
      ) : null}
      <dl className="mt-auto grid grid-cols-2 gap-2 border-t border-border pt-4">
        <div>
          <dd className="text-sm font-semibold tabular-nums text-ink">
            {idea.supporters.toLocaleString("en-US")}
          </dd>
          <dt className="mt-0.5 text-[0.6875rem] leading-4 text-muted">
            Supporters
          </dt>
        </div>
        <div>
          <dd className="text-sm font-semibold text-ink">
            {monthYear(idea.publishedAt) ?? "Date not shared"}
          </dd>
          <dt className="mt-0.5 text-[0.6875rem] leading-4 text-muted">
            Published
          </dt>
        </div>
      </dl>
    </Link>
  );
}

function SupportedIdeaRow({ idea }: { idea: PublicProfileSupportedIdea }) {
  return (
    <li>
      <Link
        href={idea.href}
        className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">
            {idea.title}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted">
            {idea.creator.displayName ??
              (idea.creator.username
                ? `@${idea.creator.username}`
                : "Inverge creator")}
            {idea.creator.username ? (
              <>
                {" "}
                ·{" "}
                <span className="text-brand-strong">
                  @{idea.creator.username}
                </span>
              </>
            ) : null}
          </span>
        </span>
        <HugeiconsIcon
          icon={ArrowUpRight01Icon}
          size={15}
          strokeWidth={1.9}
          aria-hidden="true"
          className="shrink-0 text-muted"
        />
      </Link>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dd className="text-lg font-bold tabular-nums tracking-[-0.02em] text-ink">
        {typeof value === "number" ? value.toLocaleString("en-US") : value}
      </dd>
      <dt className="mt-0.5 text-xs leading-5 text-muted">{label}</dt>
    </div>
  );
}

export function PublicProfileView({ profile }: { profile: PublicProfile }) {
  const name = profile.displayName ?? `@${profile.username}`;
  const memberSince = monthYear(profile.memberSince);

  return (
    <Container className="py-8 sm:py-12">
      <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
        <div className="h-24 bg-gradient-to-r from-brand/20 via-brand/10 to-canvas sm:h-32" />
        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-9 flex flex-wrap items-end justify-between gap-4 sm:-mt-12">
            <div className="flex items-end gap-4">
              <Avatar
                name={name}
                size={64}
                src={profile.avatarUrl}
                className="ring-4 ring-surface"
              />
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
                    {name}
                  </h1>
                  {profile.identityVerified ? (
                    <Pill
                      tone="accent"
                      size="xs"
                      marker={
                        <HugeiconsIcon
                          icon={CheckmarkBadge01Icon}
                          size={12}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      }
                    >
                      Identity verified
                    </Pill>
                  ) : null}
                </div>
                <p className="mt-0.5 text-sm text-muted">@{profile.username}</p>
              </div>
            </div>
          </div>

          {profile.bio ? (
            <p className="mt-5 max-w-3xl text-sm leading-7 text-ink-soft sm:text-base">
              {profile.bio}
            </p>
          ) : (
            <p className="mt-5 max-w-3xl text-sm leading-6 text-muted">
              This creator has not added a bio yet.
            </p>
          )}

          {profile.links.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {profile.links.map((link) => (
                <li key={`${link.label}-${link.url}`}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-canvas px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <HugeiconsIcon
                      icon={LinkSquare02Icon}
                      size={13}
                      strokeWidth={1.9}
                      aria-hidden="true"
                    />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}

          <dl className="mt-6 grid grid-cols-2 gap-5 border-t border-border pt-5 sm:grid-cols-4">
            <Stat label="Public ideas shown" value={profile.ideasPublished} />
            <Stat
              label="Completed campaigns"
              value={profile.completedCampaigns}
            />
            <Stat label="Creator tier" value={TIER_COPY[profile.tier]} />
            <Stat label="Member since" value={memberSince ?? "Not shared"} />
          </dl>
        </div>
      </section>

      <section aria-labelledby="profile-ideas" className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
              Ideas
            </p>
            <h2
              id="profile-ideas"
              className="mt-1 text-xl font-bold tracking-[-0.03em] text-ink sm:text-2xl"
            >
              Recent public ideas
            </h2>
          </div>
          <Link
            href="/ideas"
            className="text-sm font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Explore all ideas
          </Link>
        </div>

        {profile.ideas.length > 0 ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.ideas.map((idea) => (
              <li key={idea.id}>
                <ProfileIdeaCard idea={idea} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-border-strong bg-surface px-5 py-9 text-center">
            <span className="mx-auto grid size-11 place-items-center rounded-full bg-brand/10 text-brand-strong">
              <HugeiconsIcon
                icon={Idea01Icon}
                size={20}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">
              No public ideas yet
            </p>
            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted">
              When this creator publishes an idea, it will appear here.
            </p>
          </div>
        )}
      </section>

      {profile.supportedIdeas.length > 0 ? (
        <section aria-labelledby="profile-supported" className="mt-8">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
            Support
          </p>
          <h2
            id="profile-supported"
            className="mt-1 text-xl font-bold tracking-[-0.03em] text-ink sm:text-2xl"
          >
            Ideas supported
          </h2>
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
            {profile.supportedIdeas.map((idea) => (
              <SupportedIdeaRow key={idea.id} idea={idea} />
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-8 text-xs leading-5 text-muted">
        This profile shows only information the creator has chosen to make
        public. Account email, wallet and verification records are never shown.
      </p>
    </Container>
  );
}
