import { Amount } from '@/components/ui/amount';
import { formatDate } from '@/lib/format';
import type { IdeaDetail } from '@/lib/ideas/types';
import { RichContent, plainTextToDoc } from '@/lib/ideas/rich-content';

/**
 * The pitch, in the narrative order the reference's best-performing pages follow (playbook §2):
 * the problem, who has it, what they do today and why that falls short, the solution, what the money
 * buys, what happens when, and what could go wrong.
 *
 * The section skeleton is **generated from the structured pitch fields, not authored**, which is why
 * every idea on Inverge reads consistently and gets a working table of contents for free. Headings are
 * typeset by us; a creator cannot ship a wall of text or fake a heading with an image, which is a
 * constraint the reference's editor forces its creators to work around (playbook §4).
 *
 * Measure is capped at ~68 characters: no paragraph should run longer than about three lines.
 */

export type StorySection = { id: string; heading: string };

/** Single source of truth for both the story and its table of contents, so they cannot drift. */
export function storySections(idea: IdeaDetail): StorySection[] {
  const sections: StorySection[] = [{ id: 'problem', heading: 'The problem' }];
  if (idea.targetUser) sections.push({ id: 'who', heading: 'Who has this problem' });
  if (idea.currentAlternative) sections.push({ id: 'today', heading: 'What they do today' });
  sections.push({ id: 'solution', heading: 'The solution' });
  if (idea.askBreakdown?.length) sections.push({ id: 'ask', heading: 'What the money buys' });
  if (idea.roadmapSteps?.length) sections.push({ id: 'roadmap', heading: 'What happens when' });
  if (idea.risks) sections.push({ id: 'risks', heading: 'What could go wrong' });
  return sections;
}

export function IdeaStory({ idea }: { idea: IdeaDetail }) {
  const askTotal = idea.askBreakdown?.reduce((sum, line) => sum + line.amount, 0) ?? 0;

  return (
    <div className="space-y-10">
      <Section id="problem" heading="The problem">
        <p>{idea.problem}</p>
      </Section>

      {idea.targetUser && (
        <Section id="who" heading="Who has this problem">
          <p>{idea.targetUser}</p>
        </Section>
      )}

      {idea.currentAlternative && (
        <Section id="today" heading="What they do today">
          <p>{idea.currentAlternative}</p>
        </Section>
      )}

      <Section id="solution" heading="The solution">
        {/* Rendered from the editor's own document tree, server-side: readers never download the editor,
            and there is no author-controlled HTML string to sanitise (lib/ideas/rich-content.tsx). */}
        <RichContent doc={idea.solutionDoc ?? plainTextToDoc(idea.solution)} />
      </Section>

      {idea.askBreakdown && idea.askBreakdown.length > 0 && (
        <Section id="ask" heading="What the money buys">
          <p className="mb-4">
            An indicative breakdown of the{' '}
            <Amount value={idea.askAmount} currency="USD" className="font-semibold text-ink" /> this
            idea would raise as a campaign. It is a plan, not a commitment, and it can change before a
            campaign is submitted.
          </p>
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {idea.askBreakdown.map((line) => (
              <li key={line.label} className="flex items-baseline justify-between gap-4 px-4 py-3">
                <span className="text-sm text-ink">{line.label}</span>
                <Amount
                  value={line.amount}
                  currency="USD"
                  className="shrink-0 text-sm font-semibold text-ink"
                />
              </li>
            ))}
            <li className="flex items-baseline justify-between gap-4 bg-paper px-4 py-3">
              <span className="text-sm font-semibold text-ink">Total</span>
              <Amount
                value={askTotal}
                currency="USD"
                className="shrink-0 text-sm font-semibold text-ink"
              />
            </li>
          </ul>
        </Section>
      )}

      {idea.roadmapSteps && idea.roadmapSteps.length > 0 && (
        <Section id="roadmap" heading="What happens when">
          <ol className="space-y-4">
            {idea.roadmapSteps.map((step, i) => (
              <li key={step.date} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-100 text-xs font-semibold text-accent-900 tabular-nums"
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{step.description}</p>
                  <p className="mt-0.5 text-xs text-ink-muted tabular-nums">
                    By {formatDate(step.date)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {idea.risks && (
        <Section id="risks" heading="What could go wrong">
          <p>{idea.risks}</p>
        </Section>
      )}
    </div>
  );
}

function Section({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    // scroll-margin-top keeps the heading clear of the sticky top bar when jumped to from the
    // table of contents (WCAG 2.4.11, conventions §8).
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-xl font-bold tracking-tight text-ink">{heading}</h2>
      <div className="mt-3 max-w-[68ch] space-y-3 text-sm leading-relaxed text-ink-muted">
        {children}
      </div>
    </section>
  );
}
