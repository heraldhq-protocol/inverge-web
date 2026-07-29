import React from 'react';

export type GuideStep = { title: string; body: React.ReactNode };

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  audience: string;
  readingTime: string;
  intro: React.ReactNode;
  steps: GuideStep[];
};

/**
 * How-to guides as typed constants. No content backend exists yet, and the marketing surface
 * renders no live data. Swap for a CMS/API read later without touching the pages that consume it.
 */
export const GUIDES: Guide[] = [
  {
    slug: 'publish-your-first-idea',
    title: 'Publish your first idea',
    summary: 'From a rough idea to a validated page ready to raise, step by step.',
    audience: 'For builders',
    readingTime: '6 min',
    intro: (
      <p>
        Publishing on Inverge starts before you raise a single naira. You put your idea in front of
        real people, gather feedback, and only open a campaign once it’s sharp. Here’s how to do it
        well.
      </p>
    ),
    steps: [
      {
        title: 'Describe the problem, not just the product',
        body: (
          <p>
            Lead with the problem you’re solving and who has it. Backers support builders who clearly
            understand a real pain. The product is how you solve it, not the pitch itself.
          </p>
        ),
      },
      {
        title: 'Publish to the validation stage',
        body: (
          <p>
            Your idea goes live for people to follow, comment on, and signal support or pre-pledge
            interest. Nothing is being raised yet; this is where you learn cheaply.
          </p>
        ),
      },
      {
        title: 'Listen, then sharpen',
        body: (
          <p>
            Respond to feedback and revise. Builders who engage here set tighter milestones and raise
            faster later. The hard questions are a gift, so answer them now.
          </p>
        ),
      },
      {
        title: 'Shape your milestones',
        body: (
          <p>
            Break your plan into concrete, verifiable stages: a prototype, a pilot, a first batch.
            Each milestone should be something you could show proof of. Map your ask to those stages
            so the numbers and the plan line up.
          </p>
        ),
      },
      {
        title: 'Open your campaign',
        body: (
          <p>
            When your idea is validated and your milestones are set, open the campaign. Funds are held
            in escrow and released as you deliver, so backers commit with confidence.
          </p>
        ),
      },
    ],
  },
  {
    slug: 'how-to-back-a-project',
    title: 'How to back a project',
    summary: 'What backing means, how your money is protected, and how to back well.',
    audience: 'For backers',
    readingTime: '4 min',
    intro: (
      <p>
        Backing on Inverge is designed to be safer than most crowdfunding, but a careful backer
        still backs better. Here’s what to do.
      </p>
    ),
    steps: [
      {
        title: 'Read the milestones first',
        body: (
          <p>
            Strong campaigns have concrete milestones you could almost photograph. Vague stages are
            harder to verify and refund fairly. Concrete is a green flag.
          </p>
        ),
      },
      {
        title: 'Choose your amount',
        body: (
          <p>
            Pick what you want to contribute. That amount is held in escrow and released to the
            builder only as milestones are delivered, never handed over all at once.
          </p>
        ),
      },
      {
        title: 'Follow the progress',
        body: (
          <p>
            As the builder delivers, each milestone’s funds release. You can watch the project move
            and see the proof behind every stage.
          </p>
        ),
      },
      {
        title: 'Know your refund protection',
        body: (
          <p>
            If a builder fails to deliver a funded milestone, the money tied to it is eligible to come
            back to you. That protection is what lets you back with confidence.
          </p>
        ),
      },
    ],
  },
  {
    slug: 'milestones-and-refunds',
    title: 'How milestones and refunds work',
    summary: 'The mechanism at the heart of Inverge: how money is held, released, and returned.',
    audience: 'For everyone',
    readingTime: '5 min',
    intro: (
      <p>
        Milestones are the whole idea. Understanding them explains why Inverge can promise
        accountability where other platforms only hope for it.
      </p>
    ),
    steps: [
      {
        title: 'Funds are held in escrow',
        body: (
          <p>
            When you back a campaign, your contribution isn’t sent straight to the builder. It’s held
            in escrow, set aside and tied to the campaign’s milestones.
          </p>
        ),
      },
      {
        title: 'Release is gated on proof, not time',
        body: (
          <p>
            Each milestone releases only when the builder shows it’s done. A deadline doesn’t unlock
            money; evidence does. That’s the difference between a schedule and accountability.
          </p>
        ),
      },
      {
        title: 'Undelivered milestones are refundable',
        body: (
          <p>
            If a funded milestone isn’t delivered within the campaign’s terms, the portion of your
            contribution tied to it is eligible to be returned. Delivered milestones aren’t refunded
            just because a later one fails.
          </p>
        ),
      },
      {
        title: 'Everything leaves a receipt',
        body: (
          <p>
            Contributions, releases, and refunds all leave a clear record you can view from your
            account, so there’s never any guesswork about where things stand.
          </p>
        ),
      },
    ],
  },
  {
    slug: 'get-verified',
    title: 'Get verified as a builder',
    summary: 'Why verification exists and what to expect when you raise funds.',
    audience: 'For builders',
    readingTime: '3 min',
    intro: (
      <p>
        Before a campaign can collect money, builders verify their identity, and where relevant
        their business too. It keeps the platform trustworthy for everyone. Here’s what happens.
      </p>
    ),
    steps: [
      {
        title: 'Start when you open a campaign',
        body: (
          <p>
            Verification is prompted at the point you move from validating an idea to raising for it.
            You can explore and publish an idea before this step.
          </p>
        ),
      },
      {
        title: 'Confirm your identity',
        body: (
          <p>
            You’ll confirm who you are with our verification partner: typically a government ID and a
            quick selfie check. It only takes a few minutes.
          </p>
        ),
      },
      {
        title: 'Add business details if needed',
        body: (
          <p>
            If you’re raising on behalf of a registered business, you may be asked for business
            details too, so backers know exactly who they’re supporting.
          </p>
        ),
      },
      {
        title: 'Get the green light',
        body: (
          <p>
            Once verified, your campaign can collect funds. Your personal documents stay with the
            verification partner, and Inverge only receives the result.
          </p>
        ),
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
