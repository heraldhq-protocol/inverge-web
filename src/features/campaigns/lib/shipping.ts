import type {
  CountryCode,
  RewardFulfilment,
  RewardShipping,
  ShippingCoverage,
  ShippingRate,
  ShippingRule,
  ShippingZone,
  SupportTier,
} from "@/features/campaigns/types";
import { countryName } from "@/lib/countries";
import { formatMoney, scaleMoneyAmount, type MoneyAmount } from "@/lib/money";

/**
 * Reward shipping rules.
 *
 * The one thing this module must never do is produce a price Inverge did not get
 * from the creator. There is no carrier integration and no rate table, so every
 * figure here either comes from a rule the creator wrote or does not exist: an
 * uncovered destination is reported as uncovered, and a policy that defers the
 * cost says so instead of quietly falling back to a number.
 *
 * Rules are ordered and the first match wins. That is the whole mechanism behind
 * an exclusion — "Brazil: we cannot ship there" placed above "everywhere"
 * excludes Brazil, and no later rule can overrule it. It is also why the model
 * has no separate "excluded destinations" list: an exclusion is a rule, so it
 * cannot drift out of step with the rules that price the destinations it sits
 * among.
 */

/** Whether a reward includes something that has to travel by post. */
export function hasPhysicalPart(fulfilment: RewardFulfilment | null): boolean {
  return fulfilment === "physical" || fulfilment === "mixed";
}

function zoneById(
  shipping: RewardShipping,
  zoneId: string,
): ShippingZone | null {
  return shipping.zones.find((zone) => zone.id === zoneId) ?? null;
}

/**
 * The country name for display, falling back to the stored code.
 *
 * The fallback is not decoration: a code can only reach the model after passing
 * `normaliseCountryCode`, so the branch is unreachable in practice — but a
 * name is never worth a blank where a destination should be.
 */
export function destinationName(country: CountryCode): string {
  return countryName(country) ?? country;
}

function coverageMatches(
  coverage: ShippingCoverage,
  shipping: RewardShipping,
  country: CountryCode,
): boolean {
  switch (coverage.kind) {
    case "worldwide":
      return true;
    case "country":
      return coverage.country === country;
    case "origin":
      // No stated origin means no destination is "inside my country"; a guess
      // here would silently apply the cheapest rate to everybody.
      return (
        shipping.originCountry !== null && shipping.originCountry === country
      );
    case "zone":
      // A rule pointing at a zone that no longer exists matches nothing rather
      // than everything, so a deleted zone cannot widen a policy.
      return (
        zoneById(shipping, coverage.zoneId)?.countries.includes(country) ??
        false
      );
  }
}

/** The first rule that applies to a destination, or null when none does. */
export function resolveShippingRule(
  shipping: RewardShipping,
  country: CountryCode,
): ShippingRule | null {
  return (
    shipping.rules.find((rule) =>
      coverageMatches(rule.coverage, shipping, country),
    ) ?? null
  );
}

/**
 * How many physical units an order contains.
 *
 * A reward that ships adds one unit per copy taken, and an add-on the creator
 * marked as needing its own parcel adds one more. Add-ons that do not affect
 * shipping — every digital one — add nothing, which is what keeps a download
 * from being charged postage. The count only matters to a per-unit rate; a
 * per-order rate ignores it, because the creator said that price is for the
 * whole order.
 */
export function shippedUnits(
  tier: SupportTier,
  quantity: number,
  addOnIds: readonly string[],
): number {
  const rewardUnits = hasPhysicalPart(tier.fulfilment) ? quantity : 0;
  const addOnUnits = tier.addOns.filter(
    (addOn) => addOn.affectsShipping && addOnIds.includes(addOn.id),
  ).length;

  return rewardUnits + addOnUnits;
}

/**
 * What postage costs for one destination, or why it cannot be worked out.
 *
 * `unsupported` is a result, not an error: the creator's policy genuinely does
 * not reach the destination, and the flow has to say so and stop rather than
 * substitute a default. The two causes are kept apart because they need
 * different words — one destination was never covered, the other was explicitly
 * refused, and the second usually has the creator's own explanation attached.
 */
