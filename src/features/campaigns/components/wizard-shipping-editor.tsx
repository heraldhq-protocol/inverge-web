"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  InformationCircleIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";

import { CountrySelect } from "@/components/ui/country-select";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  createDraftShippingRule,
  createDraftShippingZone,
  shippingCoverageNote,
  type DraftIssue,
  type DraftShippingCoverage,
  type DraftShippingRateKind,
  type DraftShippingRule,
  type DraftShippingZone,
  type DraftSupportTier,
} from "@/features/campaigns/lib/wizard";
import { countryName } from "@/lib/countries";
import type { ReactNode } from "react";

/**
 * Where a reward ships, and what it costs to send it there.
 *
 * The rules are an ordered list rather than a set of destination fields, and the
 * ordering is the point: the first rule that matches a destination wins, so
 * "Brazil — we cannot ship here" placed above "Everywhere" is an exclusion, and
 * no later rule can overrule it. That is why the editor shows the order, gives
 * each row move controls, and reports a rule that sits below one covering
 * everywhere as an error — it can never apply, and a creator who wrote it
 * believes something that is not true.
 *
 * Nothing here prices anything Inverge cannot know. There are no weights and no
 * carrier integration, so the price models are the ones the domain actually
 * supports: free, a flat rate the creator sets for the order or for each item,
 * postage billed later, and "we cannot ship here". A creator who does not know
 * the cost yet says so, and the backer is told postage is not yet known rather
 * than shown a number Inverge made up.
 */
const COVERAGE_OPTIONS = [
  { label: "Everywhere", value: "worldwide" },
  { label: "A zone", value: "zone" },
  { label: "One country", value: "country" },
  { label: "My own country", value: "origin" },
] as const;

const RATE_OPTIONS: readonly {
  label: string;
  value: DraftShippingRateKind;
}[] = [
  { label: "Free — I charge no postage", value: "free" },
  { label: "A flat rate", value: "flat" },
  { label: "Billed later", value: "deferred" },
  { label: "We cannot ship here", value: "unavailable" },
];

const BASIS_OPTIONS = [
  { label: "Per order", value: "order" },
  { label: "For each item", value: "unit" },
] as const;

/**
 * Coverage after the creator switches which kind it is.
 *
 * The previous choice is carried across when it is still meaningful — switching
 * between "a zone" and "one country" and back should not lose the zone that was
 * picked — and dropped when it is not, so a country rule can never end up
 * carrying a stale zone id.
 */
function coverageFor(
  kind: DraftShippingCoverage["kind"],
  current: DraftShippingCoverage,
  fallbackZoneId: string,
): DraftShippingCoverage {
  switch (kind) {
    case "worldwide":
      return { kind: "worldwide" };
    case "origin":
      return { kind: "origin" };
    case "country":
      return {
        country: current.kind === "country" ? current.country : "",
        kind: "country",
      };
    case "zone":
      return {
        kind: "zone",
        zoneId: current.kind === "zone" ? current.zoneId : fallbackZoneId,
      };
  }
}

function RoundButton({
  disabled = false,
  label,
  onClick,
  children,
}: {
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-grid size-11 shrink-0 place-items-center rounded-lg border border-border bg-surface text-muted transition-colors hover:border-brand/40 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted"
    >
      {children}
    </button>
  );
}

function IssueList({ messages }: { messages: readonly string[] }) {
  if (messages.length === 0) return null;

  return (
    <ul className="mt-2 space-y-1">
      {messages.map((message) => (
        <li key={message} className="text-xs font-medium text-danger">
          {message}
        </li>
      ))}
    </ul>
  );
}

