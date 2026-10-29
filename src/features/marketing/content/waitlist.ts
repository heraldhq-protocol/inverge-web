export type WaitlistLaneId = "backer" | "builder";

type WaitlistLane = {
  body: string;
  cta: string;
  id: WaitlistLaneId;
  points: readonly string[];
  title: string;
};

/**
 * The launch list has two audiences and one form. Each lane states what the
 * person gets, not what the product is; the form only uses the choice to send
 * the right update.
 */
export const waitlistLanes = [
  {
    id: "backer",
    title: "Back a build",
    body: "Follow vetted campaigns from validation to delivery, and put money in only when the plan makes sense.",
    points: [
      "An early look at campaigns before public launch.",
      "Milestone evidence before each release moves money.",
      "A refund path if a milestone fails review.",
    ],
    cta: "Join the backer list",
  },
  {
    id: "builder",
    title: "Start a build",
    body: "Publish the problem, the plan, and the evidence. Find out whether people want it before you ask them to fund it.",
    points: [
      "Free idea validation with public support and feedback.",
      "A clear route from a validated idea to campaign review.",
      "Milestone funding instead of one lump sum.",
    ],
    cta: "Join the builder list",
  },
] as const satisfies readonly WaitlistLane[];

export const waitlistSteps = [
  {
    title: "We email you when your lane opens.",
    body: "One message. No drip campaign, no countdown timer.",
  },
  {
    title: "You choose what happens next.",
    body: "Back a live campaign, or publish an idea for validation.",
  },
  {
    title: "Nothing is automatic.",
    body: "Joining creates no account, payment details, or wallet.",
  },
] as const;

export const waitlistFaq = [
  {
    question: "When does the list open?",
    answer:
      "We are opening in phases. The list hears first, and we will not publish a date until the first cohort is vetted. Joining does not commit you to anything.",
  },
  {
    question: "Which list should I pick?",
    answer:
      "Pick backer if you want to fund campaigns. Pick builder if you want to publish an idea. You can switch later; the choice only decides which update we send you.",
  },
  {
    question: "Will you email me often?",
    answer:
      "No. We will email you when your lane opens and when there is a material change worth knowing. You can leave the list from any email.",
  },
  {
    question: "Do I need a crypto wallet?",
    answer:
      "No. Backing is designed around familiar payment methods. Escrow and receipts run behind the scenes and are explained in plain language.",
  },
  {
    question: "Is this investing?",
    answer:
      "No. Inverge is rewards and donation crowdfunding only. There are no shares, dividends, interest, or financial returns.",
  },
] as const;
