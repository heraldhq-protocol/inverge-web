import { Amount, Count } from '@/components/ui/amount';
import { clamp01 } from '@/lib/format';
import type { EscrowSummary as Summary } from '@/lib/campaigns/campaign-stats';

/**
 * FR-801: total value held, released and returned, plus how many campaigns have delivered.
 *
 * The SRS requires a public dashboard for these figures and nothing rendered them anywhere. This is
 * the natural home: `/campaigns` is where a sceptical reader lands, and four numbers are a better
 * argument than four paragraphs. So it is drawn as the anchor of the page rather than as a stat row —
 * the deep forest band is the token's licensed use (globals.css) and the one place on a product screen
 * where a block earns that much weight.
 *
 * The allocation bar is the part that does real work. Three totals are three facts; one bar showing
 * what proportion of every pound contributed is still held, has been released, and has gone back is a
 * picture of how the mechanic behaves in practice, which is the thing a first-time reader is actually
 * trying to work out. Every segment is labelled in text as well as colour (WCAG 1.4.1), and the
 * segments are separated by a gap so their boundaries do not depend on hue.
 *
 * The caption is not decoration. FR-803 makes the indexer the source of truth for these figures, and a
 * reader who cannot check a number should at least be told where it comes from.
 *
 * "Returned to backers" sits beside the other three at the same weight, deliberately. A refund total is
 * not an embarrassment on this product; it is the only evidence the guarantee is real.
 */
export function EscrowSummary({ summary }: { summary: Summary }) {
  const total = summary.held + summary.released + summary.refunded;
  const share = (n: number) => (total > 0 ? clamp01(n / total) * 100 : 0);

  const segments = [
    { key: 'held', label: 'Still held', value: summary.held, fill: 'bg-accent-100' },
    { key: 'released', label: 'Released', value: summary.released, fill: 'bg-accent-500' },
    { key: 'refunded', label: 'Returned', value: summary.refunded, fill: 'bg-white/40' },
  ].filter((s) => s.value > 0);

  return (
    <section
      aria-labelledby="escrow-heading"
      className="overflow-hidden rounded-2xl bg-forest px-5 py-6 text-white sm:px-7 sm:py-7"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2
          id="escrow-heading"
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-100"
        >
          Escrow, right now
        </h2>
        <p className="text-xs text-white/55">
          Across <Count value={summary.raising + summary.delivered + summary.refundedCampaigns} />{' '}
          campaigns
        </p>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4 lg:gap-x-8">
        <Figure label="Held in escrow" hint="Not yet released to anyone">
          <Amount value={summary.held} currency="USD" />
        </Figure>
        <Figure label="Released to creators" hint="Stages backers reviewed and passed" accent>
          <Amount value={summary.released} currency="USD" />
        </Figure>
        <Figure label="Returned to backers" hint="Stages that were not delivered">
          <Amount value={summary.refunded} currency="USD" />
        </Figure>
        <Figure label="Campaigns delivered" hint="Every stage claimed and released">
          <Count value={summary.delivered} />
        </Figure>
      </dl>

      {total > 0 && (
        <div className="mt-7">
          <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
            {segments.map((s) => (
              <div key={s.key} className={s.fill} style={{ width: `${share(s.value)}%` }} />
            ))}
          </div>

          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            {segments.map((s) => (
              <li key={s.key} className="flex items-center gap-1.5 text-xs text-white/70">
                <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${s.fill}`} />
                {s.label}
                <span className="font-semibold text-white tabular-nums">
                  {Math.round(share(s.value))}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-6 border-t border-white/12 pt-4 text-xs leading-relaxed text-white/55">
        Every figure here comes from the receipts on each campaign, not from our own records.
      </p>
    </section>
  );
}

function Figure({
  label,
  hint,
  accent = false,
  children,
}: {
  label: string;
  hint: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dd
        className={`font-display text-2xl font-bold tracking-tight sm:text-[28px] ${
          accent ? 'text-accent-100' : 'text-white'
        }`}
      >
        {children}
      </dd>
      <dt className="mt-1 text-xs font-medium text-white/85">{label}</dt>
      <p className="mt-0.5 text-[11px] leading-snug text-white/50">{hint}</p>
    </div>
  );
}