export function WizardShippingEditor({
  base,
  issues,
  onChange,
  tier,
}: {
  /** The field prefix every issue for this reward is reported under. */
  base: string;
  issues: readonly DraftIssue[];
  onChange: (patch: Partial<DraftSupportTier>) => void;
  tier: DraftSupportTier;
}) {
  const zones = tier.shippingZones;
  const rules = tier.shippingRules;
  const coverageNote = shippingCoverageNote(tier);

  const messagesFor = (field: string) =>
    issues
      .filter((issue) => issue.field === field)
      .map((issue) => issue.message);

  function patchRule(ruleId: string, changes: Partial<DraftShippingRule>) {
    onChange({
      shippingRules: rules.map((rule) =>
        rule.id === ruleId ? { ...rule, ...changes } : rule,
      ),
    });
  }

  function moveRule(index: number, step: -1 | 1) {
    const target = index + step;
    const moving = rules[index];
    const displaced = rules[target];
    if (!moving || !displaced) return;

    const reordered = [...rules];
    reordered[index] = displaced;
    reordered[target] = moving;
    onChange({ shippingRules: reordered });
  }

  function patchZone(zoneId: string, changes: Partial<DraftShippingZone>) {
    onChange({
      shippingZones: zones.map((zone) =>
        zone.id === zoneId ? { ...zone, ...changes } : zone,
      ),
    });
  }

  return (
    <div className="mt-3 space-y-4 rounded-xl border border-border bg-surface p-3.5">
      <p className="flex items-start gap-2 text-xs leading-5 text-muted">
        <HugeiconsIcon
          icon={InformationCircleIcon}
          size={14}
          strokeWidth={1.9}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-brand-strong"
        />
        <span>
          Say where this reward goes and what it costs to send. Rules are
          checked from the top down and the first one that matches a
          backer&rsquo;s country wins, which is how an exception works: put
          &ldquo;Brazil — we cannot ship here&rdquo; above
          &ldquo;Everywhere&rdquo; and Brazil is refused. Inverge has no carrier
          integration and holds no postage table, so every figure here is yours
          — it is never estimated, confirmed, or guessed for you.
        </span>
      </p>

      <Field
        label="Where do you post from?"
        help="Optional. Used by a rule that covers your own country."
      >
        {({ describedBy, id, invalid }) => (
          <CountrySelect
            {...(describedBy ? { describedBy } : {})}
            id={id}
            invalid={invalid}
            value={tier.shippingOriginCountry}
            onChange={(code) => onChange({ shippingOriginCountry: code })}
          />
        )}
      </Field>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-ink">
            Zones{" "}
            <span className="text-xs font-normal text-muted">
              optional groups of countries
            </span>
          </p>
          <button
            type="button"
            onClick={() =>
              onChange({ shippingZones: [...zones, createDraftShippingZone()] })
            }
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={PlusSignIcon}
              size={14}
              strokeWidth={2}
              aria-hidden="true"
              className="text-muted"
            />
            Add a zone
          </button>
        </div>

        {zones.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-border-strong bg-canvas px-3.5 py-3 text-xs leading-5 text-muted">
            No zones. A rule can still name one country, your own country, or
            everywhere — add a zone when the same price covers a group of
            countries, such as West Africa.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {zones.map((zone, index) => (
              <li
                key={zone.id}
                className="rounded-xl border border-border bg-canvas p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                    Zone {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        shippingZones: zones.filter(
                          (item) => item.id !== zone.id,
                        ),
                      })
                    }
                    className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      size={13}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    Remove zone
                  </button>
                </div>

                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <Field label="Zone name">
                    {({ describedBy, id, invalid }) => (
                      <Input
                        id={id}
                        autoComplete="off"
                        placeholder="e.g. West Africa"
                        value={zone.name}
                        aria-describedby={describedBy || undefined}
                        aria-invalid={invalid || undefined}
                        onChange={(event) =>
                          patchZone(zone.id, { name: event.target.value })
                        }
                      />
                    )}
                  </Field>

                  <Field label="Add a country">
                    {({ describedBy, id, invalid }) => (
                      <CountrySelect
                        {...(describedBy ? { describedBy } : {})}
                        id={id}
                        invalid={invalid}
                        value=""
                        onChange={(code) =>
                          patchZone(zone.id, {
                            countries: zone.countries.includes(code)
                              ? [...zone.countries]
                              : [...zone.countries, code],
                          })
                        }
                      />
                    )}
                  </Field>
                </div>

                {zone.countries.length === 0 ? (
                  <p className="mt-2 text-xs text-muted">
                    No countries in this zone yet.
                  </p>
                ) : (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {zone.countries.map((code) => {
                      const name = countryName(code) ?? code;

                      return (
                        <li key={code}>
                          <button
                            type="button"
                            aria-label={`Remove ${name} from this zone`}
                            onClick={() =>
                              patchZone(zone.id, {
                                countries: zone.countries.filter(
                                  (country) => country !== code,
                                ),
                              })
                            }
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 text-xs font-medium text-ink transition-colors hover:border-danger/40 hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                          >
                            {name}
                            <HugeiconsIcon
                              icon={Cancel01Icon}
                              size={12}
                              strokeWidth={2}
                              aria-hidden="true"
                              className="text-muted"
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <IssueList messages={messagesFor(`${base}.zones.${zone.id}`)} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-ink">
            Rules{" "}
            <span className="text-xs font-normal text-muted">
              checked top to bottom
            </span>
          </p>
          <button
            type="button"
            onClick={() =>
              onChange({
                shippingRules: [...rules, createDraftShippingRule()],
              })
            }
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={PlusSignIcon}
              size={14}
              strokeWidth={2}
              aria-hidden="true"
              className="text-muted"
            />
            Add a rule
          </button>
        </div>

        {rules.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-border-strong bg-canvas px-3.5 py-3 text-xs leading-5 text-muted">
            No rules yet. This reward ships, so it needs at least one to say
            where it goes.
          </p>
        ) : (
          <ol className="mt-2 space-y-2">
            {rules.map((rule, index) => (
              <li
                key={rule.id}
                className="rounded-xl border border-border bg-canvas p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                    Rule {index + 1}
                    {index === 0 ? " — checked first" : ""}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <RoundButton
                      disabled={index === 0}
                      label={`Move rule ${index + 1} up`}
                      onClick={() => moveRule(index, -1)}
                    >
                      <HugeiconsIcon
                        icon={ArrowUp01Icon}
                        size={15}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </RoundButton>
                    <RoundButton
                      disabled={index === rules.length - 1}
                      label={`Move rule ${index + 1} down`}
                      onClick={() => moveRule(index, 1)}
                    >
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        size={15}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </RoundButton>
                    <RoundButton
                      label={`Remove rule ${index + 1}`}
                      onClick={() =>
                        onChange({
                          shippingRules: rules.filter(
                            (item) => item.id !== rule.id,
                          ),
                        })
                      }
                    >
                      <HugeiconsIcon
                        icon={Cancel01Icon}
                        size={15}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </RoundButton>
                  </div>
                </div>

                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <Field label="Covers">
                    {({ id, invalid }) => (
                      <Select
                        id={id}
                        value={rule.coverage.kind}
                        options={COVERAGE_OPTIONS.map((option) => ({
                          label: option.label,
                          value: option.value,
                        }))}
                        onValueChange={(value) =>
                          patchRule(rule.id, {
                            coverage: coverageFor(
                              value as DraftShippingCoverage["kind"],
                              rule.coverage,
                              zones[0]?.id ?? "",
                            ),
                          })
                        }
                        className={invalid ? "[&>button]:border-danger" : ""}
                      />
                    )}
                  </Field>

                  {rule.coverage.kind === "zone" ? (
                    <Field label="Which zone">
                      {({ id, invalid }) => (
                        <Select
                          id={id}
                          placeholder={
                            zones.length === 0
                              ? "Add a zone first"
                              : "Choose a zone"
                          }
                          value={
                            rule.coverage.kind === "zone"
                              ? rule.coverage.zoneId
                              : ""
                          }
                          options={zones.map((zone) => ({
                            label: zone.name.trim() || "Unnamed zone",
                            value: zone.id,
                          }))}
                          onValueChange={(zoneId) =>
                            patchRule(rule.id, {
                              coverage: { kind: "zone", zoneId },
                            })
                          }
                          className={invalid ? "[&>button]:border-danger" : ""}
                        />
                      )}
                    </Field>
                  ) : null}

                  {rule.coverage.kind === "country" ? (
                    <Field label="Which country">
                      {({ describedBy, id, invalid }) => (
                        <CountrySelect
                          {...(describedBy ? { describedBy } : {})}
                          id={id}
                          invalid={invalid}
                          value={
                            rule.coverage.kind === "country"
                              ? rule.coverage.country
                              : ""
                          }
                          onChange={(code) =>
                            patchRule(rule.id, {
                              coverage: { country: code, kind: "country" },
                            })
                          }
                        />
                      )}
                    </Field>
                  ) : null}

                  <Field label="Postage">
                    {({ id, invalid }) => (
                      <Select
                        id={id}
                        value={rule.rateKind}
                        options={RATE_OPTIONS.map((option) => ({
                          label: option.label,
                          value: option.value,
                        }))}
                        onValueChange={(value) =>
                          patchRule(rule.id, {
                            rateKind: value as DraftShippingRateKind,
                          })
                        }
                        className={invalid ? "[&>button]:border-danger" : ""}
                      />
                    )}
                  </Field>

                  {rule.rateKind === "flat" ? (
                    <>
                      <Field
                        label="Amount (USDC)"
                        help="Your own rate. It is published as the price for this destination."
                      >
                        {({ describedBy, id, invalid }) => (
                          <Input
                            id={id}
                            inputMode="decimal"
                            autoComplete="off"
                            placeholder="0.00"
                            value={rule.amountInput}
                            aria-describedby={describedBy || undefined}
                            aria-invalid={invalid || undefined}
                            onChange={(event) =>
                              patchRule(rule.id, {
                                amountInput: event.target.value,
                              })
                            }
                          />
                        )}
                      </Field>

                      <Field
                        label="Charged"
                        help="Per order is one price for the whole parcel. For each item multiplies by the number of items posted."
                      >
                        {({ id, invalid }) => (
                          <Select
                            id={id}
                            value={rule.basis}
                            options={BASIS_OPTIONS.map((option) => ({
                              label: option.label,
                              value: option.value,
                            }))}
                            onValueChange={(value) =>
                              patchRule(rule.id, {
                                basis: value as DraftShippingRule["basis"],
                              })
                            }
                            className={
                              invalid ? "[&>button]:border-danger" : ""
                            }
                          />
                        )}
                      </Field>
                    </>
                  ) : null}
                </div>

                {rule.rateKind === "deferred" ? (
                  <div className="mt-3">
                    <Field
                      label="How the postage is arranged"
                      help="Shown to the backer word for word. They are told postage is not known yet rather than given a number."
                    >
                      {({ describedBy, id, invalid }) => (
                        <Input
                          id={id}
                          autoComplete="off"
                          placeholder="e.g. I will send a quote once the run is boxed"
                          value={rule.note}
                          aria-describedby={describedBy || undefined}
                          aria-invalid={invalid || undefined}
                          onChange={(event) =>
                            patchRule(rule.id, { note: event.target.value })
                          }
                        />
                      )}
                    </Field>
                  </div>
                ) : null}

                {rule.rateKind === "unavailable" ? (
                  <div className="mt-3">
                    <Field
                      label="Why you cannot ship here"
                      help="Shown to the backer with the refusal, so a blocked destination is explained rather than a dead end."
                    >
                      {({ describedBy, id, invalid }) => (
                        <Input
                          id={id}
                          autoComplete="off"
                          placeholder="e.g. customs in this country has returned every parcel"
                          value={rule.note}
                          aria-describedby={describedBy || undefined}
                          aria-invalid={invalid || undefined}
                          onChange={(event) =>
                            patchRule(rule.id, { note: event.target.value })
                          }
                        />
                      )}
                    </Field>
                  </div>
                ) : null}

                <IssueList messages={messagesFor(`${base}.rules.${rule.id}`)} />
              </li>
            ))}
          </ol>
        )}

        <IssueList messages={messagesFor(`${base}.shipping`)} />

        {coverageNote ? (
          <p className="mt-2 rounded-xl border border-warning/30 bg-warning/[0.07] px-3.5 py-3 text-xs leading-5 text-muted">
            {coverageNote}
          </p>
        ) : null}
      </div>

      <Field
        label="Fulfilment terms"
        help="Optional. How and when you post, and anything else a backer should know."
      >
        {({ describedBy, id, invalid }) => (
          <Input
            id={id}
            autoComplete="off"
            placeholder="e.g. posted from Lagos within four weeks of the deadline"
            value={tier.shippingTerms}
            aria-describedby={describedBy || undefined}
            aria-invalid={invalid || undefined}
            onChange={(event) =>
              onChange({ shippingTerms: event.target.value })
            }
          />
        )}
      </Field>

      <Field
        label="Import duty, in your words"
        help="Optional. What a backer in another country should expect at the border. Inverge calculates no duty and collects none, so this is quoted, never a figure."
      >
        {({ describedBy, id, invalid }) => (
          <Input
            id={id}
            autoComplete="off"
            placeholder="e.g. duty is the recipient's responsibility"
            value={tier.shippingCustoms}
            aria-describedby={describedBy || undefined}
            aria-invalid={invalid || undefined}
            onChange={(event) =>
              onChange({ shippingCustoms: event.target.value })
            }
          />
        )}
      </Field>
    </div>
  );
}
