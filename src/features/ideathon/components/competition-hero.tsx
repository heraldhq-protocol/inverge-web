import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  StartUp01Icon,
  TrophyIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Pill } from "@/components/ui/pill";
import { CompetitionCountdown } from "@/features/ideathon/components/competition-countdown";
import type { Ideathon } from "@/features/ideathon/types";
import type { Programme } from "@/features/programmes/types";
import { publicCta } from "@/features/programmes/lib/programme";

const benefits = [
  { icon: TrophyIcon, text: "Top ideas get featured and supported" },
  { icon: UserGroupIcon, text: "Build with a community of creators" },
  { icon: StartUp01Icon, text: "Turn ideas into real projects" },
] as const;

function formatRange(startsAt: string, endsAt: string): string {
  const format = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  });

  return `${format.format(new Date(startsAt))} to ${format.format(new Date(endsAt))}`;
}

function ctaHref(programme: Programme, label: string): string {
  if (label === "Submit your idea") return "/d/creator/ideas/new";
  if (label === "Register") return `/sign-up?next=${encodeURIComponent("/d/creator/ideas/new")}`;
  if (label === "See results" || label === "Results under review") return "#results";
  if (label === "View leaderboard") return "#standings";
  if (label === "View archive") return "/ideathon/past";
  return "#about";
}

/**
 * Competition hero. It keeps the editorial reference composition while taking
 * title, theme, dates, banner, and the primary action from the programme's real
 * lifecycle, so an archived or judging round never advertises open submissions.
 */
export function CompetitionHero({
  competition,
  programme,
}: {
  competition: Ideathon;
  programme: Programme;
}) {
  const banner = programme.assets.find((asset) => asset.kind === "banner")?.url;
  const cta = publicCta(programme);

  return (
    <section className="relative isolate overflow-hidden border-b border-border/80 bg-canvas">
      <div
        aria-hidden="true"
        className="absolute -left-32 -top-24 -z-10 size-[26rem] rounded-full bg-brand/[0.06] blur-3xl"
      />
      <Container className="grid items-center gap-8 py-8 sm:py-10 lg:grid-cols-[1.04fr_1.1fr] lg:gap-10 lg:py-12">
        <div className="max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="accent" size="xs">
              {programme.type === "monthly_ideathon"
                ? "Monthly ideathon"
                : programme.type.replace(/_/g, " ")}
            </Pill>
            <Pill tone={cta.kind === "disabled" ? "neutral" : "accent"} size="xs">
              {cta.kind === "disabled" ? "Closed" : "Open"}
            </Pill>
            <span
              className="rounded-full bg-warning/10 px-2 py-0.5 text-[0.625rem] font-semibold text-warning-strong"
              title="Programme records are preview data"
            >
              Preview programme
            </span>
          </div>

          <h1 className="mt-3 text-balance text-[2.1rem] font-bold leading-[1.05] tracking-[-0.045em] text-ink sm:text-5xl lg:text-[3.15rem]">
            {competition.title}.{" "}
            <span className="block text-brand">{programme.tagline}</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-muted sm:text-base sm:leading-7">
            {competition.description}
          </p>

          <ul className="mt-5 grid gap-2.5 sm:grid-cols-3 sm:gap-3">
            {benefits.map(({ icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-2 text-xs leading-5 text-ink-soft sm:block"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full border border-brand/15 bg-brand-soft text-brand-strong">
                  <HugeiconsIcon icon={icon} size={15} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="sm:mt-1.5 sm:block">{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Link
              href={ctaHref(programme, cta.label)}
              aria-disabled={cta.kind === "disabled" || undefined}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                cta.kind === "disabled"
                  ? "cursor-not-allowed border border-border bg-canvas text-muted"
                  : "bg-brand text-white hover:bg-brand-strong"
              }`}
            >
              {cta.label}
            </Link>
            <Link
              href="#overview"
              className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/35 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              How it works
            </Link>
          </div>
          <p className="mt-2 text-[0.6875rem] leading-4 text-muted">{cta.note}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <p className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
              <HugeiconsIcon
                icon={Calendar03Icon}
                size={15}
                strokeWidth={1.8}
                aria-hidden="true"
                className="text-muted"
              />
              {formatRange(competition.startsAt, competition.endsAt)}
            </p>
            <CompetitionCountdown
              startsAt={competition.startsAt}
              endsAt={competition.endsAt}
            />
          </div>
        </div>

        <div className="relative">
          <div className="relative min-h-[15rem] overflow-hidden rounded-2xl bg-surface-muted sm:min-h-[19rem] lg:min-h-[20rem]">
            {banner ? (
              <Image
                src={banner}
                alt={`${programme.title} banner`}
                fill
                priority
                sizes="(min-width: 1024px) 620px, 100vw"
                className="object-cover object-center"
              />
            ) : (
              <div className="grid h-full min-h-[15rem] place-items-center bg-gradient-to-br from-brand-soft via-surface to-surface-muted">
                <span className="grid size-16 place-items-center rounded-2xl bg-surface text-brand-strong shadow-sm">
                  <HugeiconsIcon icon={TrophyIcon} size={30} strokeWidth={1.5} aria-hidden="true" />
                </span>
              </div>
            )}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-contrast/45 via-transparent to-transparent"
            />
          </div>

          <div className="relative mt-3 rounded-2xl border border-border bg-surface p-4 shadow-xl shadow-ink/[0.08] sm:p-5 lg:absolute lg:bottom-4 lg:right-4 lg:mt-0 lg:w-[20rem]">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand-strong">
                <HugeiconsIcon icon={TrophyIcon} size={17} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <Eyebrow className="text-muted">Theme</Eyebrow>
            </div>
            <h2 className="mt-3 text-xl font-bold leading-tight tracking-[-0.03em] text-ink">
              {competition.theme}
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-muted">
              {competition.themeSummary}
            </p>
            <Link
              href="#prizes"
              className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded text-xs font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              View prizes
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
