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

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400&h=900&fit=crop&q=80";

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

/**
 * Competition hero. The floating card makes the theme and its public schedule
 * legible before the standings, without implying that theme selection affects
 * ranking.
 */
export function CompetitionHero({ competition }: { competition: Ideathon }) {
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
              Monthly ideathon
            </Pill>
            <span
              className="rounded-full bg-warning/10 px-2 py-0.5 text-[0.625rem] font-semibold text-warning-strong"
              title="No live ideathon service is connected yet"
            >
              Preview competition
            </span>
          </div>

          <h1 className="mt-3 text-balance text-[2.1rem] font-bold leading-[1.05] tracking-[-0.045em] text-ink sm:text-5xl lg:text-[3.15rem]">
            Big ideas. Real impact.{" "}
            <span className="block text-brand">Monthly ideathon.</span>
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
                  <HugeiconsIcon
                    icon={icon}
                    size={15}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </span>
                <span className="sm:mt-1.5 sm:block">{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
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
            <Image
              src={HERO_IMAGE}
              alt="A team of creators working together"
              fill
              priority
              sizes="(min-width: 1024px) 620px, 100vw"
              className="object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-contrast/40 via-transparent to-transparent"
            />
          </div>

          <div className="relative mt-3 rounded-2xl border border-border bg-surface p-4 shadow-xl shadow-ink/[0.08] sm:p-5 lg:absolute lg:bottom-4 lg:right-4 lg:mt-0 lg:w-[20rem]">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand-strong">
                <HugeiconsIcon
                  icon={TrophyIcon}
                  size={17}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </span>
              <Eyebrow className="text-muted">This month&apos;s theme</Eyebrow>
            </div>
            <h2 className="mt-3 text-xl font-bold leading-tight tracking-[-0.03em] text-ink">
              {competition.theme}
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-muted">
              {competition.themeSummary}
            </p>
            <Link
              href="/ideathon/about"
              className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded text-xs font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              View theme
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
