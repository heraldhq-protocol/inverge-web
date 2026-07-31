import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Section } from '@/components/ui/section';
import { IdeaCard } from '@/components/ideas/idea-card';
import { getFeed } from '@/lib/feed/feed-api';

/**
 * Ideas with momentum, on the landing page, with a route into the feed.
 *
 * **This is the one section of the landing page that renders live data**, reversing the brief's
 * original "zero live data" rule (landing-brief.md §1.2). The reasoning: hard-coded ideas on a page
 * whose entire job is proving that real people back real projects fails the moment a visitor clicks
 * through and cannot find them. Stale proof is worse than no proof. The rest of the landing page keeps
 * its typed constants.
 *
 * Three rules this section holds itself to, all of which matter more here than inside the app:
 *
 * 1. **No promoted slots.** The ranked feed carries paid placement, clearly labelled, and that is
 *    correct inside a product surface. A marketing page is us speaking in our own voice, so selling a
 *    slot in it would be indefensible — and a "Promoted" pill in a section headed "gaining momentum"
 *    would read as us vouching for something a creator paid for (FR-206a).
 * 2. **The same card, the same words.** It renders the real `IdeaCard`, so the figures, the
 *    "Estimated interest" label and the explainability chip are identical to the feed. A marketing
 *    variant with friendlier numbers would be a different claim about the same idea.
 * 3. **Nothing here is an endorsement.** The heading describes the ranker's output, not our opinion.
 *
 * Caching lives on the route, not here: `revalidate` is route-segment config and is inert in a
 * component file. See `(marketing)/page.tsx`. Note for the live swap — `getFeed` currently reads with
 * `cache: 'no-store'`, which would opt this route out of static rendering; give it a revalidating
 * fetch before flipping USE_FIXTURES, or the landing page pays a round trip on every visit.
 */
export async function Momentum() {
  const { items } = await getFeed({ take: 12 });

  // Organic only, then the three furthest along. `promoted` is dropped before ranking rather than
  // after, so a paid slot cannot displace an organic one from the shortlist either.
  const shortlist = items.filter((item) => !item.promoted).slice(0, 3);

  if (shortlist.length === 0) return null;

  return (
    <Section tone="white">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <Eyebrow statusDot>Being validated now</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Ideas people are backing this week
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-muted">
              Every figure here comes from what real supporters did, not from what anyone paid. Nothing
              has been charged yet, and no idea can buy its way into this list.
            </p>
          </div>

          <Button variant="outline" size="md" href="/feed" className="shrink-0 self-start sm:self-auto">
            See all ideas
          </Button>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shortlist.map((item) => (
            <li key={item.id} className="h-full">
              <IdeaCard item={item} />
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm text-ink-muted">
          <Link
            href="/ideas/new"
            className="rounded font-medium text-accent-700 underline decoration-accent-700/30 underline-offset-2 hover:decoration-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            Publish your own idea
          </Link>{' '}
          — it is free, and nothing is charged while it is being validated.
        </p>
      </Container>
    </Section>
  );
}
