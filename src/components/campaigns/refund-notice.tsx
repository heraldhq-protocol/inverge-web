import { Amount } from '@/components/ui/amount';
import { TxLink } from '@/components/ui/tx-link';
import { formatDate, parseDecimal } from '@/lib/format';
import { milestoneState } from '@/lib/campaigns/milestone-state';
import { refundableAmount } from '@/lib/campaigns/campaign-stats';
import type { CampaignDetail } from '@/lib/campaigns/types';

/**
 * The failed state. This screen is the entire product promise, so the tone is the design: matter-of-fact,
 * zero apology, zero alarm, zero emoji (app-mockup-kit §F).
 *
 * The muted warm red is the one licensed second hue, used here and nowhere else, because "not delivered"
 * carrying the same green as "released" would be a comprehension failure.
 *
 * What it must answer, in this order: what failed, what is coming back, whether the reader needs to do
 * anything, and where the receipt is. "Nothing for you to do" is the most important line on the page.
 */
export function RefundNotice({ campaign }: { campaign: CampaignDetail }) {
  const failed = campaign.milestones.find((m) => milestoneState(m) === 'NOT_DELIVERED');
  if (!failed) return null;

  const remainingPct = campaign.milestones
    .filter((m) => {
      const state = milestoneState(m);
      return state === 'NOT_DELIVERED' || state === 'CANCELLED' || state === 'UPCOMING';
    })
    .reduce((sum, m) => sum + parseDecimal(m.tranchePct), 0);
  // Every share not yet released, out of the same pot the released ones came from. The upfront is not
  // refundable and is not in it (campaign-stats.ts).
  const returned = refundableAmount(campaign, remainingPct);
  const mine = campaign.myContribution?.refund;

  return (
    <section className="rounded-xl border border-danger/40 bg-danger-50 p-5 sm:p-6">
      <h2 className="font-display text-xl font-bold tracking-tight text-ink">
        Stage not delivered. The money still held is being returned.
      </h2>

      <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-ink-muted">
        Backers reviewed what was delivered for &ldquo;{failed.title}&rdquo; and enough of them objected that
        it did not pass. <Amount value={returned} currency="USD" className="font-semibold text-ink" /> of the
        money that had not yet been released is going back to everyone who funded this campaign, in
        proportion to what they put in. Stages that were already delivered and released are not clawed back.
      </p>

      {mine && (
        <div className="mt-5 rounded-lg border border-danger/30 bg-surface p-4">
          <p className="text-sm text-ink">
            <span className="font-semibold">Your refund:</span>{' '}
            <Amount value={mine.amount} currency="USD" className="font-semibold" />
            {mine.status === 'RETURNED' && mine.returnedAt
              ? ` returned on ${formatDate(mine.returnedAt)}.`
              : ' is on its way back to you.'}
          </p>
          <p className="mt-1 text-xs text-ink-muted">Nothing for you to do.</p>
          {failed.receipt && (
            <div className="mt-2">
              <TxLink signature={failed.receipt.txSignature} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
