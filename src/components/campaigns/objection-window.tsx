import { Amount } from '@/components/ui/amount';
import { Card } from '@/components/ui/card';
import { Meter } from '@/components/ui/meter';
import { Pill } from '@/components/ui/pill';
import { formatDate, parseDecimal, pluralise } from '@/lib/format';
import { objectionDaysLeft } from '@/lib/campaigns/milestone-state';
import { trancheAmount } from '@/lib/campaigns/campaign-stats';
import type { CampaignDetail, Milestone } from '@/lib/campaigns/types';

/**
 * The stage currently under review, drawn as the focal point of the page.
 *
 * The reference has no analogue for this at all, because on Kickstarter the money leaves at funding close
 * (teardown §9.5). It is the single most important thing to get right, and the tone is the design: a
 * delivery tracker, not a governance vote. Plain language, days rather than a ticking clock, no red, no
 * "urgent". A countdown that animates would be motion in the viewport at rest (conventions §9.4) and
 * would read as pressure on a screen whose job is calm.
 *
 * Objection weight is shown as an aggregate against the threshold. Individual objections are never
 * backer-facing (campaign-data-contract.md §2.2).
 *
 * The proof itself is always public: it is the thing backers are being asked to judge, so gating it behind
 * a pledge would be indefensible (teardown §5.5).
 */
export function ObjectionWindow({
  campaign,
  milestone,
}: {
  campaign: CampaignDetail;
  milestone: Milestone;
}) {
  const claim = milestone.claim;
  if (!claim) return null;

  const daysLeft = objectionDaysLeft(milestone) ?? 0;
  const amount = trancheAmount(campaign, milestone);
  const weight = parseDecimal(claim.objectionWeightPct);
  const threshold = parseDecimal(claim.objectionThresholdPct);

  return (
    <Card className="overflow-hidden border-accent-500/40">
      <div className="border-b border-border bg-accent-50 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Pill tone="accent" marker={<span aria-hidden="true">◔</span>}>
            Under review
          </Pill>
          <p className="text-sm font-semibold text-ink tabular-nums">
            {daysLeft} {pluralise(daysLeft, 'day')} left to object
          </p>
        </div>
        <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-ink">
          Stage {milestone.index + 1}: {milestone.title}
        </h2>
        <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-ink-muted">
          Backers have until {formatDate(claim.objectionWindowEndsAt)} to review what{' '}
          {campaign.creator.displayName} delivered. If enough object, this stage is not released and the
          money still held is returned. If not, <Amount value={amount} currency="USD" /> is released and
          work moves to the next stage.
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <h3 className="text-sm font-semibold text-ink">What was delivered</h3>
          <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-ink-muted">{claim.proof.note}</p>

          {claim.proof.links && claim.proof.links.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {claim.proof.links.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center rounded text-sm font-medium text-accent-700 underline decoration-accent-700/30 underline-offset-2 hover:decoration-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-3 text-xs text-ink-muted">
            Agreed at the start of the campaign as proof for this stage: {milestone.evidenceDefinition.type}
            , from {milestone.evidenceDefinition.source.toLowerCase()}.
          </p>
        </div>

        <div className="border-t border-border pt-4">
          <Meter
            ratio={threshold > 0 ? weight / threshold : 0}
            srLabel="of the objections needed to stop this stage"
            tone="neutral"
            size="sm"
            label={
              <>
                <span className="text-xs font-medium text-ink">Objections so far</span>
                <span className="text-xs text-ink-muted tabular-nums">
                  {weight}% of the {threshold}% needed
                </span>
              </>
            }
          />
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            Objections are weighted by how much a backer put in, and no single backer counts for more than
            15% of the total, so one large backer cannot stop a stage alone.
          </p>
        </div>

        {/* Objection submission needs on-chain contribution weight, which does not exist yet, so the
            control is honest about being unavailable rather than present and broken (brief §1.3). */}
        <div className="rounded-lg border border-dashed border-border bg-paper p-4">
          <p className="text-sm font-medium text-ink">Think this stage was not delivered?</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            Objecting opens to backers when funding goes live. Until then, raise it in the discussion and
            the creator has to answer publicly.
          </p>
        </div>
      </div>
    </Card>
  );
}
