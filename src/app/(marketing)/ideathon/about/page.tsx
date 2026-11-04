import type { Metadata } from "next";
import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon, Calendar03Icon } from "@hugeicons/core-free-icons";

import { Container } from "@/components/ui/container";
import { CompetitionInfoPage } from "@/features/ideathon/components/competition-info-page";
import { CompetitionNav } from "@/features/ideathon/components/competition-nav";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  description:
    "How an Inverge ideathon works: the brief, eligibility, submission, community support and the published judging method.",
  og: { eyebrow: "Ideathon", template: "ideathon" },
  path: "/ideathon/about",
  title: "How the ideathon works",
});

export default function IdeathonAboutPage() {
  return (
    <Container>
      <CompetitionNav />
      <div className="py-10 sm:py-12">
        <CompetitionInfoPage
          eyebrow="How it works"
          title="A brief, a build, a published result"
          intro="Each Inverge programme is a time-boxed challenge with its own brief, eligibility, submission requirements and judging method. The programme page is the source of truth; this page explains the shape every edition follows."
          sections={[
            {
              title: "1. The organiser publishes the brief",
              body: "Before entries open, the organiser publishes the challenge, who may enter, the submission requirements, the timeline and the scoring method. Dates are shown in UTC. If a requirement changes, it is an announcement, not a silent edit.",
            },
            {
              title: "2. A builder enters an idea",
              body: "You can enter a new idea or an existing one, depending on the programme's entry mode. Registration may be required first. A submitted entry freezes a snapshot: editing your idea afterwards does not change what judges scored.",
              bullets: [
                "Drafts can be saved and resumed while submissions are open.",
                "A submitted entry is immutable until the organiser allows a new version.",
                "Withdrawal is only available when the programme permits it and before judging starts.",
              ],
            },
            {
              title: "3. The community responds",
              body: "Support is recorded against the idea behind the entry. Community-only programmes rank on that support. Hybrid programmes combine it with the judge score using the weights published on the programme page.",
              bullets: [
                "A supporter is counted once per idea.",
                "A paid boost, sponsorship or advertisement is labelled and never counted in the official score.",
                "The leaderboard is published after judging, not as a live popularity chart.",
              ],
            },
            {
              title: "4. Judges score against the rubric",
              body: "Judges score each criterion on the published range. The organiser publishes the weights, how many evaluations are required, what happens when one is missing, and the tie-break order. A missing evaluation is excluded with a reason, or explicitly counted as zero; it is never silently averaged in.",
            },
            {
              title: "5. Results are published and kept",
              body: "A published result records the order, the scoring method, the rubric and a checksum over the inputs. Participants may see provisional results first. Public standings appear only after the organiser publishes them. A correction is a new revision beside the frozen order.",
            },
          ]}
          aside={{
            icon: Calendar03Icon,
            title: "Find the current brief",
            body: (
              <>
                <p>
                  The catalogue shows every published programme and its phase.
                  Open an edition for its dates, eligibility and judging rules.
                </p>
                <Link
                  href="/ideathon"
                  className="mt-3 inline-flex items-center gap-1 font-semibold text-brand-strong underline decoration-brand/25 underline-offset-4 hover:decoration-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Browse programmes
                  <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    size={13}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </Link>
              </>
            ),
          }}
        />

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-sm">
          <Link
            href="/ideathon/rules"
            className="font-semibold text-brand-strong underline decoration-brand/25 underline-offset-4 hover:decoration-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Read the ranking rules
          </Link>
          <Link
            href="/ideathon/past"
            className="font-semibold text-ink-soft underline decoration-border underline-offset-4 hover:decoration-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            See past results
          </Link>
        </div>
      </div>
    </Container>
  );
}
