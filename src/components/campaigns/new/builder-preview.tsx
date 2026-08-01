'use client';

import { Amount } from '@/components/ui/amount';
import { Card } from '@/components/ui/card';
import { Meter } from '@/components/ui/meter';
import { Pill } from '@/components/ui/pill';
import { trancheAmountOf, trancheTotal, type CampaignDraft } from '@/lib/campaigns/campaign-draft';
import { daysUntil, parseDecimal, pluralise } from '@/lib/format';
import type { EligibleIdea } from '@/lib/campaigns/my-ideas';

/**
 * What backers will see, updating as the form is filled in.
 *
 * This is the most useful thing on the screen and the reason the builder is two columns. A creator
 * typing "30" into a tranche field is being asked to reason about something abstract; watching the
 * stage tracker fill in beside them turns the rule into an object. `/ideas/new` uses the same device
 * and it is the single biggest lift in pitch quality the playbook records (§5.2).
 *
 * It shows the stages tracker rather than the whole page on purpose: the tracker is what a campaign
 * is judged on, and a miniature of an entire detail page in a 22rem column would be legible as
 * neither.
 */
export function BuilderPreview({
  draft,
  idea,
}: {
  draft: CampaignDraft;
  idea: EligibleIdea | null;
}) {
  const target = parseDecimal(draft.targetAmount);
  const daysLeft = draft.deadline ? daysUntil(draft.deadline) : null;
  const allocated = trancheTotal(draft.milestones);
  const named = draft.milestones.filter((m) => m.title.trim().length > 0);

  return (
    <Card tone="quiet" className="p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        This is what backers will see
      </p>

      {/* Identity comes from the idea when there is one, and from the draft when there is not. One
          fallback chain, so the preview never disagrees with the form. */}
      <h3 className="mt-3 font-display text-lg font-bold leading-snug tracking-tight text-ink">
        {idea?.title || draft.title.trim() || 'Your campaign'}
      </h3>

      {(idea?.problem || draft.summary.trim()) && (
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
          {idea?.problem ?? draft.summary}
        </p>
      )}

      <div className="mt-4 border-t border-border pt-3">
        <Meter
          ratio={0}
          size="sm"
          srLabel="of the funding goal"
          label={
            <>
              <span className="text-sm font-semibold text-ink tabular-nums">
                <Amount value={0} currency="USD" />
              </span>
              <span className="text-[10px] text-ink-muted">
                of {target > 0 ? <Amount value={target} currency="USD" /> : '—'} goal
              </span>
            </>
          }
        />
        <p className="mt-2 text-[11px] text-ink-muted">
          {daysLeft === null ? (
            'No deadline set yet'
          ) : (
            <>
              {daysLeft} {pluralise(daysLeft, 'day')} to raise it
            </>
          )}
          {' · '}
          {draft.milestones.length} {pluralise(draft.milestones.length, 'stage')}
        </p>
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <p className="text-xs font-semibold text-ink">Delivery stages</p>

        {named.length === 0 ? (
          <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
            As you name each stage it appears here, with what it releases. This is the part backers
            read first.
          </p>
        ) : (
          <ol className="mt-2 space-y-2">
            {draft.milestones.map((m, i) => {
              const pct = parseDecimal(m.tranchePct);
              const amount = trancheAmountOf(draft, m);

              return (
                <li key={m.key} className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 text-[11px] text-ink-muted">
                    <span className="tabular-nums">{i + 1}.</span>{' '}
                    <span className={m.title.trim() ? 'text-ink' : 'italic'}>
                      {m.title.trim() || 'Not named yet'}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] tabular-nums text-ink-muted">
                    {pct > 0 ? (
                      <>
                        {pct}% ·{' '}
                        <span className="font-semibold text-ink">
                          <Amount value={amount} currency="USD" />
                        </span>
                      </>
                    ) : (
                      '—'
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        {allocated > 0 && Math.abs(allocated - 100) > 0.001 && (
          <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">
            {allocated}% of the raise is assigned. A campaign cannot launch until the stages account
            for all of it.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3">
        <Pill size="xs">All or nothing</Pill>
        {draft.videoUrl.trim() && (
          <Pill size="xs" marker={<span aria-hidden="true">▸</span>}>
            Video
          </Pill>
        )}
        {(idea?.region || draft.region.trim()) && (
          <Pill size="xs">{idea?.region ?? draft.region}</Pill>
        )}
      </div>
    </Card>
  );
}
