'use client';

import { Amount } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Field, controlClass } from '@/components/ui/field';
import { Pill } from '@/components/ui/pill';
import {
  emptyReward,
  type CampaignDraft,
  type DraftErrors,
  type RewardDraft,
} from '@/lib/campaigns/campaign-draft';
import { parseDecimal } from '@/lib/format';

const MAX_TIERS = 8;

const SHIPPING_LABEL: Record<RewardDraft['shipping'], string> = {
  NOTHING_TO_SHIP: 'Nothing to post',
  REGION_ONLY: 'Within my region only',
  WORLDWIDE: 'Anywhere in the world',
};

/**
 * Rewards: what a backer gets for pledging at a given level. Optional (FR-301), and genuinely so.
 *
 * It comes **after** the stages, deliberately. The stages are what releases money and what backers
 * judge; rewards are a thank-you attached to a pledge level. Asking for rewards first would teach a
 * creator that this is a shop with a delivery schedule bolted on, which is the opposite of the
 * product. A creator can skip the step entirely and most of the campaigns this platform is for
 * probably should: a campaign to automate vendor payouts has nothing to post to anyone.
 *
 * From the reference (teardown §5.2) we take two things and refuse the rest. The scarcity line
 * ("44 left of 250") is the honest way to render a cap, and the per-tier delivery date belongs beside
 * the price because it is the promise being judged. Add-ons and stretch goals do not appear: add-ons
 * are a shop's upsell, and stretch goals are excluded permanently.
 *
 * The warning under the delivery field is the important copy on this screen. On Kickstarter a missed
 * delivery date is between a creator and their backers. Here backers already hold a lever over the
 * money, and a creator who does not understand that rewards are separate from stage release will
 * write dates they cannot keep.
 */
export function StepRewards({
  draft,
  errors,
  onChange,
}: {
  draft: CampaignDraft;
  errors: DraftErrors;
  onChange: (rewards: RewardDraft[]) => void;
}) {
  const { rewards } = draft;

  const update = (key: string, patch: Partial<RewardDraft>) =>
    onChange(rewards.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const add = () => onChange([...rewards, emptyReward(`r${Date.now().toString(36)}`)]);
  const remove = (key: string) => onChange(rewards.filter((r) => r.key !== key));

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">
            What do backers get?
          </h2>
          <Pill size="xs">Optional</Pill>
        </div>
        <p className="mt-1.5 max-w-[68ch] text-sm leading-relaxed text-ink-muted">
          Reward tiers are a thank-you attached to a pledge level. They are separate from your stages:
          a reward never releases money and never changes when a stage pays out. Plenty of good
          campaigns have none at all.
        </p>
      </header>

      {rewards.length === 0 ? (
        <EmptyState
          title="No reward tiers yet."
          body="If you are funding work rather than making something to post, leave this empty and carry on. Nothing about your campaign is weaker for it."
          actions={
            <Button variant="outline" size="md" onClick={add}>
              Add a tier
            </Button>
          }
        />
      ) : (
        <>
          <ol className="space-y-4">
            {rewards.map((r, i) => (
              <li key={r.key}>
                <RewardFields
                  index={i}
                  reward={r}
                  errors={errors}
                  onChange={(patch) => update(r.key, patch)}
                  onRemove={() => remove(r.key)}
                />
              </li>
            ))}
          </ol>

          {errors.duplicate && (
            <p className="text-sm font-medium text-danger-700" role="alert">
              {errors.duplicate}
            </p>
          )}

          {rewards.length < MAX_TIERS && (
            <Button variant="outline" size="md" onClick={add}>
              Add another tier
            </Button>
          )}
        </>
      )}
    </div>
  );
}

