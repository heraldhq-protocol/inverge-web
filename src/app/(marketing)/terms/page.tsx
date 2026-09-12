import type { Metadata } from "next";

import {
  LegalDocument,
  type LegalSection,
} from "@/features/marketing/components/legal-document";
import { PageHeader } from "@/features/marketing/components/page-header";

export const metadata: Metadata = {
  title: "Terms preview — Inverge",
  description: "The pre-launch draft terms preview for Inverge.",
};

const sections: LegalSection[] = [
  {
    heading: "Status of this preview",
    paragraphs: [
      "This page is a plain-language, pre-launch preview of the rules Inverge expects the service to require. It is not a binding user agreement, is not yet in force, and must be completed and reviewed by Nigerian counsel before accounts or live financial services launch.",
      "The final terms will identify the operating legal entity, governing law, dispute process, service providers, fees, launch jurisdictions, and effective date. Product checkout disclosures and published campaign terms will also govern specific transactions.",
    ],
  },
  {
    heading: "What Inverge is",
    paragraphs: [
      "Inverge is being built as an idea-validation and crowdfunding platform. It will help builders publish ideas, gather non-financial validation signals, submit curated campaigns, receive rewards or donation-based contributions, and deliver work through published milestones.",
      "Inverge is not a bank, deposit account, investment adviser, securities exchange, or promise of business success. Launch campaigns will not offer equity, dividends, interest, yield, profit share, or other financial returns.",
    ],
  },
  {
    heading: "Eligibility and accounts",
    paragraphs: [
      "The launch service is intended for people aged 18 or older who can lawfully use it. Users will need to provide accurate information, protect account access, and promptly report suspected compromise.",
      "Builders must complete identity verification before campaign review. Backers may be required to verify after configurable contribution thresholds or where law, risk controls, or a payment provider requires it. Inverge may limit jurisdictions and features based on legal and operational readiness.",
    ],
  },
  {
    heading: "Ideas and pre-pledges",
    paragraphs: [
      "Publishing or supporting an idea is not a crowdfunding transaction. Support, structured feedback, and a pre-pledge are validation signals. A pre-pledge is non-binding, moves no money, and does not oblige either person to participate in a later campaign.",
      "Paid idea placement, where available, will be labelled. Payment for discovery must not alter or be merged with organic supporter, feedback, or pre-pledge metrics.",
    ],
  },
  {
    heading: "Campaign submission and curation",
    paragraphs: [
      "Launch campaigns must publish a target, deadline, reward terms where applicable, risks, and two to six ordered milestones with tranche percentages and evidence definitions. Campaigns require review before publication.",
      "A disclosed, flat application fee is payable before entering the review queue. It is non-refundable regardless of approval, requested changes, or rejection. Paying it does not guarantee publication, promotion, funding, or delivery.",
      "Campaign terms and evidence definitions become fixed when the campaign succeeds. Builders are responsible for truthful content, lawful rewards, realistic delivery information, updates, and evidence they have the right to publish.",
    ],
  },
  {
    heading: "Contributions and funding outcomes",
    paragraphs: [
      "Launch campaigns use all-or-nothing funding. If the target is not reached by the deadline, each backer can claim the full contribution. If the target is reached, the campaign activates under its published terms.",
      "Checkout will disclose the contribution amount, supported settlement asset, payment or conversion charges, platform fees where relevant, reward terms, working-capital release, and refund rules before confirmation. Exact configured values will control over illustrative marketing copy.",
      "A contribution supports work still to be completed. It is not a purchase of an investment and does not guarantee delivery, timing, reward quality, or business success.",
    ],
  },
  {
    heading: "Milestones and working capital",
    paragraphs: [
      "When a campaign succeeds, the published working-capital tranche releases immediately to help begin milestone one. It is limited by the approved campaign budget and platform cap and is not refundable after release.",
      "For later tranches, the builder submits the required proof bundle and a review window opens. A milestone auto-approves at the end of the window unless backer objections reach the configured threshold. Voting-weight limits and a governed appeal process apply as shown in the campaign.",
      "Released funds are not clawed back and are not restricted by Inverge after release. A subsequent tranche remains conditional on approval of the corresponding milestone.",
    ],
  },
  {
    heading: "Refunds",
    paragraphs: [
      "A missed all-or-nothing target makes the full contribution claimable. An upheld milestone objection makes each backer's pro-rata share of the remaining escrow balance claimable. Previously released working capital and approved tranches are excluded.",
      "Refunds are claim based. Eligible users remain responsible for initiating a claim through the available product or programme path. Network costs, payment-provider reversals, currency conversion, tax treatment, and reward consequences will be disclosed in the final terms and checkout where applicable.",
    ],
  },
  {
    heading: "Acceptable use and content",
    paragraphs: [
      "Users must not misuse Inverge or use it to harm others. Prohibited conduct will include:",
    ],
    bullets: [
      "False, misleading, fraudulent, unlawful, infringing, or impersonating content.",
      "Promised financial returns, prohibited securities offers, money laundering, sanctions evasion, or unlawful goods and services.",
      "Manipulation of validation metrics, campaigns, objections, reviews, referrals, or platform systems.",
      "Malware, credential theft, private-key solicitation, unauthorised access, scraping that degrades the service, or attempts to bypass safeguards.",
      "Harassment, hate, exploitation, privacy violations, or publication of another person's sensitive information without a lawful basis.",
    ],
  },
  {
    heading: "Intellectual property",
    paragraphs: [
      "Users will retain ownership of content they create. The final terms will grant Inverge only the licence needed to host, display, moderate, promote, archive, and operate that content in connection with the service.",
      "Users must have the rights needed for anything they publish and must respect campaign backers' permitted use of rewards and materials. A notice-and-review process for infringement reports will be included before launch.",
    ],
  },
  {
    heading: "Platform action and availability",
    paragraphs: [
      "Inverge may reject content, pause actions, restrict accounts, preserve evidence, or cooperate with authorities when reasonably needed for safety, law, sanctions, fraud controls, system integrity, or enforcement. The final terms will define notice and appeal procedures where appropriate.",
      "Internet, payment, identity, wallet, blockchain, and third-party services can be unavailable or delayed. A submitted transaction is not final merely because a button was pressed. The product will distinguish pending, confirmed, failed, and reconciling states.",
    ],
  },
  {
    heading: "Risk and final legal terms",
    paragraphs: [
      "Crowdfunding involves delivery, timing, fraud, technical, payment, regulatory, and currency risks. Escrow and milestones can reduce or govern some risks but cannot eliminate them.",
      "Limitations of liability, warranties, indemnities, governing law, complaints, dispute resolution, amendment rights, termination effects, and consumer-law protections require legal drafting and are intentionally not invented in this preview.",
      "Questions about this draft can be sent to hello@inverge.africa. Do not send passwords, private keys, recovery phrases, or identity documents by email.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Legal"
        title="Terms preview"
        description="A plain-language preview of the intended rules for ideas, curated campaigns, contributions, milestones, and refunds."
        note="Pre-launch draft · Not yet in force · Nigerian legal review required"
      />
      <LegalDocument sections={sections} />
    </main>
  );
}