export type ShippingOutcome =
  | { kind: "not-required" }
  | { kind: "unchosen" }
  | { kind: "free" }
  | { kind: "quoted"; amount: MoneyAmount }
  | { kind: "deferred"; note: string | null }
  | {
      kind: "unsupported";
      cause: "not-covered" | "excluded";
      note: string | null;
    };

export function resolveShipping(
  shipping: RewardShipping | null,
  country: CountryCode | null,
  units: number,
): ShippingOutcome {
  if (shipping === null) return { kind: "not-required" };
  if (country === null) return { kind: "unchosen" };

  const rule = resolveShippingRule(shipping, country);
  if (rule === null) {
    return { kind: "unsupported", cause: "not-covered", note: null };
  }

  return rateOutcome(rule.rate, units);
}

function rateOutcome(rate: ShippingRate, units: number): ShippingOutcome {
  switch (rate.kind) {
    case "free":
      return { kind: "free" };
    case "flat":
      return {
        amount:
          rate.basis === "unit"
            ? scaleMoneyAmount(rate.amount, Math.max(units, 0))
            : rate.amount,
        kind: "quoted",
      };
    case "deferred":
      return { kind: "deferred", note: rate.note };
    case "unavailable":
      return { kind: "unsupported", cause: "excluded", note: rate.note };
  }
}

/** True when the destination can be served, whatever it costs. */
export function destinationSupported(
  shipping: RewardShipping | null,
  country: CountryCode | null,
): boolean {
  if (shipping === null) return true;

  const outcome = resolveShipping(shipping, country, 1);
  return outcome.kind !== "unsupported" && outcome.kind !== "unchosen";
}

/**
 * A rule's coverage in words, for a card, a summary, or the creator's own list.
 *
 * An unresolved zone is named as unresolved rather than as its id: the creator
 * should see the row that no longer works, not `zone-3`.
 */
export function describeCoverage(
  coverage: ShippingCoverage,
  shipping: RewardShipping,
): string {
  switch (coverage.kind) {
    case "worldwide":
      return "Everywhere";
    case "country":
      return destinationName(coverage.country);
    case "origin":
      return shipping.originCountry === null
        ? "Inside your country"
        : `Inside ${destinationName(shipping.originCountry)}`;
    case "zone":
      return (
        zoneById(shipping, coverage.zoneId)?.name ??
        "A zone that no longer exists"
      );
  }
}

/** A rule's price in words — never a figure the rate does not carry. */
export function describeRate(rate: ShippingRate): string {
  switch (rate.kind) {
    case "free":
      return "Free";
    case "flat":
      return rate.basis === "unit"
        ? `${formatMoney(rate.amount)} per item`
        : `${formatMoney(rate.amount)} per order`;
    case "deferred":
      return "Postage billed later";
    case "unavailable":
      return "We cannot ship here";
  }
}

export type ShippingSummaryEntry = {
  coverage: string;
  rate: string;
  /** True when the rule refuses the destination rather than sending to it. */
  excluded: boolean;
};

/**
 * The policy as a short list, in the creator's own priority order.
 *
 * This is what a reward card can show without a destination: the rules
 * themselves. It never collapses them into "ships worldwide for $15", because
 * whether the worldwide rule or the flat rate applies depends on where the
 * backer is, and the card does not know that yet.
 */
export function shippingSummary(
  shipping: RewardShipping,
): readonly ShippingSummaryEntry[] {
  return shipping.rules.map((rule) => ({
    coverage: describeCoverage(rule.coverage, shipping),
    excluded: rule.rate.kind === "unavailable",
    rate: describeRate(rule.rate),
  }));
}

/**
 * True when nothing in the policy can produce a figure — every rule defers the
 * cost. The flow uses this to say that postage will be arranged separately
 * instead of implying a price is coming.
 */
export function shippingIsEntirelyDeferred(shipping: RewardShipping): boolean {
  return (
    shipping.rules.length > 0 &&
    shipping.rules.every((rule) => rule.rate.kind === "deferred")
  );
}
