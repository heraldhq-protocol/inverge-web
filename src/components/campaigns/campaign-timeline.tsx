import { Amount } from '@/components/ui/amount';
import { Timeline, type TimelineEntry } from '@/components/ui/timeline';
import { TxLink } from '@/components/ui/tx-link';
import { formatDate } from '@/lib/format';
import { milestoneState } from '@/lib/campaigns/milestone-state';
import type { CampaignDetail } from '@/lib/campaigns/types';

/** A timeline row plus the instant it happened, so the whole spine sorts once at the end. */
type DatedEntry = TimelineEntry & { at: string };

/**
 * Everything that has happened on this campaign, in one dated column.
 *
 * The reference has a small timeline card under its Updates tab — "Project launches / JUNE 30, 2026"
 * — and it is the best idea on that tab (teardown §5.5). A campaign's spine *is* dated events, and
 * unlike Kickstarter's, most of ours move money and therefore carry a receipt.
 *
 * This is the Updates tab we can actually build. Creator-authored update posts need a model that
 * does not exist (gap backlog item 8); the record of what happened does not, because it is already
 * implied by the milestones and the receipts. So the tab ships now with the part that is verifiable
 * and gains commentary later.
 *
 * Money events carry a receipt and process events do not, and that difference is visible: it is the
 * line between "we recorded this" and "you can check this".
 */
export function CampaignTimeline({ campaign }: { campaign: CampaignDetail }) {
  const entries: DatedEntry[] = [];

  entries.push({
    id: 'launched',
    at: campaign.launchedAt,
    date: formatDate(campaign.launchedAt),
    title: 'Campaign published',
    tone: 'neutral',
    detail: campaign.ideaSlug ? 'Converted from a validated idea.' : undefined,
  });

  for (const r of campaign.receipts) {
    entries.push({
      id: `receipt-${r.txSignature}`,
      at: r.blockTime,
      date: formatDate(r.blockTime),
      title: r.label,
      tone:
        r.kind === 'MILESTONE_FAILED' ? 'danger' : r.kind === 'REFUND_CLAIMED' ? 'neutral' : 'accent',
      detail: r.amount ? <Amount value={r.amount} currency="USD" className="font-semibold text-ink" /> : undefined,
      action: <TxLink signature={r.txSignature} />,
    });
  }

  for (const m of campaign.milestones) {
    const claim = m.claim;
    if (!claim) continue;

    entries.push({
      id: `claim-${m.id}`,
      at: claim.submittedAt,
      date: formatDate(claim.submittedAt),
      title: `Stage ${m.index + 1} claimed: ${m.title}`,
      tone: 'neutral',
      detail: `Proof submitted. Backers have a week to review it.`,
    });

    // A claim that is no longer UNDER_REVIEW has, by definition, had its window resolved — approved,
    // failed or disputed. Deriving it from the state rather than from the clock keeps the component
    // pure and means the timeline cannot disagree with the tracker about what happened.
    const state = milestoneState(m);

    if (state !== 'UNDER_REVIEW') {
      entries.push({
        id: `window-${m.id}`,
        at: claim.objectionWindowEndsAt,
        date: formatDate(claim.objectionWindowEndsAt),
        title: `Stage ${m.index + 1} review window closed`,
        tone: state === 'NOT_DELIVERED' || state === 'DISPUTED' ? 'danger' : 'neutral',
        detail:
          state === 'NOT_DELIVERED'
            ? 'Enough backers objected. The stage was not released.'
            : state === 'DISPUTED'
              ? 'Enough backers objected. The creator appealed and a review panel is deciding.'
              : 'Not enough objections to stop the release.',
      });
    }

    if (claim.ruling) {
      entries.push({
        id: `ruling-${m.id}`,
        at: claim.ruling.ruledAt,
        date: formatDate(claim.ruling.ruledAt),
        title: `Review panel ruled on stage ${m.index + 1}`,
        tone: claim.ruling.outcome === 'RELEASED' ? 'accent' : 'danger',
        detail: claim.ruling.reason,
      });
    }
  }

  // One sort at the end rather than three merged lists: the spine is the sequence, and building it
  // in the order the data happens to arrive is how a timeline ends up subtly wrong.
  const sorted: TimelineEntry[] = entries.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  return (
    <section className="max-w-2xl">
      <h2 className="font-display text-lg font-bold tracking-tight text-ink">
        Everything that has happened
      </h2>
      <p className="mt-1 max-w-[68ch] text-sm leading-relaxed text-ink-muted">
        Money movements carry a receipt. Everything else is a dated record of the process.
      </p>
      <div className="mt-4">
        <Timeline entries={sorted} />
      </div>
    </section>
  );
}
