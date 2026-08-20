'use client';

import { Amount } from '@/components/ui/amount';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';
import {
  sortedRewards,
  distributableAtTarget,
  trancheAmountOf,
  workingCapitalAmount,
  type CampaignDraft,
} from '@/lib/campaigns/campaign-draft';
import { PLATFORM } from '@/lib/campaigns/types';
import { formatDate, parseDecimal } from '@/lib/format';
import type { EligibleIdea } from '@/lib/campaigns/my-ideas';

/**
 * Step four: read it back, and say what happens next.
 *
 * Read-only on purpose. FR-303 makes the stages, their evidence and their shares immutable once the
 * campaign is published, and a fourth form would imply otherwise. The last thing a creator does here
 * is read the terms they are about to be held to.
 *
 * The three things this step must state plainly, because each one costs a creator something:
 * immutability, verification, and the application fee. Burying any of them until after the work is
 * done would be the sort of thing this product exists to be the opposite of.
 */
export function StepReview({ draft, idea }: { draft: CampaignDraft; idea: EligibleIdea | null }) {
  const wc = workingCapitalAmount(draft);
  const target = parseDecimal(draft.targetAmount);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-xl font-bold tracking-tight text-ink">
          Read this back before you commit to it
        </h2>
        <p className="mt-1.5 max-w-[68ch] text-sm leading-relaxed text-ink-muted">
          Once a campaign is published, none of it can be changed. Backers are agreeing to these
          terms, not to a plan that can move.
        </p>
      </header>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-ink">The raise</h3>
        <dl className="mt-3 space-y-2.5 text-sm">
          <Row label="Campaign" value={idea?.title || draft.title || '—'} />
          <Row
            label="Validated first"
            value={idea ? 'Yes, as an idea' : 'No, raising without validation'}
          />
          <Row
            label="Target"
            value={target > 0 ? <Amount value={target} currency="USD" /> : '—'}
          />
          <Row label="Funding closes" value={draft.deadline ? formatDate(draft.deadline) : '—'} />
          <Row
            label="Released when funding closes"
            value={
              wc > 0 ? (
                <>
                  <Amount value={wc} currency="USD" /> ({parseDecimal(draft.workingCapitalPct)}%)
                </>
              ) : (
                'Nothing'
              )
            }
          />
          <Row
            label="Divided across the stages"
            value={
              distributableAtTarget(draft) > 0 ? (
                <Amount value={distributableAtTarget(draft)} currency="USD" />
              ) : (
                '—'
              )
            }
          />
          <Row label="Funding type" value="All or nothing" />
        </dl>
        <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-ink-muted">
          These are the figures if you raise exactly your goal. Raise more and the upfront stays where
          it is, while every stage is worth proportionally more.
        </p>
      </Card>

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-ink">
            {draft.milestones.length} stages, fixed at publication
          </h3>
          <Pill size="xs">Cannot be changed later</Pill>
        </div>

        <ol className="mt-3 space-y-3">
          {draft.milestones.map((m, i) => (
            <li key={m.key} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-sm font-semibold text-ink">
                  <span className="text-ink-muted tabular-nums">Stage {i + 1}: </span>
                  {m.title || 'Untitled'}
                </p>
                <p className="text-sm text-ink-muted tabular-nums">
                  {parseDecimal(m.tranchePct)}% ·{' '}
                  <span className="font-semibold text-ink">
                    <Amount value={trancheAmountOf(draft, m)} currency="USD" />
                  </span>
                </p>
              </div>
              {m.deliverable && (
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{m.deliverable}</p>
              )}
              {(m.evidenceType || m.evidenceSource) && (
                <p className="mt-1.5 text-xs text-ink-muted">
                  Proof: {m.evidenceType || '—'}
                  {m.evidenceSource ? `, from ${m.evidenceSource.toLowerCase()}` : ''}
                </p>
              )}
            </li>
          ))}
        </ol>
      </Card>

      {draft.rewards.length > 0 && (
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-ink">
              {draft.rewards.length} reward {draft.rewards.length === 1 ? 'tier' : 'tiers'}
            </h3>
            <Pill size="xs">Separate from your stages</Pill>
          </div>

          <ol className="mt-3 space-y-3">
            {sortedRewards(draft.rewards).map((r) => (
              <li key={r.key} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-sm font-semibold text-ink">{r.title || 'Untitled tier'}</p>
                  <p className="text-sm font-semibold text-ink tabular-nums">
                    <Amount value={parseDecimal(r.amount)} currency="USD" />
                  </p>
                </div>
                {r.description && (
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{r.description}</p>
                )}
                <p className="mt-1.5 text-xs text-ink-muted">
                  {r.estimatedDelivery ? `Estimated ${formatMonth(r.estimatedDelivery)}` : 'No date set'}
                  {r.limitedQuantity.trim() && ` · ${r.limitedQuantity} available`}
                </p>
              </li>
            ))}
          </ol>
        </Card>
      )}

      <Card tone="quiet" className="p-5 border border-accent-300/40 bg-accent-50/30">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h3 className="text-sm font-bold text-ink">FR-311 Curation Application Fee</h3>
            <p className="text-xs text-ink-muted">Mandatory non-refundable fee required to enter the admin review queue.</p>
          </div>
          <Pill tone="accent" size="sm">₦15,000 / $20</Pill>
        </div>
        <ul className="mt-3 space-y-3 text-sm leading-relaxed text-ink-muted">
          {!idea && (
            <li>
              <span className="font-medium text-ink">No validation behind this one.</span> No
              supporters carry over and your page cannot point at anyone who said they wanted this,
              so the video and the stages are doing all the work. Reviewers weigh it accordingly.
            </li>
          )}
          <li>
            <span className="font-medium text-ink">The stages are locked.</span> What each stage
            delivers, what proof you will submit and what share it releases cannot be edited once the
            campaign is public, and a record of the terms is kept so they can be checked later.
          </li>
          <li>
            <span className="font-medium text-ink">We verify who you are.</span> Creators receive
            money, so we verify who you are first. This is required before you can launch a campaign,
            never to publish an idea.
          </li>
          <li>
            <span className="font-medium text-ink">Submitting for review requires paying the FR-311 fee.</span>{' '}
            It funds administrative curation, is non-refundable, and is charged before queue placement regardless of outcome.
          </li>
          <li>
            <span className="font-medium text-ink">Backers decide each stage.</span> When you claim
            one, a {PLATFORM.objectionWindowDays} day window opens. If objections worth{' '}
            {PLATFORM.objectionThresholdPct}% or more of what was contributed are raised, that stage
            does not release and the money still held goes back.
          </li>
        </ul>
      </Card>
    </div>
  );
}

/** "March 2027" — a day-precise promise a year out is not credible, so tiers state the month. */
function formatMonth(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
