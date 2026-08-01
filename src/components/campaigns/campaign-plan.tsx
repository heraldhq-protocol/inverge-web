import { Amount } from '@/components/ui/amount';
import { Card } from '@/components/ui/card';
import { parseDecimal } from '@/lib/format';
import type { CampaignDetail } from '@/lib/campaigns/types';

type Section = { id: string; heading: string; body: string };

/**
 * The plan: the campaign's story, in the order the playbook prescribes, with a generated table of
 * contents beside it.
 *
 * The reference lists the author's own headings in its sticky TOC (teardown §5.1). Ours are generated
 * from the structured pitch the idea already collected, which is strictly better: every campaign gets
 * the same readable skeleton, and a creator cannot bury the risks section under a heading called
 * "A note from us".
 *
 * Two sections are platform-mandated, not author choice — the same device Kickstarter uses to force
 * every project to write about how it could fail. Ours are "Risks and challenges", which the creator
 * writes, and "What happens if a stage is not delivered", which writes itself from the escrow rules
 * and is identical on every campaign.
 */
export function CampaignPlan({ campaign }: { campaign: CampaignDetail }) {
  const sections: Section[] = [
    { id: 'problem', heading: 'The problem', body: campaign.story.problem },
    { id: 'who', heading: 'Who this is for', body: campaign.story.targetUser },
    { id: 'today', heading: 'What they do today', body: campaign.story.currentAlternative },
    { id: 'solution', heading: 'The solution', body: campaign.story.solution },
    { id: 'roadmap', heading: 'How it gets built', body: campaign.story.roadmap },
    { id: 'risks', heading: 'Risks and challenges', body: campaign.risks },
  ].filter((s) => Boolean(s.body));

  const askTotal = campaign.story.askBreakdown.reduce((n, l) => n + parseDecimal(l.amount), 0);

  return (
    <div className="grid min-w-0 gap-8 lg:grid-cols-[11rem_minmax(0,1fr)_18rem]">
      <nav aria-label="On this page" className="hidden lg:sticky lg:top-24 lg:block">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          On this page
        </p>
        <ul className="mt-3 space-y-1.5">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="block rounded text-[13px] leading-snug text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
              >
                {s.heading}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#money"
              className="block rounded text-[13px] leading-snug text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
            >
              What the money buys
            </a>
          </li>
          <li>
            <a
              href="#failure"
              className="block rounded text-[13px] leading-snug text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
            >
              If a stage is not delivered
            </a>
          </li>
        </ul>
      </nav>

      <div className="min-w-0 max-w-[68ch] space-y-8">
        {sections.map((s) => (
          // `scroll-mt` keeps a jumped-to heading clear of the sticky top bar, or focus lands
          // underneath it (conventions §8, SC 2.4.11).
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">{s.heading}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{s.body}</p>
          </section>
        ))}

        {campaign.story.askBreakdown.length > 0 && (
          <section id="money" className="scroll-mt-24">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">
              What the money buys
            </h2>
            <table className="mt-3 w-full text-sm">
              <caption className="sr-only">Budget for {campaign.title}</caption>
              <tbody>
                {campaign.story.askBreakdown.map((line) => (
                  <tr key={line.label} className="border-b border-border last:border-b-0">
                    <th scope="row" className="py-2.5 pr-4 text-left font-normal text-ink-muted">
                      {line.label}
                    </th>
                    <td className="py-2.5 text-right font-semibold text-ink tabular-nums">
                      <Amount value={line.amount} currency="USD" />
                    </td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="py-2.5 pr-4 text-left font-semibold text-ink">
                    Total
                  </th>
                  <td className="py-2.5 text-right font-semibold text-ink tabular-nums">
                    <Amount value={askTotal} currency="USD" />
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        <section id="failure" className="scroll-mt-24">
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">
            What happens if a stage is not delivered
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Backers get a week to review what was delivered at each stage. If enough of them object,
            that stage is not released, the money still held is returned in proportion to what each
            backer put in, and stages already delivered are not clawed back.
          </p>
        </section>
      </div>

      <Card className="p-5 lg:sticky lg:top-24">
        <h2 className="text-sm font-semibold text-ink">Money released early</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {parseDecimal(campaign.workingCapitalPct)}% of the raise is released as soon as funding
          closes, so the creator can start work rather than fund the first stage themselves. That
          portion is disclosed here before anyone backs the campaign, and it is not part of what gets
          returned if a later stage is not delivered.
        </p>
      </Card>
    </div>
  );
}
