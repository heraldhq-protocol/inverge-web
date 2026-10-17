import type { Metadata } from "next";
import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";

import { CompetitionInfoPage } from "@/features/ideathon/components/competition-info-page";

export const metadata: Metadata = {
  title: "Ideathon rules | Inverge",
  description:
    "How Inverge ranks ideathon entries, what counts as support, and what never affects the standings.",
};

export default function IdeathonRulesPage() {
  return (
    <CompetitionInfoPage
      eyebrow="Rules and ranking"
      title="Weighted support, never money"
      intro="The standings measure how strongly the community responds to an idea. They do not measure how much an idea could raise, and no payment changes a position."
      sections={[
        {
          title: "How the score works",
          body: "Each account can contribute one support, one structured feedback response, and one pre-pledge to an idea. Each of those actions is worth one point. A point is then weighted by how verified that account is, so a response from a verified account carries more weight than an unverified one.",
          bullets: [
            "Email-only account: 0.25 weight",
            "Verified social account: 0.7 weight",
            "Identity-verified account: 1.0 weight",
          ],
        },
        {
          title: "The pre-pledge amount is not points",
          body: "A pre-pledge shows what someone might consider contributing if the idea becomes a campaign. It is non-binding and no money moves. The amount is displayed for context, but it cannot raise a score beyond the single point the account already earned. A large pre-pledge does not outrank a committed community.",
        },
        {
          title: "Tie-breaks",
          body: "When two ideas have the same weighted score, the one with more supporters is placed first. If that is also equal, the earlier id is used so the order stays stable and reproducible.",
        },
        {
          title: "What never affects ranking",
          body: "Ranking is money-blind by construction. The score reads only whether an account supported, gave feedback, or pre-pledged, plus that account's verification tier.",
          bullets: [
            "Paid placement or a boost on an idea",
            "Sponsorship of a challenge or a prize",
            "The size of any pre-pledge",
            "The theme a reader arrived from",
          ],
        },
        {
          title: "Fair play",
          body: "Support is limited to one per account per idea, and duplicate attempts do not add points. Unusual patterns are flagged for human review. At launch, automated disqualification is off: a person reviews a flag before any entry changes status, and the entrant can respond.",
        },
        {
          title: "Results and prizes",
          body: "Standings are live while the round is open. After entries close, the final order is frozen and published. Any prize or recognition is fulfilled outside the platform. It is not an investment, a return, or a payment from escrowed funds.",
        },
        {
          title: "Questions and corrections",
          body: "If a standing looks wrong, contact the team before the round closes so it can be reviewed while the data is still live. Corrections after publication are handled as a written note on the result, not a silent edit.",
        },
      ]}
      aside={{
        icon: Shield01Icon,
        title: "Ranking is money-blind",
        body: (
          <>
            <p>
              The score cannot read a prize value, a boost, or a pre-pledge
              amount. Those fields are not inputs to the calculation.
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
