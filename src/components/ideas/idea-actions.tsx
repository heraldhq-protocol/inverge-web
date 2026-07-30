'use client';

import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Amount } from '@/components/ui/amount';

/**
 * The two signals a reader can leave on an idea: support, and a non-binding pre-pledge (FR-202).
 *
 * Client island inside a Server Component page — only these controls need state, so only these ship to
 * the browser (conventions §3.1).
 *
 * Writes are not connected: this build runs on fixtures. The live calls are
 * `POST/DELETE /ideas/:id/support` and `POST/DELETE /ideas/:id/pre-pledge`, both already shipped on the
 * API, so wiring is one call per action in this file.
 *
 * The line under the pre-pledge control is mandatory and never softened: a pre-pledge must not be able
 * to read as a payment (brief §5.1).
 */
export function IdeaActions({ ideaId }: { ideaId: string }) {
  const amountId = useId();
  const [supporting, setSupporting] = useState(false);
  const [pledged, setPledged] = useState<number | null>(null);
  const [amount, setAmount] = useState('50');
  const [showPledge, setShowPledge] = useState(false);

  const parsed = Number(amount);
  const validAmount = Number.isFinite(parsed) && parsed >= 1;

  return (
    <div className="space-y-3">
      <Button
        variant={supporting ? 'secondary' : 'primary'}
        size="lg"
        className="w-full"
        aria-pressed={supporting}
        onClick={() => setSupporting((v) => !v)}
      >
        {supporting ? 'You support this idea' : 'Support this idea'}
      </Button>

      {pledged === null ? (
        <>
          {!showPledge ? (
            <Button variant="outline" size="md" className="w-full" onClick={() => setShowPledge(true)}>
              Pre-pledge
            </Button>
          ) : (
            <div className="rounded-lg border border-border bg-paper p-3">
              <label htmlFor={amountId} className="block text-xs font-medium text-ink">
                How much would you put in?
              </label>
              <div className="mt-1.5 flex gap-2">
                <div className="relative flex-1">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted"
                  >
                    $
                  </span>
                  <input
                    id={amountId}
                    type="number"
                    inputMode="decimal"
                    min={1}
                    step={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="min-h-11 w-full rounded-lg border border-border bg-surface pl-7 pr-3 text-sm tabular-nums text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  />
                </div>
                <Button
                  variant="primary"
                  size="md"
                  disabled={!validAmount}
                  onClick={() => validAmount && setPledged(parsed)}
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}
          <p className="text-xs leading-relaxed text-ink-muted">
            No money moves yet. This tells the creator you&apos;re in.
          </p>
        </>
      ) : (
        <div className="rounded-lg border border-accent-500/30 bg-accent-50 p-3">
          <p className="text-sm text-ink">
            You pre-pledged <Amount value={pledged} currency="USD" className="font-semibold" />.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            Still no money moved. You can change or withdraw this while the idea is being validated.
          </p>
          <button
            type="button"
            onClick={() => {
              setPledged(null);
              setShowPledge(false);
            }}
            className="mt-2 min-h-11 rounded text-sm font-medium text-accent-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            Withdraw my pre-pledge
          </button>
        </div>
      )}

      <Button variant="outline" size="md" className="w-full" href={`/ideas/${ideaId}?tab=feedback`}>
        Answer the creator&apos;s questions
      </Button>
    </div>
  );
}
