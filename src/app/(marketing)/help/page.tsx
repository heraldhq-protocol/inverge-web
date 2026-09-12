import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/features/marketing/components/container";
import { PageHeader } from "@/features/marketing/components/page-header";

export const metadata: Metadata = {
  title: "Help centre — Inverge",
  description:
    "Answers to common questions about Inverge idea validation, campaigns, milestones, contributions, and refunds.",
};

const faqs = [
  [
    "What is Inverge?",
    "Inverge is a platform in development for idea validation and milestone-accountable crowdfunding, starting with builders in Nigeria and West Africa. Launch campaigns are curated, rewards or donation based, and all-or-nothing.",
  ],
  [
    "Does supporting an idea move money?",
    "No. Idea support, feedback, and pre-pledges are validation signals. A pre-pledge is non-binding and no funds move until a person separately chooses to contribute to a live campaign.",
  ],
  [
    "Is backing the same as investing?",
    "No. Launch campaigns do not offer shares, profit, interest, yield, or financial returns. A contribution supports work that is still being completed and may include a non-financial reward.",
  ],
  [
    "What happens if a campaign misses its target?",
    "Launch campaigns are all-or-nothing. If the target is not reached by the deadline, each backer can claim a full refund of their contribution.",
  ],
  [
    "Does a builder receive anything when funding succeeds?",
    "Yes. The published working-capital tranche releases immediately so work can begin. It is tied to the first-milestone budget, capped by platform configuration, disclosed before contribution, and not refundable once released.",
  ],
  [
    "How are later milestone funds released?",
    "The builder submits the evidence defined in the campaign. Backers receive a review window and can object. The milestone auto-approves at the end of the window unless objections reach the configured threshold; an appeal process is available after failure.",
  ],
  [
    "What is refundable after a failed milestone?",
    "Only funds still in escrow. Previously released working capital and approved tranches are not clawed back. Eligible backers claim a pro-rata share of the remaining balance.",
  ],
  [
    "Does verification guarantee a campaign?",
    "No. Identity verification confirms specific identity checks, and campaign curation checks readiness and fit. Neither guarantees delivery or business success.",
  ],
  [
    "Do I need a crypto wallet?",
    "The planned default flow provisions an embedded wallet and presents familiar card, bank-transfer, or naira payment options through selected partners. Technical receipts remain available for people who want to inspect them.",
  ],
  [
    "Is Inverge already live?",
    "The public marketing and learning pages are available, but campaign browsing, accounts, payments, escrow, and product screens are still being built and verified.",
  ],
] as const;

export default function HelpPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Help centre"
        title="Straight answers, before money moves."
        description="These answers describe the approved launch model. Exact fees, thresholds, supported assets, and partners will be shown from authoritative configuration when the product is live."
      />
      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl divide-y divide-border border-y border-border">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group py-1">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4 text-lg font-bold text-ink transition-colors hover:text-brand [&::-webkit-details-marker]:hidden">
                {question}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand/10 text-brand transition-transform duration-200 group-open:rotate-180">
                  <ChevronDown className="size-4" aria-hidden="true" />
                </span>
              </summary>
              <p className="max-w-3xl pb-6 pr-10 leading-7 text-muted">
                {answer}
              </p>
            </details>
          ))}
        </div>
        <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-between gap-4 rounded-2xl bg-contrast p-6 text-white sm:p-8">
          <div>
            <h2 className="text-xl font-bold">Still unclear?</h2>
            <p className="mt-1 text-sm text-white/65">
              Read the detailed guides or ask us directly.
            </p>
          </div>
          <div className="flex gap-4 text-sm font-semibold">
            <Link
              href="/guides"
              className="underline decoration-brand underline-offset-4"
            >
              Browse guides
            </Link>
            <Link
              href="/contact"
              className="underline decoration-brand underline-offset-4"
            >
              Contact us
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
