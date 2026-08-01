import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Disclosure } from '@/components/ui/accordion';
import { PLATFORM } from '@/lib/campaigns/types';

/**
 * How this campaign works.
 *
 * The reference's FAQ is creator-authored and we have no model for it (gap backlog item 9). But most
 * of what a first-time backer wants to know here is not about the project at all — it is about the
 * mechanic: what the working capital is, who decides whether a stage passed, whether the creator can
 * change the stages later, what happens to their money if stage three fails.
 *
 * Those answers are platform-authored, identical on every campaign, and derived straight from the
 * escrow rules. So the tab ships now with the eight questions the mechanic actually raises, and gains
 * creator-authored entries when there is somewhere to store them.
 *
 * The escape hatch is the point of the reference's version and it is kept: an FAQ with no route to a
 * human is a wall. Ours leads to the idea's discussion, where the creator has to answer in public.
 */
export function CampaignFaq({ ideaSlug }: { ideaSlug: string | null }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <div className="min-w-0">
        <h2 className="font-display text-lg font-bold tracking-tight text-ink">
          How this campaign works
        </h2>
        <p className="mt-1 max-w-[68ch] text-sm leading-relaxed text-ink-muted">
          The same rules apply to every campaign on Inverge, and they are fixed before anyone can back
          one.
        </p>

        <div className="mt-4 rounded-xl border border-border bg-surface px-5">
          <Disclosure summary="When does the creator actually get the money?" defaultOpen>
            In stages. A share is released when funding closes so work can start, and each stage after
            that releases only when backers have had a week to review what was delivered.
          </Disclosure>

          <Disclosure summary="What is the money released before any stage is delivered?">
            A working capital share, capped at a quarter of the raise and fixed before anyone backs the
            campaign. It exists so a creator is not funding the first stage out of pocket. It is
            disclosed on every campaign and it is not part of what gets returned if a later stage
            fails.
          </Disclosure>

          <Disclosure summary="Who decides whether a stage was delivered?">
            Backers do. When a creator submits proof, a {PLATFORM.objectionWindowDays} day window
            opens. If objections worth less than {PLATFORM.objectionThresholdPct}% of what was
            contributed are raised, the stage releases. If more, it does not.
          </Disclosure>

          <Disclosure summary="Can one large backer block a stage on their own?">
            No. Objections are weighted by how much a backer put in, and no single backer counts for
            more than {PLATFORM.objectionWeightCapPct}% of the total.
          </Disclosure>

          <Disclosure summary="What happens to my money if a stage is not delivered?">
            The money that has not yet been released is returned to everyone who funded the campaign,
            in proportion to what they put in. Stages already delivered are not clawed back.
          </Disclosure>

          <Disclosure summary="Can the creator change the stages after launch?">
            No. The stages, what each one delivers, what proof will be submitted and what share of the
            money each releases are fixed when the campaign is published, and a record of those terms
            is kept so they can be checked later.
          </Disclosure>

          <Disclosure summary="What if the campaign does not reach its goal?">
            Nothing is charged. Money is only collected if the campaign reaches its goal by its
            deadline, and every backer can withdraw what they put in if it does not.
          </Disclosure>

          <Disclosure summary="What does Inverge take?">
            A share of each stage when it is released, and nothing before that. If a stage is never
            released, we are not paid for it either.
          </Disclosure>
        </div>
      </div>

      <Card tone="quiet" className="p-5">
        <h2 className="text-sm font-semibold text-ink">Still have a question?</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Anything specific to this project belongs with the creator, in public, where the answer is
          useful to the next person reading.
        </p>
        {ideaSlug && (
          <Link
            href={`/ideas/${ideaSlug}?tab=discussion`}
            className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-accent-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            Ask the creator on the idea
          </Link>
        )}
      </Card>
    </div>
  );
}