function RewardFields({
  index,
  reward,
  errors,
  onChange,
  onRemove,
}: {
  index: number;
  reward: RewardDraft;
  errors: DraftErrors;
  onChange: (patch: Partial<RewardDraft>) => void;
  onRemove: () => void;
}) {
  const err = (field: string) => errors[`${reward.key}.${field}`];
  const amount = parseDecimal(reward.amount);

  const setItem = (i: number, patch: Partial<{ label: string; quantity: string }>) =>
    onChange({ items: reward.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted tabular-nums">
          Tier {index + 1}
          {amount > 0 && (
            <span className="ml-2 font-normal normal-case tracking-normal text-ink">
              <Amount value={amount} currency="USD" />
            </span>
          )}
        </h3>
        <button
          type="button"
          onClick={onRemove}
          className="min-h-8 rounded px-2 text-xs font-medium text-ink-muted transition-colors hover:text-danger-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
        >
          Remove
        </button>
      </div>

      <div className="mt-4 space-y-5">
        <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
          <Field
            label="Tier name"
            help="What a backer scans first. “Two metres of the first run”, not “Tier 2”."
            error={err('title')}
          >
            {({ id, invalid, describedBy }) => (
              <input
                id={id}
                type="text"
                value={reward.title}
                onChange={(e) => onChange({ title: e.target.value })}
                aria-describedby={describedBy || undefined}
                aria-invalid={invalid || undefined}
                className={controlClass(invalid)}
              />
            )}
          </Field>

          <Field label="Pledge amount" error={err('amount')}>
            {({ id, invalid, describedBy }) => (
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted">
                  US$
                </span>
                <input
                  id={id}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={1}
                  value={reward.amount}
                  onChange={(e) => onChange({ amount: e.target.value })}
                  aria-describedby={describedBy || undefined}
                  aria-invalid={invalid || undefined}
                  className={controlClass(invalid, 'pl-12 tabular-nums')}
                />
              </div>
            )}
          </Field>
        </div>

        <Field
          label="What they get"
          help="Concrete and checkable. A backer is deciding between this and the tier above it."
          error={err('description')}
        >
          {({ id, invalid, describedBy }) => (
            <textarea
              id={id}
              rows={2}
              value={reward.description}
              onChange={(e) => onChange({ description: e.target.value })}
              aria-describedby={describedBy || undefined}
              aria-invalid={invalid || undefined}
              className={controlClass(invalid, 'resize-y leading-relaxed')}
            />
          )}
        </Field>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            label="Estimated delivery"
            help="Rendered as a month."
            error={err('estimatedDelivery')}
          >
            {({ id, invalid, describedBy }) => (
              <input
                id={id}
                type="month"
                value={reward.estimatedDelivery.slice(0, 7)}
                onChange={(e) => onChange({ estimatedDelivery: `${e.target.value}-01` })}
                aria-describedby={describedBy || undefined}
                aria-invalid={invalid || undefined}
                className={controlClass(invalid)}
              />
            )}
          </Field>

          <Field
            label="Limit"
            optional
            help="Leave blank for unlimited."
            error={err('limitedQuantity')}
          >
            {({ id, invalid, describedBy }) => (
              <input
                id={id}
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={reward.limitedQuantity}
                onChange={(e) => onChange({ limitedQuantity: e.target.value })}
                aria-describedby={describedBy || undefined}
                aria-invalid={invalid || undefined}
                className={controlClass(invalid, 'tabular-nums')}
              />
            )}
          </Field>

          <Field label="Posting" help="Where you can send this.">
            {({ id, invalid, describedBy }) => (
              <select
                id={id}
                value={reward.shipping}
                onChange={(e) =>
                  onChange({ shipping: e.target.value as RewardDraft['shipping'] })
                }
                aria-describedby={describedBy || undefined}
                className={controlClass(invalid)}
              >
                {(Object.keys(SHIPPING_LABEL) as RewardDraft['shipping'][]).map((s) => (
                  <option key={s} value={s}>
                    {SHIPPING_LABEL[s]}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>

        {/* The one thing a creator must not misunderstand about this screen. */}
        <p className="rounded-lg bg-paper px-3 py-2.5 text-xs leading-relaxed text-ink-muted">
          A delivery date here is a promise to your backers, not a stage. Missing it does not stop a
          stage releasing, and hitting it does not release one early. Your stages are what the money
          moves against.
        </p>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink">
              Items included <span className="text-xs font-normal text-ink-muted">optional</span>
            </p>
            <button
              type="button"
              onClick={() => onChange({ items: [...reward.items, { label: '', quantity: '1' }] })}
              className="min-h-8 rounded-full border border-border px-3 text-[13px] font-medium text-ink transition-colors hover:border-accent-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
            >
              Add an item
            </button>
          </div>

          {reward.items.length > 0 && (
            <ul className="mt-3 space-y-2">
              {reward.items.map((item, i) => (
                <li key={i} className="flex flex-wrap items-start gap-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => setItem(i, { label: e.target.value })}
                    aria-label={`Item ${i + 1} name`}
                    aria-invalid={Boolean(err(`item.${i}`)) || undefined}
                    className={controlClass(Boolean(err(`item.${i}`)), 'flex-1 min-w-[12rem]')}
                  />
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={item.quantity}
                    onChange={(e) => setItem(i, { quantity: e.target.value })}
                    aria-label={`Item ${i + 1} quantity`}
                    className={controlClass(false, 'w-20 tabular-nums')}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onChange({ items: reward.items.filter((_, j) => j !== i) })
                    }
                    className="min-h-11 rounded px-2 text-xs font-medium text-ink-muted transition-colors hover:text-danger-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}
