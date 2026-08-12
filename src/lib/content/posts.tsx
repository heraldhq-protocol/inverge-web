import React from 'react';

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  /** ISO date for <time dateTime>. */
  date: string;
  dateLabel: string;
  readingTime: string;
  body: React.ReactNode;
};

/**
 * Blog content lives here as typed constants rather than a CMS. There is no content backend yet
 * (only ideas/auth/kyc endpoints exist), and the marketing surface renders no live data. Swap this
 * module for a CMS/API read later without touching the pages that consume it.
 */
export const POSTS: Post[] = [
  {
    slug: 'why-milestones-not-lump-sums',
    title: 'Why we release funding in milestones, not lump sums',
    excerpt:
      'Handing over everything up front is the single biggest reason crowdfunding breaks trust. Here’s the model we chose instead, and why.',
    category: 'Product',
    author: 'The Inverge Team',
    date: '2026-07-14',
    dateLabel: '14 July 2026',
    readingTime: '5 min read',
    body: (
      <>
        <p>
          Most crowdfunding works like this: a builder hits their goal, the money lands in their
          account, and everyone hopes for the best. Sometimes it works out. Often it doesn’t, and
          when it doesn’t, backers have no recourse and builders have no structure to lean on.
        </p>
        <p>
          We think that model is backwards. So Inverge releases funding in milestones instead.
        </p>
        <h3>What a milestone actually is</h3>
        <p>
          A milestone is a concrete, verifiable step: a working prototype, a signed pilot, a first
          batch shipped. Money for that milestone is held in escrow until the builder shows it’s
          done. Only then does that tranche release. The next one waits its turn.
        </p>
        <p>
          Crucially, milestones are gated on <strong>proof</strong>, not time. A calendar doesn’t
          unlock money; evidence does. That’s the difference between a deadline and an accountability
          mechanism.
        </p>
        <h3>What it changes for both sides</h3>
        <ul>
          <li>
            <strong>Backers</strong> commit with confidence, because the money tied to work that
            never happens comes back to them.
          </li>
          <li>
            <strong>Builders</strong> get a structure that builds trust with every shipped stage, and
            a reason to raise from people who’ll still be there for round two.
          </li>
        </ul>
        <p>
          Accountability stops being a promise on a pitch page and becomes the way the money moves.
          That’s the whole idea.
        </p>
      </>
    ),
  },
  {
    slug: 'campuskonekt-two-milestones',
    title: 'How CampusKonekt raised $3,600 and shipped in two milestones',
    excerpt:
      'A campus food-ordering platform in Ibadan went from an idea with feedback to a funded product. Here’s exactly how the milestones played out.',
    category: 'Builder Stories',
    author: 'The Inverge Team',
    date: '2026-06-28',
    dateLabel: '28 June 2026',
    readingTime: '6 min read',
    body: (
      <>
        <p>
          When Tobi Adeyemi published CampusKonekt on Inverge, it wasn’t a finished product. It was
          a sharp idea and a clear problem: students on his campus in Ibadan were waiting far too long
          for food, and vendors had no reliable way to take orders.
        </p>
        <p>
          Before raising a dollar, Tobi validated. He gathered feedback, refined the pitch, and only
          then opened a campaign structured around two milestones.
        </p>
        <h3>Milestone one: a working ordering flow</h3>
        <p>
          The first tranche funded a working order-and-pay flow with three pilot vendors. When Tobi
          showed it live, with real orders and real vendors, that milestone released.
        </p>
        <h3>Milestone two: the vendor network</h3>
        <p>
          The second tranche funded onboarding fifteen more vendors and a delivery roster. Backers
          could see the network grow before that money released.
        </p>
        <p>
          By the end, CampusKonekt had raised <strong>$3,600</strong> across two milestones. Just as
          importantly, it had a base of backers who’d watched it deliver and would back the next thing
          too. That’s what accountability compounds into.
        </p>
      </>
    ),
  },
  {
    slug: 'validate-before-you-raise',
    title: 'Validating before you raise: what the numbers taught us',
    excerpt:
      'Ideas that gather real feedback before opening a campaign raise faster and refund less. We dug into why.',
    category: 'Insights',
    author: 'The Inverge Team',
    date: '2026-06-10',
    dateLabel: '10 June 2026',
    readingTime: '4 min read',
    body: (
      <>
        <p>
          Inverge has two stages for a reason. Before anyone raises, an idea lives in validation:
          people follow it, leave feedback, and signal whether they’d back it. Only then does a
          campaign open.
        </p>
        <p>
          We wanted to know whether that first stage actually mattered, or whether it was a nice
          formality. The pattern was clear.
        </p>
        <h3>What we saw</h3>
        <ul>
          <li>Ideas that gathered meaningful feedback first reached their funding goal noticeably faster.</li>
          <li>They set milestones that were tighter and more realistic, because backers had already pushed on them.</li>
          <li>They refunded less, because fewer promised milestones went undelivered.</li>
        </ul>
        <p>
          None of that is magic. Feedback before funding is just a cheaper place to be wrong. Builders
          who use it walk into a campaign already having heard the hard questions, and it shows.
        </p>
      </>
    ),
  },
  {
    slug: 'reading-a-campaign',
    title: 'A backer’s guide to reading a campaign',
    excerpt:
      'Backing well is a skill. Here’s what to look for in a campaign before you commit, and the green flags that separate a strong builder from a hopeful one.',
    category: 'For Backers',
    author: 'The Inverge Team',
    date: '2026-05-22',
    dateLabel: '22 May 2026',
    readingTime: '5 min read',
    body: (
      <>
        <p>
          Backing on Inverge is designed to be safer than most: funds release in milestones, and
          undelivered work is refundable. But a careful backer still backs better. Here’s what to
          look at.
        </p>
        <h3>Are the milestones concrete?</h3>
        <p>
          The best milestones are things you could photograph: a shipped batch, a live flow, a signed
          pilot. Vague milestones (“build the platform”) are harder to verify, and harder to refund
          fairly. Concrete is a green flag.
        </p>
        <h3>Does the builder show their work?</h3>
        <p>
          Look at how they’ve responded to feedback in the validation stage. A builder who engages,
          revises, and answers hard questions is telling you how they’ll behave once they’re funded.
        </p>
        <h3>Does the ask match the plan?</h3>
        <p>
          A raise should map cleanly to the milestones. If the numbers and the plan don’t line up,
          ask. Good builders welcome the question.
        </p>
        <p>
          Back people who show you proof, not just polish. The platform protects you either way, but
          the best backers still read carefully.
        </p>
      </>
    ),
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
