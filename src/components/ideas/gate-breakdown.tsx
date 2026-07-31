import { Amount, Count } from '@/components/ui/amount';
import { Meter } from '@/components/ui/meter';
import { formatPercent } from '@/lib/format';
import type { GateProgress } from '@/lib/ideas/gate';

/**
 * The four validation criteria, broken out.
 *
 * The reference has one number, so it can put one bar on the page. Our gate is multi-criterion
 * (supporters AND estimated interest AND survey responses AND average rating, then sustained over a
 * window), and a single blended bar would hide which one is short. So the meter above shows the
 * binding constraint and this shows all four (teardown §8.3).
 *
 * Percentages are capped: an idea at eight times the supporter floor is not "at 800%".
 */
export function GateBreakdown({ gate }: { gate: GateProgress }) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">What this idea still needs</h3>
        <p className="text-xs text-ink-muted tabular-nums">
          {gate.metCount} of {gate.criteria.length} met
        </p>
      </div>

      <ul className="space-y-3">
        {gate.criteria.map((c) => (
          <li key={c.key}>
            <Meter
              ratio={c.pct}
              tone={c.met ? 'accent' : 'neutral'}
              size="sm"
              srLabel={`towards the ${c.label.toLowerCase()} threshold`}
              label={
                <>
                  <span className="text-xs font-medium text-ink">{c.label}</span>
                  <span className="text-xs text-ink-muted tabular-nums">
                    {c.money ? (
                      <>
                        <Amount value={c.have} currency="USD" /> of{' '}
                        <Amount value={c.need} currency="USD" />
                      </>
                    ) : (
                      <>
                        <Count value={c.have} /> of <Count value={c.need} />
                      </>
                    )}
                    {c.met && <span className="ml-1.5 font-semibold text-accent-700">met</span>}
                  </span>
                </>
              }
            />
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs leading-relaxed text-ink-muted">
        {gate.meetsThreshold
          ? 'Every threshold is met. The figures also have to hold rather than spike once, so there is a short waiting period before this can become a campaign.'
          : `${gate.binding.label} is the one holding this back, at ${formatPercent(gate.binding.pct)}. Thresholds are set by Inverge and can change, and a creator can also set a higher bar for their own idea.`}
      </p>
    </div>
  );
}
