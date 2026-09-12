export type EditorialEntry = {
  kind: "Guide" | "Journal";
  slug: string;
  title: string;
  summary: string;
  readTime: string;
  cover?: "signal" | "milestones" | "refunds" | "questions";
  sections: Array<{
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
};

export const guides = [
  {
    kind: "Guide",
    slug: "publish-and-validate-an-idea",
    title: "Publish and validate an idea",
    summary:
      "How builders can test demand, learn from structured feedback, and prepare a campaign without collecting money too early.",
    readTime: "6 min read",
    sections: [
      {
        heading: "Start with the problem",
        paragraphs: [
          "An Inverge idea page is the first public version of what you want to build. It should make the problem, proposed solution, roadmap, and intended funding ask understandable to someone outside your team.",
          "Specificity is more useful than polish. Explain who has the problem, how they handle it today, what you have learned already, and what would change if your idea works.",
        ],
      },
      {
        heading: "Ask for useful signals",
        paragraphs: [
          "Visitors can support the idea, answer structured questions, and record a non-binding pre-pledge. A pre-pledge is an expression of intent only: no money moves and nobody is charged.",
          "These signals help you distinguish enthusiasm from likely demand. Paid promotion may improve discovery, but it must be labelled and never changes supporter, feedback, or pre-pledge metrics.",
        ],
        bullets: [
          "Ask a focused question that could change your plan.",
          "Share meaningful revisions instead of defending every assumption.",
          "Treat pre-pledges as directional evidence, not guaranteed campaign revenue.",
        ],
      },
      {
        heading: "Move from validation to a campaign",
        paragraphs: [
          "Once the configured validation threshold is met, an eligible builder can prepare a campaign draft. Supporters carry over as a launch waitlist, but they still decide independently whether to contribute.",
          "Campaign submission requires identity verification, a clear target and deadline, optional rewards, and two to six ordered milestones. Each milestone names the deliverable, tranche percentage, and evidence that will be used to assess it.",
          "Launch campaigns are curated and all-or-nothing. Submission includes a disclosed, non-refundable application fee for review; paying it does not guarantee approval.",
        ],
      },
      {
        heading: "Before you submit",
        paragraphs: [
          "A strong draft makes the funding mechanics as clear as the story.",
        ],
        bullets: [
          "Make the target traceable to a realistic budget.",
          "Define evidence that a backer can understand and inspect.",
          "Describe material delivery risks and dependencies plainly.",
          "Plan a working-capital tranche no larger than the published first-milestone budget and within the platform cap.",
          "Offer only rewards or donation-based support—never ownership, yield, dividends, or financial returns.",
        ],
      },
    ],
  },
  {
    kind: "Guide",
    slug: "back-a-campaign",
    title: "Back a campaign with clear eyes",
    summary:
      "What to inspect before contributing, how all-or-nothing funding works, and why backing a project is not the same as buying a finished product.",
    readTime: "6 min read",
    sections: [
      {
        heading: "Backing is support for work still to be done",
        paragraphs: [
          "A campaign is not a shop listing for an item already on a shelf. You are supporting a builder's plan and may receive a published reward, but delivery still carries risk.",
          "Inverge reviews launch campaigns for completeness and fit. Review and identity verification reduce some risks; they do not guarantee that a builder will succeed or deliver on time.",
        ],
      },
      {
        heading: "Read the whole campaign",
        paragraphs: [
          "Before contributing, look beyond the headline and funding progress.",
        ],
        bullets: [
          "Understand the problem, proposed solution, team, and prior work.",
          "Check the target, deadline, budget, rewards, timeline, and stated risks.",
          "Read every milestone and its evidence definition.",
          "Notice the working-capital amount released when funding succeeds; that tranche cannot later be refunded.",
          "Ask questions when a claim, dependency, or reward timeline is unclear.",
        ],
      },
      {
        heading: "Know when money moves",
        paragraphs: [
          "Launch campaigns use all-or-nothing funding. If the target is not reached by the deadline, the campaign does not proceed and your full contribution becomes claimable as a refund.",
          "If the target is reached, campaign terms lock and the published working-capital tranche releases so work can begin. The rest remains in escrow and is released in later tranches after milestone review.",
          "Checkout will show the contribution amount, conversion or payment costs, the working-capital disclosure, and applicable refund rules before you confirm.",
        ],
      },
      {
        heading: "Stay involved after funding",
        paragraphs: [
          "Builders submit the evidence defined for each milestone. Backers are notified and receive a review window. Read the evidence, compare it with the published definition, and object when the requirement has not been met.",
          "A lack of objections can lead to approval at the end of the window, so participation matters. Campaign updates, milestone status, release records, and eligible refunds are designed to remain visible throughout the lifecycle.",
        ],
      },
    ],
  },
  {
    kind: "Guide",
    slug: "milestones-objections-and-refunds",
    title: "Milestones, objections, and refunds",
    summary:
      "A precise explanation of how campaign funds move, what backers review, and which amounts may be refundable.",
    readTime: "8 min read",
    sections: [
      {
        heading: "The campaign plan is fixed before funding",
        paragraphs: [
          "Every published campaign defines two to six ordered milestones. Each one includes a deliverable, a percentage of the raise, and an evidence definition. The published terms are locked when the campaign succeeds so the standard cannot be quietly weakened afterward.",
          "The launch product supports curated all-or-nothing campaigns. Flexible funding is a later-phase design and is not available at launch.",
        ],
      },
      {
        heading: "The first release is different",
        paragraphs: [
          "When a campaign reaches its target, a working-capital tranche releases immediately. It is sized to the milestone-one budget and capped by platform configuration within the approved 20–25% range.",
          "This amount lets a builder begin work. It is disclosed before contribution and is not refundable after release, even if a later milestone fails. Released tranches are never clawed back.",
        ],
      },
      {
        heading: "How milestone review works",
        paragraphs: [
          "For each later release, the builder submits the promised proof bundle. A review window opens—seven days by default—and backers can inspect the evidence and object.",
          "The milestone auto-approves when the window closes unless objections reach the configured share of contributed capital. Individual voting weight is capped so one large backer cannot control the outcome alone.",
          "If the threshold is reached, the milestone fails. The builder may use the governed appeal process, where a review panel rules within the configured window.",
        ],
      },
      {
        heading: "When a refund is available",
        paragraphs: [
          "If an all-or-nothing campaign misses its target, each backer can claim their full contribution. If a milestone objection is upheld, each backer can claim their pro-rata share of funds still in escrow.",
          "A refund after milestone failure does not include the working-capital tranche or any earlier approved tranche. Unclaimed refundable funds remain claimable; the product must show the amount and provide a direct claim path.",
          "This is a defined refund mechanism, not a guarantee that all contributed money can always be recovered.",
        ],
      },
      {
        heading: "What will be verifiable",
        paragraphs: [
          "Campaign contributions, tranche releases, and refund events are recorded through the escrow programme and surfaced as plain-language receipts. People who want technical detail can inspect the underlying network record.",
          "Inverge's public transparency view is designed to reconcile to finalised on-chain state rather than asking users to trust an editable platform total.",
        ],
      },
    ],
  },
  {
    kind: "Guide",
    slug: "identity-verification",
    title: "Identity verification on Inverge",
    summary:
      "Why builders verify before campaign review, when backers may need to verify, and how identity documents are handled.",
    readTime: "5 min read",
    sections: [
      {
        heading: "Who needs to verify",
        paragraphs: [
          "Builders must complete identity verification before a campaign can enter curation review. Backers can contribute with lighter onboarding below a configurable cumulative threshold; crossing that threshold requires verification before further funding.",
          "The exact checks and thresholds will be disclosed in the product when the relevant providers and launch jurisdictions are confirmed.",
        ],
      },
      {
        heading: "What Inverge stores",
        paragraphs: [
          "Identity checks are performed through a selected verification provider. Inverge records the provider reference, status transitions, and timestamps needed for account and audit workflows.",
          "Raw identity documents must not be stored on Inverge infrastructure. The provider's own privacy terms and retention practices will be shown before verification begins.",
        ],
      },
      {
        heading: "What verification means",
        paragraphs: [
          "Verification confirms only the checks named in the product. It is not an endorsement of a campaign, a guarantee of delivery, or proof that a business will succeed.",
          "Campaign curation, evidence-bound milestones, backer review, and public settlement records address different risks. No single badge replaces careful review.",
        ],
      },
      {
        heading: "Privacy and support",
        paragraphs: [
          "Inverge will request only information needed for the relevant check, limit access, and publish final retention and data-rights procedures before launch.",
          "The public privacy page is currently a pre-launch draft. Contact hello@inverge.africa with a verification or privacy question while provider selection remains open.",
        ],
      },
    ],
  },
] satisfies EditorialEntry[];

export const journalEntries = [
  {
    kind: "Journal",
    slug: "why-validation-comes-before-fundraising",
    cover: "signal",
    title: "Why validation should come before fundraising",
    summary:
      "Applause is encouraging. Useful signals help a builder decide what to make, for whom, and whether a campaign is ready.",
    readTime: "5 min read",
    sections: [
      {
        heading: "A campaign can be too early",
        paragraphs: [
          "Traditional campaign-first crowdfunding compresses two questions into one: do people care, and will they pay? A builder can spend weeks creating a polished launch before learning that the problem, audience, or offer is still unclear.",
          "Inverge separates validation from funding. An idea can gather support, structured feedback, and non-binding pre-pledges before the builder asks anyone to transfer money.",
        ],
      },
      {
        heading: "Different signals answer different questions",
        paragraphs: [
          "A supporter count shows reach. Feedback reveals what people understand, doubt, or need changed. A pre-pledge records intended contribution value without moving funds. None is perfect alone, but together they tell a more useful story than page views.",
          "That is also why paid placement must stay separate. Promotion can help the right audience discover an idea; it cannot buy validation or alter the public metrics.",
        ],
      },
      {
        heading: "Validation is a gate, not a guarantee",
        paragraphs: [
          "Strong early signals do not guarantee a funded campaign. Pre-pledges are non-binding, circumstances change, and campaign terms may differ from the first idea page.",
          "The goal is better learning and a more informed launch—not manufactured certainty. Builders still need a realistic budget, clear milestones, honest risks, and a community willing to make a real contribution.",
        ],
      },
    ],
  },
  {
    kind: "Journal",
    slug: "why-milestones-change-crowdfunding",
    cover: "milestones",
    title: "Why milestones change the crowdfunding bargain",
    summary:
      "Funding should not be the moment accountability disappears. A milestone model keeps the plan, proof, and next release connected.",
    readTime: "6 min read",
    sections: [
      {
        heading: "The trust gap opens after a successful raise",
        paragraphs: [
          "Campaign pages are rich with targets, timelines, and promises. In many crowdfunding models, nearly all the money is handed over when the target is met. Backers then depend mostly on goodwill and updates while builders carry all the execution pressure at once.",
          "Milestone escrow changes the sequence. The campaign describes the work in ordered stages and links later funding releases to evidence published for backer review.",
        ],
      },
      {
        heading: "Builders still need money to begin",
        paragraphs: [
          "A system that demands completed work before releasing any capital would defeat the purpose of crowdfunding. Inverge therefore starts a successful campaign with a disclosed working-capital tranche tied to the first milestone's budget.",
          "That first release is not refundable. The trade-off is explicit: builders receive enough capital to begin, while the remaining funds stay staged against later delivery.",
        ],
      },
      {
        heading: "Evidence makes the milestone real",
        paragraphs: [
          "A label such as ‘prototype complete’ is not enough. The campaign must define what proof will be submitted and where it comes from before funding begins. Backers can then compare the claim with a stable standard instead of a rewritten promise.",
          "Milestones do not remove delivery risk. They create clearer checkpoints, a shared record, and a defined response when the evidence does not support release.",
        ],
      },
    ],
  },
  {
    kind: "Journal",
    slug: "what-a-refund-promise-should-mean",
    cover: "refunds",
    title: "What a refund promise should actually mean",
    summary:
      "A refund claim builds trust only when people can see its limits, trigger, amount, and path before they contribute.",
    readTime: "6 min read",
    sections: [
      {
        heading: "‘Money back’ needs a boundary",
        paragraphs: [
          "A broad refund slogan sounds reassuring but can hide the moment that matters: how much money is still available when something goes wrong? If a builder has already received legitimate funding for approved work, that money cannot simply be treated as untouched.",
          "Inverge defines refunds against escrow state. A missed all-or-nothing target makes the full contribution claimable. An upheld milestone objection makes only the backer's share of remaining escrow claimable.",
        ],
      },
      {
        heading: "Disclose the non-refundable amount first",
        paragraphs: [
          "The working-capital tranche releases as soon as a successful campaign activates. It and every later approved tranche are not clawed back. That fact belongs at checkout, not deep in a help article discovered after failure.",
          "Clear disclosure may make the headline less dramatic. It makes the promise more credible because a backer can understand the actual downside before confirming.",
        ],
      },
      {
        heading: "A refund must remain actionable",
        paragraphs: [
          "Eligibility is not enough. The interface should show the claimable amount, why it became available, the record behind it, and a direct action to claim it. A backend outage should not erase the underlying right to funds that remain in escrow.",
          "Public refund events are not embarrassing exceptions. They are evidence that the rules continue to work when a campaign does not go to plan.",
        ],
      },
    ],
  },
  {
    kind: "Journal",
    slug: "questions-to-ask-before-backing",
    cover: "questions",
    title: "Seven questions to ask before backing a campaign",
    summary:
      "A practical reading list for assessing the builder, plan, evidence, risks, and refund boundaries behind a campaign.",
    readTime: "4 min read",
    sections: [
      {
        heading: "Read for decisions, not reassurance",
        paragraphs: [
          "A strong campaign helps you make an informed decision. Before contributing, ask:",
        ],
        bullets: [
          "Is the problem specific, and does the builder show credible knowledge of it?",
          "What has already been built, tested, or learned?",
          "Does the target connect to a believable budget?",
          "Can I understand every milestone and its evidence definition?",
          "Which dependencies or delivery risks could change the plan?",
          "How much working capital releases immediately, and what remains in escrow?",
          "What reward, update cadence, and refund outcome should I realistically expect?",
        ],
      },
      {
        heading: "Verification is one input",
        paragraphs: [
          "Identity verification and campaign review can reduce obvious abuse, but they do not predict execution. Look at the builder's relevant experience, clarity, responses to questions, and willingness to name uncertainty.",
          "Backing always carries risk. The purpose of clearer campaign terms and staged releases is to make that risk more visible and governable, not to pretend it has disappeared.",
        ],
      },
    ],
  },
] satisfies EditorialEntry[];

export function findEditorialEntry(entries: EditorialEntry[], slug: string) {
  return entries.find((entry) => entry.slug === slug);
}
