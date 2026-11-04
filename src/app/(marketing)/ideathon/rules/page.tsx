import type { Metadata } from "next";
import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon, Shield01Icon } from "@hugeicons/core-free-icons";

import { Container } from "@/components/ui/container";
import { CompetitionInfoPage } from "@/features/ideathon/components/competition-info-page";
import { CompetitionNav } from "@/features/ideathon/components/competition-nav";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  description:
    "How Inverge ranks ideathon entries: judging methods, rubric weights, missing evaluations, tie-breaks and published results.",
  og: { eyebrow: "Ideathon", template: "ideathon" },
  path: "/ideathon/rules",
  title: "Ranking rules",
});

export default function IdeathonRulesPage() {
  return (
    <Container>
      <CompetitionNav />
      <div className="py-10 sm:py-12">
        <CompetitionInfoPage
          eyebrow="Ranking rules"
          title="Every rank has a published rule"
          intro="A programme's own page names the method it uses and the rubric it applies. This page describes the rules the scoring service enforces for every edition. If a programme says something different, the programme page wins for that edition."
          sections={[
            {
              title: "Four judging methods",
              body: "The organiser chooses one method before entries open. It is not changed after scoring starts.",
              bullets: [
                "Community: official score is community support normalised to the highest eligible entry, on a 0-100 scale.",
                "Judges: official score is the mean of completed rubric scores, each normalised to 0-100.",
                "Hybrid: official score combines the judge and community scores using the published percentages.",
                "Curated: the authorised judge decision sets the order and the official score is left empty; it is never presented as a measured score.",
              ],
            },
            {
              title: "Rubric weights must add up",
              body: "Judge-scored programmes publish a rubric with a label, a weight and a score range for every criterion. Weights are whole percentages and must total 100. A rubric that does not add up blocks publication rather than being silently normalised.",
            },
            {
              title: "Missing evaluations are never a quiet zero",
              body: "The programme states how many completed evaluations an entry needs. With the exclude policy, an entry below the minimum is not ranked and the reason is published beside the standings. The zero policy is only allowed when the organiser explicitly chooses it, and the rules say so.",
            },
            {
              title: "Ties are decided in a declared order",
              body: "The tie-break list is published on the programme page. It can use a named criterion, the rubric average, the earlier qualifying submission, or an authorised judge decision for a curated programme. The entry id is the final stable fallback, so two identical inputs cannot swap places between reads.",
            },
            {
              title: "Duplicates cannot inflate a score",
              body: "Each entry is a distinct programme entry with its own submitted snapshot. Evaluations are counted per assigned judge, and a judge with a declared conflict is excluded from that entry's score. Repeating a support action does not create a second supporter for the same idea.",
            },
            {
              title: "Paid promotion is not an input",
              body: "Sponsorship, advertising and paid promotion buy visibility. They do not enter the community score, the judge score, the rubric, the tie-break or the official rank. Any promoted placement is labelled.",
            },
            {
              title: "Results are published, then frozen",
              body: "Provisional results can be released to participants during review. Public standings appear only when the organiser publishes them. A publication records its revision, scoring method, rubric and a checksum over the inputs. A correction is a new revision; it never silently rewrites the order participants saw.",
            },
          ]}
          aside={{
            icon: Shield01Icon,
            title: "Check the edition",
            body: (
              <>
                <p>
                  The exact rubric, weights, missing-evaluation policy and
                  tie-break order are on each programme page. Read them before
                  you enter.
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
            href="/ideathon/about"
            className="font-semibold text-brand-strong underline decoration-brand/25 underline-offset-4 hover:decoration-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            How the ideathon works
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
