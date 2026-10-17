import type { Metadata } from "next";
import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon, Calendar03Icon } from "@hugeicons/core-free-icons";

import { CompetitionInfoPage } from "@/features/ideathon/components/competition-info-page";
import { previewCompetition } from "@/features/ideathon/content/preview-competition";

export const metadata: Metadata = {
  title: "About the ideathon | Inverge",
  description:
    "How the Inverge monthly ideathon works: the theme, who can take part, and what participants get from entering.",
};

const formatRange = (startsAt: string, endsAt: string) =>
  `${new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(startsAt))} to ${new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(endsAt))}`;

export default function IdeathonAboutPage() {
  return (
    <CompetitionInfoPage
      eyebrow="About the ideathon"
      title="A monthly round for ideas worth building"
      intro={`The Inverge ideathon gives early-stage African builders a monthly reason to publish what they are working on and a real audience to learn from. This month's theme is ${previewCompetition.theme.toLowerCase()}: ${previewCompetition.themeSummary.toLowerCase()}`}
      sections={[
        {
          title: "Who can take part",
          body: "Anyone with a published idea can enter while entries are open. Ideas stay free to publish, and a private idea can be entered without being listed in public discovery. The creator must own the idea they enter.",
        },
        {
          title: "What participants get",
          body: "Every entrant keeps the validation signal they gather: supporters, structured feedback, and non-binding funding interest. The strongest ideas are featured, and the round gives creators a reason to ask their audience for an honest response instead of waiting for a launch.",
          bullets: [
            "A public page that shows progress, not just a pitch",
            "Structured feedback from people outside your own network",
            "Recognition for the ideas the community responds to most",
          ],
        },
        {
          title: "How the round runs",
          body: `Entries are open from ${formatRange(previewCompetition.startsAt, previewCompetition.endsAt)}. Standings refresh while the round is open. After entries close, the final order is published and the next month's theme is announced.`,
          bullets: [
            "Entries open: 1 October 2026",
            "Entries close: 31 October 2026",
            "Next theme announced with the results",
          ],
        },
        {
          title: "What a prize is",
          body: `${previewCompetition.prizeDescription} A prize is recognition. It is not an investment, a return, or a payment from escrowed funds, and it never changes how an idea is ranked.`,
        },
        {
          title: "Why the theme exists",
          body: "A shared theme makes the month comparable: readers can explore one problem space, and creators can see how similar ideas are being received. The theme guides which ideas are invited into the round. It does not weight the scoring.",
        },
      ]}
      aside={{
        icon: Calendar03Icon,
        title: "This month's schedule",
        body: (
          <>
            <p>{formatRange(previewCompetition.startsAt, previewCompetition.endsAt)}</p>
            <p className="mt-2">
              Standings are preview data until the community loop ships.
            </p>
            <Link
              href="/ideathon"
              className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded text-xs font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              View standings
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={14}
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </Link>
          </>
        ),
      }}
    />
  );
}
