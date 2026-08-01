'use client';

import { Amount, Count } from '@/components/ui/amount';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Meter } from '@/components/ui/meter';
import { Pill } from '@/components/ui/pill';
import type { EligibleIdea } from '@/lib/campaigns/my-ideas';

/**
 * Step one: which validated idea this campaign comes from.
 *
 * A campaign always starts as an idea that strangers said was worth building. That is the whole
 * sequence the product sells, so the flow begins by making a creator point at the evidence rather
 * than at a blank form.
 *
 * **Ideas that have not cleared the gate are listed, not hidden**, with exactly what is short. Hiding
 * them leaves a creator on an empty screen with no idea why, and FR-271a is explicit that the gate
 * coaches rather than rejects. They cannot be selected — the API returns 403 for an idea that has not
 * met FR-204, so offering it would be offering something that cannot work.
 */
export function StepIdea({
  ideas,
  selectedId,
  standalone,
  error,
  onSelect,
  onStandalone,
}: {
  ideas: EligibleIdea[];
  selectedId: string | null;
  standalone: boolean;
  error?: string;
  onSelect: (id: string) => void;
  onStandalone: () => void;
}) {
  const ready = ideas.filter((i) => i.ready);
  const notReady = ideas.filter((i) => !i.ready);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-xl font-bold tracking-tight text-ink">
          Which idea is this campaign for?
        </h2>
        <p className="mt-1.5 max-w-[68ch] text-sm leading-relaxed text-ink-muted">
          A campaign usually starts from an idea that cleared validation. Its supporters carry over,
          so you launch to people who already said they wanted this.
        </p>
      </header>

      {ideas.length === 0 && (
        <EmptyState
          title="You do not have an idea that has cleared validation yet."
          body="Publishing one is free, and it means launching to people who already want this. You can also raise without one."
          actions={
            <Button variant="outline" size="md" href="/ideas/new">
              Start an idea
            </Button>
          }
        />
      )}

      {ready.length > 0 && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-ink">Ready to raise</legend>
          {ready.map((idea) => (
            <IdeaOption
              key={idea.id}
              idea={idea}
              selected={!standalone && selectedId === idea.id}
              onSelect={onSelect}
            />
          ))}
        </fieldset>
      )}

      {/* Raising without validating first is allowed and is not hidden. What it is not is presented as
          equivalent: the trade is stated in the option itself, so a creator chooses it knowing what
          they are giving up rather than discovering it on a quiet campaign page. */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-ink">Or raise without an idea</legend>
        <Card
          className={[
            'p-0 transition-colors',
            standalone ? 'border-accent-500 bg-accent-50' : 'hover:border-accent-500/40',
          ].join(' ')}
        >
          <label className="flex cursor-pointer items-start gap-3 p-4">
            <input
              type="radio"
              name="campaign-idea"
              value="standalone"
              checked={standalone}
              onChange={onStandalone}
              className="mt-1 h-4 w-4 shrink-0 accent-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
            />
            <span className="min-w-0 flex-1">
              <span className="font-display text-base font-bold tracking-tight text-ink">
                Start this campaign from scratch
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-ink-muted">
                For when you already have people waiting and do not need to find out whether anyone
                wants this.
              </span>
              <span className="mt-2 block text-xs leading-relaxed text-ink-muted">
                <span className="font-medium text-ink">What you give up:</span> no supporters carried
                over, no validation evidence on your page, and reviewers have less to go on. You will
                also write the title and summary yourself, since there is no idea to take them from.
              </span>
            </span>
          </label>
        </Card>
      </fieldset>

      {notReady.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-ink">Still being validated</h3>
          {notReady.map((idea) => (
            <NotReadyRow key={idea.id} idea={idea} />
          ))}
        </section>
      )}

      {error && (
        <p className="text-sm font-medium text-danger-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function IdeaOption({
  idea,
  selected,
  onSelect,
}: {
  idea: EligibleIdea;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <Card
      className={[
        'p-0 transition-colors',
        selected ? 'border-accent-500 bg-accent-50' : 'hover:border-accent-500/40',
      ].join(' ')}
    >
      <label className="flex cursor-pointer items-start gap-3 p-4">
        <input
          type="radio"
          name="campaign-idea"
          value={idea.id}
          checked={selected}
          onChange={() => onSelect(idea.id)}
          className="mt-1 h-4 w-4 shrink-0 accent-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
        />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-base font-bold tracking-tight text-ink">
              {idea.title}
            </span>
            <Pill tone="accent" size="xs" marker={<span aria-hidden="true">✓</span>}>
              Threshold met
            </Pill>
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-ink-muted">{idea.problem}</span>
          <span className="mt-2 block text-xs text-ink-muted">
            <Count value={idea.supporterCount} /> supporters · asked for{' '}
            <Amount value={idea.askAmount} currency="USD" />
          </span>
        </span>
      </label>
    </Card>
  );
}

function NotReadyRow({ idea }: { idea: EligibleIdea }) {
  return (
    <Card tone="quiet" className="p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4 className="font-display text-base font-bold tracking-tight text-ink">{idea.title}</h4>
        <span className="text-xs text-ink-muted tabular-nums">
          {Math.round(idea.progress * 100)}% to the threshold
        </span>
      </div>

      <Meter
        ratio={idea.progress}
        tone="neutral"
        size="sm"
        className="mt-2"
        srLabel="to the validation threshold"
      />

      {idea.missing.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-ink-muted">
          {idea.missing.map((c) => (
            <li key={c.key}>
              <span className="font-medium text-ink">{c.label}:</span>{' '}
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
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-xs leading-relaxed text-ink-muted">
        This one is not ready to raise yet. Nothing is wrong with it: the threshold exists so a
        campaign launches to people who already want it.
      </p>
    </Card>
  );
}
